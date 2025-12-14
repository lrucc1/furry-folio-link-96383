/**
 * Utility for sharing images to Instagram with intelligent fallbacks
 * - Uses the Web Share API (with files when supported)
 * - Copies the share caption to the clipboard when native sharing is not available
 * - Always downloads the image so the user can still post manually
 */

import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

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

export const shareToInstagram = async ({ imageBlob, petName, publicUrl }: ShareOptions): Promise<void> => {
  const file = new File([imageBlob], `${petName}-petlinkid.png`, { type: 'image/png' })
  const caption = `Meet ${petName}! 🐾 Officially licensed on PetLinkID ✓ Get yours at PetLinkID.com #PetLinkID #PetLicense ${publicUrl}`

  // Prefer the native share sheet (with files when supported)
  try {
    await triggerHaptic()

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Meet ${petName}!`,
        text: caption,
      })
      return
    }

    if (navigator.share) {
      await navigator.share({
        title: `Meet ${petName}!`,
        text: caption,
        url: publicUrl,
      })
      return
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      // User cancelled, propagate so the UI can respect the decision
      throw error
    }

    console.debug('Share attempt failed, falling back to clipboard + download', error)
  }

  // Fallback: copy caption to clipboard so the user can paste in Instagram, then download image
  await copyCaptionToClipboard(caption)
  downloadImage(imageBlob, petName)
}

export const downloadImage = (blob: Blob, petName: string): void => {
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
}
