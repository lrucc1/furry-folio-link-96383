/**
 * Utility for sharing images to Instagram with intelligent fallbacks
 */

interface ShareOptions {
  imageBlob: Blob
  petName: string
  publicUrl: string
}

export const shareToInstagram = async ({ imageBlob, petName, publicUrl }: ShareOptions): Promise<void> => {
  const file = new File([imageBlob], `${petName}-passport.png`, { type: 'image/png' })
  
  // Detect mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  
  if (isMobile) {
    // Try Instagram deep-link first (mobile only)
    try {
      // Try Web Share API with files (works on mobile)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Meet ${petName}!`,
          text: `Official Pet Passport 🛂 Get yours at PetLinkID.com #PetLinkID #PetPassport`,
        })
        return
      }
    } catch (error) {
      // User cancelled or share failed
      if ((error as Error).name === 'AbortError') {
        throw error // User cancelled, propagate to caller
      }
      console.log('Share API failed, falling back to download', error)
    }
  }
  
  // Fallback: Download the image
  downloadImage(imageBlob, petName)
}

export const downloadImage = (blob: Blob, petName: string): void => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const timestamp = new Date().toISOString().split('T')[0]
  link.download = `${petName}-passport-${timestamp}.png`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}
