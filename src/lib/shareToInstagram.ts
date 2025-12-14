/**
 * Utility for sharing images to Instagram with intelligent fallbacks
 * - Uses native Capacitor Share on iOS/Android for native share sheet
 * - Uses the Web Share API (with files when supported) on web
 * - Copies the share caption to the clipboard when native sharing is not available
 * - Always downloads the image so the user can still post manually
 */

import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { Share } from '@capacitor/share'
import { Filesystem, Directory } from '@capacitor/filesystem'

export type ShareResult = {
  method: 'native' | 'web-share' | 'web-share-url' | 'download'
  captionCopied?: boolean
}

interface ShareOptions {
  imageBlob: Blob
  petName: string
  publicUrl: string
}

const triggerHaptic = async () => {
  if (!Capacitor.isNativePlatform()) return

  try {
    await Haptics.impact({ style: ImpactStyle.Medium })
  } catch (error) {
    console.debug('Haptics unavailable, continuing without tactile feedback', error)
  }
}

const copyCaptionToClipboard = async (caption: string) => {
  if (!navigator.clipboard?.writeText) return false

  try {
    await navigator.clipboard.writeText(caption)
    return true
  } catch (error) {
    console.debug('Clipboard copy failed', error)
    return false
  }
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

const shareNative = async ({ imageBlob, petName, publicUrl }: ShareOptions): Promise<void> => {
  const caption = `Meet ${petName}! 🐾 Officially licensed on PetLinkID ✓ Get yours at PetLinkID.com #PetLinkID #PetLicense ${publicUrl}`
  const fileName = `${petName}-petlinkid-${Date.now()}.png`

  await triggerHaptic()

  // Convert blob to base64 and save to temp file
  const base64Data = await blobToBase64(imageBlob)
  
  const savedFile = await Filesystem.writeFile({
    path: fileName,
    data: base64Data,
    directory: Directory.Cache,
  })

  // Share using native share sheet
  await Share.share({
    title: `Meet ${petName}!`,
    text: caption,
    url: savedFile.uri,
    dialogTitle: 'Share your PetLinkID',
  })

  // Clean up temp file after sharing
  try {
    await Filesystem.deleteFile({
      path: fileName,
      directory: Directory.Cache,
    })
  } catch {
    // Ignore cleanup errors
  }
}

export const shareToInstagram = async ({ imageBlob, petName, publicUrl }: ShareOptions): Promise<ShareResult> => {
  const caption = `Meet ${petName}! 🐾 Officially licensed on PetLinkID ✓ Get yours at PetLinkID.com #PetLinkID #PetLicense ${publicUrl}`

  // Use native Capacitor Share on iOS/Android
  if (Capacitor.isNativePlatform()) {
    try {
      await shareNative({ imageBlob, petName, publicUrl })
      return { method: 'native' }
    } catch (error) {
      if ((error as Error).message?.includes('canceled') || (error as Error).message?.includes('cancelled')) {
        throw error // User cancelled, propagate
      }
      console.debug('Native share failed, falling back to web methods', error)
    }
  }

  // Web fallback: Use Web Share API
  const file = new File([imageBlob], `${petName}-petlinkid.png`, { type: 'image/png' })

  try {
    await triggerHaptic()

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Meet ${petName}!`,
        text: caption,
      })
      return { method: 'web-share' }
    }

    if (navigator.share) {
      await navigator.share({
        title: `Meet ${petName}!`,
        text: caption,
        url: publicUrl,
      })
      return { method: 'web-share-url' }
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw error // User cancelled, propagate
    }
    console.debug('Share attempt failed, falling back to clipboard + download', error)
  }

  // Final fallback: copy caption to clipboard and download image
  const captionCopied = await copyCaptionToClipboard(caption)
  downloadImage(imageBlob, petName)
  return { method: 'download', captionCopied }
}

export const copyImageToClipboard = async (blob: Blob): Promise<boolean> => {
  try {
    if (!navigator.clipboard?.write) return false
    
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob
      })
    ])
    return true
  } catch (error) {
    console.debug('Clipboard image copy failed', error)
    return false
  }
}

const isIOSSafari = (): boolean => {
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua)
  const isWebkit = /WebKit/.test(ua)
  const isNotChrome = !/CriOS/.test(ua) && !/Chrome/.test(ua)
  return isIOS && isWebkit && isNotChrome
}

export const openImageForSaving = (blob: Blob): void => {
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}

export const downloadImage = (blob: Blob, petName: string): 'downloaded' | 'opened' => {
  if (isIOSSafari()) {
    openImageForSaving(blob)
    return 'opened'
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const timestamp = new Date().toISOString().split('T')[0]
  link.download = `${petName}-petlinkid-${timestamp}.png`
  link.href = url
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return 'downloaded'
}
