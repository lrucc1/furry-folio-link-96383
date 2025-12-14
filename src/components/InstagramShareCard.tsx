import { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Instagram, Download, Share2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { shareToInstagram, downloadImage, ShareResult } from '@/lib/shareToInstagram'
import { calculateAge } from '@/lib/age-utils'
import { Capacitor } from '@capacitor/core'
import { format } from 'date-fns'

// Draw Lucide Link2 icon on canvas (matches the actual SVG paths)
const drawLinkIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, withGlow: boolean = false) => {
  ctx.save()
  ctx.translate(x + size / 2, y + size / 2) // Move to center for rotation
  ctx.rotate(Math.PI / 4) // Rotate 45 degrees to match Logo component
  ctx.translate(-size / 2, -size / 2) // Translate back
  
  // Apply glow effect if enabled
  if (withGlow) {
    ctx.shadowColor = 'rgba(46, 155, 141, 0.6)'
    ctx.shadowBlur = 12
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }
  
  const scale = size / 24 // Lucide icons are 24x24 base
  ctx.scale(scale, scale)
  
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  // Lucide Link2 SVG paths (from the actual icon)
  // Path 1: Top-right link
  ctx.beginPath()
  ctx.moveTo(9, 17)
  ctx.lineTo(7, 17)
  ctx.bezierCurveTo(4.24, 17, 2, 14.76, 2, 12)
  ctx.bezierCurveTo(2, 9.24, 4.24, 7, 7, 7)
  ctx.lineTo(9, 7)
  ctx.stroke()
  
  // Path 2: Bottom-left link  
  ctx.beginPath()
  ctx.moveTo(15, 7)
  ctx.lineTo(17, 7)
  ctx.bezierCurveTo(19.76, 7, 22, 9.24, 22, 12)
  ctx.bezierCurveTo(22, 14.76, 19.76, 17, 17, 17)
  ctx.lineTo(15, 17)
  ctx.stroke()
  
  // Path 3: Connecting line
  ctx.beginPath()
  ctx.moveTo(8, 12)
  ctx.lineTo(16, 12)
  ctx.stroke()
  
  ctx.restore()
}
interface InstagramShareCardProps {
  petName: string
  petSpecies: string
  petBreed: string | null
  petColour: string | null
  petWeight: number | null
  petGender: string | null
  petPhoto: string | null
  publicId: string
  publicUrl: string
  dateOfBirth: string | null
}

export const InstagramShareCard = ({
  petName,
  petSpecies,
  petBreed,
  petColour,
  petWeight,
  petGender,
  petPhoto,
  publicId,
  publicUrl,
  dateOfBirth,
}: InstagramShareCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [generating, setGenerating] = useState(false)

  const petAge = dateOfBirth ? calculateAge(dateOfBirth) : null

  // Stories format: 1080x1920
  const WIDTH = 1080
  const HEIGHT = 1920

  const generateLicenseCard = useCallback(async (shimmerOffset: number = 0) => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (shimmerOffset === 0) setGenerating(true)
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = WIDTH
    canvas.height = HEIGHT

    // Background - clean premium gradient
    const bgGradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
    bgGradient.addColorStop(0, '#0f172a')
    bgGradient.addColorStop(0.5, '#1e293b')
    bgGradient.addColorStop(1, '#1e3a5a')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    // Subtle radial glow in center for depth
    const glowGradient = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 0, WIDTH / 2, HEIGHT / 2, 600)
    glowGradient.addColorStop(0, 'rgba(46, 155, 141, 0.08)')
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = glowGradient
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    // Main card dimensions (credit card aspect ratio)
    const cardPadding = 60
    const cardWidth = WIDTH - cardPadding * 2
    const cardHeight = 600
    const cardY = 380
    const cardRadius = 40

    // Card shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
    ctx.shadowBlur = 50
    ctx.shadowOffsetY = 15

    // Card background gradient
    const cardGradient = ctx.createLinearGradient(cardPadding, cardY, cardPadding + cardWidth, cardY + cardHeight)
    cardGradient.addColorStop(0, '#ffffff')
    cardGradient.addColorStop(1, '#f8f9fa')

    // Draw rounded card
    ctx.beginPath()
    ctx.moveTo(cardPadding + cardRadius, cardY)
    ctx.lineTo(cardPadding + cardWidth - cardRadius, cardY)
    ctx.quadraticCurveTo(cardPadding + cardWidth, cardY, cardPadding + cardWidth, cardY + cardRadius)
    ctx.lineTo(cardPadding + cardWidth, cardY + cardHeight - cardRadius)
    ctx.quadraticCurveTo(cardPadding + cardWidth, cardY + cardHeight, cardPadding + cardWidth - cardRadius, cardY + cardHeight)
    ctx.lineTo(cardPadding + cardRadius, cardY + cardHeight)
    ctx.quadraticCurveTo(cardPadding, cardY + cardHeight, cardPadding, cardY + cardHeight - cardRadius)
    ctx.lineTo(cardPadding, cardY + cardRadius)
    ctx.quadraticCurveTo(cardPadding, cardY, cardPadding + cardRadius, cardY)
    ctx.closePath()
    ctx.fillStyle = cardGradient
    ctx.fill()

    // Reset shadow
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    // Animated holographic accent stripe at top of card
    const stripeHeight = 12
    
    // Create animated gradient with offset
    const gradientStart = cardPadding - cardWidth + shimmerOffset
    const gradientEnd = cardPadding + cardWidth * 2 + shimmerOffset
    const holoGradient = ctx.createLinearGradient(gradientStart, cardY, gradientEnd, cardY)
    
    // Rainbow holographic colors with shimmer effect
    holoGradient.addColorStop(0, '#9b87f5')
    holoGradient.addColorStop(0.15, '#22c55e')
    holoGradient.addColorStop(0.3, '#f97316')
    holoGradient.addColorStop(0.45, '#ec4899')
    holoGradient.addColorStop(0.6, '#9b87f5')
    holoGradient.addColorStop(0.75, '#3b82f6')
    holoGradient.addColorStop(0.9, '#22c55e')
    holoGradient.addColorStop(1, '#9b87f5')
    
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(cardPadding + cardRadius, cardY)
    ctx.lineTo(cardPadding + cardWidth - cardRadius, cardY)
    ctx.quadraticCurveTo(cardPadding + cardWidth, cardY, cardPadding + cardWidth, cardY + cardRadius)
    ctx.lineTo(cardPadding + cardWidth, cardY + stripeHeight + cardRadius)
    ctx.lineTo(cardPadding, cardY + stripeHeight + cardRadius)
    ctx.lineTo(cardPadding, cardY + cardRadius)
    ctx.quadraticCurveTo(cardPadding, cardY, cardPadding + cardRadius, cardY)
    ctx.closePath()
    ctx.clip()
    ctx.fillStyle = holoGradient
    ctx.fillRect(cardPadding, cardY, cardWidth, stripeHeight + cardRadius)
    ctx.restore()

    // PetLinkID branding - icon teal with glow, text black, moved down for equal spacing
    const brandColor = '#2E9B8D'
    const textColor = '#1a1a1a'
    drawLinkIcon(ctx, cardPadding + 50, cardY + 65, 32, brandColor, true)
    ctx.fillStyle = textColor
    ctx.font = 'bold 30px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('PetLinkID', cardPadding + 95, cardY + 90)

    // ID in top right corner - moved down and larger text
    ctx.fillStyle = '#9ca3af'
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('ID:', cardPadding + cardWidth - 200, cardY + 90)
    ctx.fillStyle = textColor
    ctx.font = 'bold 22px monospace'
    ctx.fillText(publicId, cardPadding + cardWidth - 50, cardY + 90)

    // Photo section (left side of card) - optimized sizing for balance
    const photoSize = 250
    const photoX = cardPadding + 45
    const photoY = cardY + 115
    const photoRadius = 16

    if (petPhoto) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = reject
          img.src = petPhoto
        })

        // Photo with rounded corners
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(photoX + photoRadius, photoY)
        ctx.lineTo(photoX + photoSize - photoRadius, photoY)
        ctx.quadraticCurveTo(photoX + photoSize, photoY, photoX + photoSize, photoY + photoRadius)
        ctx.lineTo(photoX + photoSize, photoY + photoSize - photoRadius)
        ctx.quadraticCurveTo(photoX + photoSize, photoY + photoSize, photoX + photoSize - photoRadius, photoY + photoSize)
        ctx.lineTo(photoX + photoRadius, photoY + photoSize)
        ctx.quadraticCurveTo(photoX, photoY + photoSize, photoX, photoY + photoSize - photoRadius)
        ctx.lineTo(photoX, photoY + photoRadius)
        ctx.quadraticCurveTo(photoX, photoY, photoX + photoRadius, photoY)
        ctx.closePath()
        ctx.clip()

        // Crop image to square
        const size = Math.min(img.width, img.height)
        const sx = (img.width - size) / 2
        const sy = (img.height - size) / 2
        ctx.drawImage(img, sx, sy, size, size, photoX, photoY, photoSize, photoSize)
        ctx.restore()

        // Photo border
        ctx.strokeStyle = '#e5e7eb'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(photoX + photoRadius, photoY)
        ctx.lineTo(photoX + photoSize - photoRadius, photoY)
        ctx.quadraticCurveTo(photoX + photoSize, photoY, photoX + photoSize, photoY + photoRadius)
        ctx.lineTo(photoX + photoSize, photoY + photoSize - photoRadius)
        ctx.quadraticCurveTo(photoX + photoSize, photoY + photoSize, photoX + photoSize - photoRadius, photoY + photoSize)
        ctx.lineTo(photoX + photoRadius, photoY + photoSize)
        ctx.quadraticCurveTo(photoX, photoY + photoSize, photoX, photoY + photoSize - photoRadius)
        ctx.lineTo(photoX, photoY + photoRadius)
        ctx.quadraticCurveTo(photoX, photoY, photoX + photoRadius, photoY)
        ctx.stroke()
      } catch (error) {
        console.error('Error loading pet photo:', error)
        // Placeholder
        ctx.fillStyle = '#f3f4f6'
        ctx.beginPath()
        ctx.moveTo(photoX + photoRadius, photoY)
        ctx.lineTo(photoX + photoSize - photoRadius, photoY)
        ctx.quadraticCurveTo(photoX + photoSize, photoY, photoX + photoSize, photoY + photoRadius)
        ctx.lineTo(photoX + photoSize, photoY + photoSize - photoRadius)
        ctx.quadraticCurveTo(photoX + photoSize, photoY + photoSize, photoX + photoSize - photoRadius, photoY + photoSize)
        ctx.lineTo(photoX + photoRadius, photoY + photoSize)
        ctx.quadraticCurveTo(photoX, photoY + photoSize, photoX, photoY + photoSize - photoRadius)
        ctx.lineTo(photoX, photoY + photoRadius)
        ctx.quadraticCurveTo(photoX, photoY, photoX + photoRadius, photoY)
        ctx.fill()
        
        ctx.fillStyle = '#9ca3af'
        ctx.font = '60px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('🐾', photoX + photoSize / 2, photoY + photoSize / 2 + 20)
      }
    } else {
      // No photo placeholder
      ctx.fillStyle = '#f3f4f6'
      ctx.beginPath()
      ctx.moveTo(photoX + photoRadius, photoY)
      ctx.lineTo(photoX + photoSize - photoRadius, photoY)
      ctx.quadraticCurveTo(photoX + photoSize, photoY, photoX + photoSize, photoY + photoRadius)
      ctx.lineTo(photoX + photoSize, photoY + photoSize - photoRadius)
      ctx.quadraticCurveTo(photoX + photoSize, photoY + photoSize, photoX + photoSize - photoRadius, photoY + photoSize)
      ctx.lineTo(photoX + photoRadius, photoY + photoSize)
      ctx.quadraticCurveTo(photoX, photoY + photoSize, photoX, photoY + photoSize - photoRadius)
      ctx.lineTo(photoX, photoY + photoRadius)
      ctx.quadraticCurveTo(photoX, photoY, photoX + photoRadius, photoY)
      ctx.fill()
      
      ctx.fillStyle = '#9ca3af'
      ctx.font = '80px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('🐾', photoX + photoSize / 2, photoY + photoSize / 2 + 25)
    }

    // Pet details (right side of card) - formal labeled format
    const detailsX = photoX + photoSize + 45
    const detailsY = photoY + 5
    const detailsWidth = cardWidth - photoSize - 130
    const labelWidth = 85 // Fixed width for labels

    // Standard colors for consistency
    const labelColor = '#9ca3af'
    const valueColor = '#1a1a1a'
    const accentColor = '#2E9B8D'

    // NAME: label and value
    ctx.fillStyle = labelColor
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('NAME:', detailsX, detailsY + 25)
    
    ctx.fillStyle = valueColor
    ctx.font = 'bold 34px system-ui, -apple-system, sans-serif'
    // Truncate name if too long
    let displayName = petName
    const maxNameWidth = detailsWidth - labelWidth
    while (ctx.measureText(displayName).width > maxNameWidth && displayName.length > 1) {
      displayName = displayName.slice(0, -1)
    }
    if (displayName !== petName) displayName += '...'
    ctx.fillText(displayName, detailsX + labelWidth, detailsY + 25)

    // BREED: label and value
    const breedY = detailsY + 60
    ctx.fillStyle = labelColor
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
    ctx.fillText('BREED:', detailsX, breedY)
    
    ctx.fillStyle = valueColor
    ctx.font = '24px system-ui, -apple-system, sans-serif'
    const breedText = petBreed || petSpecies
    ctx.fillText(breedText, detailsX + labelWidth, breedY)

    // COLOUR / MARKINGS: label and value (if available)
    let currentY = breedY + 35
    if (petColour) {
      ctx.fillStyle = labelColor
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif'
      ctx.fillText('COLOUR / MARKINGS:', detailsX, currentY)
      
      ctx.fillStyle = valueColor
      ctx.font = '22px system-ui, -apple-system, sans-serif'
      // Truncate colour if too long
      let displayColour = petColour
      const colourMaxWidth = detailsWidth - 10
      while (ctx.measureText(displayColour).width > colourMaxWidth && displayColour.length > 1) {
        displayColour = displayColour.slice(0, -1)
      }
      if (displayColour !== petColour) displayColour += '...'
      ctx.fillText(displayColour, detailsX, currentY + 25)
      currentY += 55
    }

    // WEIGHT: label and value (if available)
    if (petWeight) {
      ctx.fillStyle = labelColor
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
      ctx.fillText('WEIGHT:', detailsX, currentY)
      
      ctx.fillStyle = valueColor
      ctx.font = '24px system-ui, -apple-system, sans-serif'
      ctx.fillText(`${petWeight} kg`, detailsX + labelWidth, currentY)
      currentY += 35
    }

    // Subtle separator line
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(detailsX, currentY + 5)
    ctx.lineTo(detailsX + detailsWidth, currentY + 5)
    ctx.stroke()

    // DOB and Age section
    const infoY = currentY + 30
    
    if (dateOfBirth) {
      // Format DOB nicely
      const dobDate = new Date(dateOfBirth)
      const formattedDob = format(dobDate, 'd MMM yyyy')
      
      // DOB: label and value
      ctx.fillStyle = labelColor
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
      ctx.fillText('DOB:', detailsX, infoY)
      
      ctx.fillStyle = valueColor
      ctx.font = '24px system-ui, -apple-system, sans-serif'
      ctx.fillText(formattedDob, detailsX + labelWidth, infoY)
      
      // AGE: label and value
      if (petAge) {
        const ageY = infoY + 30
        ctx.fillStyle = labelColor
        ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
        ctx.fillText('AGE:', detailsX, ageY)
        
        ctx.fillStyle = valueColor
        ctx.font = 'bold 24px system-ui, -apple-system, sans-serif'
        ctx.fillText(petAge, detailsX + labelWidth, ageY)
      }
    } else if (petAge) {
      // Just age if no DOB
      ctx.fillStyle = labelColor
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
      ctx.fillText('AGE:', detailsX, infoY)
      
      ctx.fillStyle = valueColor
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif'
      ctx.fillText(petAge, detailsX + labelWidth, infoY)
    }

    // SPECIES: icon with label - at bottom of details
    const speciesEmoji = petSpecies.toLowerCase() === 'dog' ? '🐕' : 
                         petSpecies.toLowerCase() === 'cat' ? '🐈' : 
                         petSpecies.toLowerCase() === 'bird' ? '🐦' : 
                         petSpecies.toLowerCase() === 'rabbit' ? '🐰' : '🐾'
    const speciesY = dateOfBirth && petAge ? infoY + 70 : infoY + 40
    ctx.fillStyle = labelColor
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
    ctx.fillText('SPECIES:', detailsX, speciesY)
    ctx.font = '24px system-ui'
    ctx.fillText(speciesEmoji, detailsX + labelWidth, speciesY)
    ctx.fillStyle = valueColor
    ctx.font = '24px system-ui, -apple-system, sans-serif'
    ctx.fillText(petSpecies.toUpperCase(), detailsX + labelWidth + 30, speciesY)

    // SEX: next to species on same row
    if (petGender) {
      const sexLabelX = detailsX + labelWidth + 180
      ctx.fillStyle = labelColor
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
      ctx.fillText('SEX:', sexLabelX, speciesY)
      ctx.fillStyle = valueColor
      ctx.font = '24px system-ui, -apple-system, sans-serif'
      const genderDisplay = petGender.charAt(0).toUpperCase() + petGender.slice(1).toLowerCase()
      ctx.fillText(genderDisplay, sexLabelX + 55, speciesY)
    }

    // Footer row - just the LICENSED badge (ID moved to top right)
    const footerY = cardY + cardHeight - 55

    // QR Code (bottom right of card)
    const qrSize = 120
    const qrX = cardPadding + cardWidth - qrSize - 40
    const qrY = cardY + cardHeight - qrSize - 50
    
    const qrImg = new Image()
    await new Promise<void>((resolve) => {
      qrImg.onload = () => resolve()
      qrImg.onerror = () => resolve()
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}&bgcolor=ffffff&color=1a1a1a`
    })
    
    // QR background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16)
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

    // "SCAN ME" text under QR
    ctx.fillStyle = '#9ca3af'
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('SCAN ME', qrX + qrSize / 2, qrY + qrSize + 30)

    // "LICENSED" badge
    const badgeX = cardPadding + 50
    const badgeY = cardY + cardHeight - 60
    ctx.fillStyle = '#22c55e'
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('✓ LICENSED', badgeX, badgeY)

    // Security pattern removed for cleaner look

    // === Below card content ===

    // Large pet name display
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 100px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(petName, WIDTH / 2, cardY + cardHeight + 150)

    // Tagline
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = '36px system-ui, -apple-system, sans-serif'
    ctx.fillText('is officially licensed! 🎉', WIDTH / 2, cardY + cardHeight + 220)

    // Call to action
    ctx.fillStyle = '#2E9B8D'
    ctx.font = 'bold 40px system-ui, -apple-system, sans-serif'
    ctx.fillText('Get yours at PetLinkID.com', WIDTH / 2, HEIGHT - 200)

    // Paw prints decoration - smaller and more subtle
    ctx.font = '50px system-ui'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
    ctx.fillText('🐾', 100, 200)
    ctx.fillText('🐾', WIDTH - 140, 280)
    ctx.fillText('🐾', 80, HEIGHT - 400)
    ctx.fillText('🐾', WIDTH - 120, HEIGHT - 350)

    // PetLinkID logo at top
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('PetLinkID', WIDTH / 2, 180)

    // Tagline under logo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = '28px system-ui, -apple-system, sans-serif'
    ctx.fillText('Keep your pets safe', WIDTH / 2, 230)

    if (shimmerOffset === 0) setGenerating(false)
  }, [petAge, petBreed, petColour, petName, petPhoto, petSpecies, publicId, publicUrl])

  // Shimmer animation loop
  const startShimmerAnimation = useCallback(() => {
    let offset = 0
    const cardWidth = WIDTH - 120 // cardPadding * 2
    const animationSpeed = 8 // pixels per frame
    
    const animate = () => {
      offset += animationSpeed
      if (offset > cardWidth * 3) {
        offset = 0
      }
      generateLicenseCard(offset)
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }, [generateLicenseCard])

  const stopShimmerAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      generateLicenseCard(0).then(() => {
        startShimmerAnimation()
      })
    } else {
      stopShimmerAnimation()
    }
    
    return () => stopShimmerAnimation()
  }, [isOpen, generateLicenseCard, startShimmerAnimation, stopShimmerAnimation])

  const getShareToastMessage = (result: ShareResult) => {
    const isNative = Capacitor.isNativePlatform()
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    
    switch (result.method) {
      case 'native':
        return {
          title: 'Share sheet opened!',
          description: 'Select Instagram → Stories to share your PetLinkID!',
        }
      case 'web-share':
        return {
          title: 'Share sheet opened!',
          description: isMobile 
            ? 'Select Instagram to share. For Stories, save the image first then add to your Story.'
            : 'Select where to share your PetLinkID!',
        }
      case 'web-share-url':
        return {
          title: 'Share sheet opened!',
          description: 'Share your PetLinkID link! For Stories with the image, use the Download button.',
        }
      case 'download':
        return {
          title: 'Image saved!',
          description: result.captionCopied 
            ? 'Caption copied! Open Instagram → Your Story → Add the saved image.'
            : 'Open Instagram → Your Story → Add the saved image.',
        }
      default:
        return {
          title: 'Ready to share!',
          description: 'Share your PetLinkID on Instagram!',
        }
    }
  }

  const handleShare = async () => {
    await generateLicenseCard()
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob(async (blob) => {
      if (!blob) return

      try {
        const result = await shareToInstagram({ imageBlob: blob, petName, publicUrl })
        const toastMessage = getShareToastMessage(result)
        toast(toastMessage)
      } catch (error) {
        if ((error as Error).name !== 'AbortError' && 
            !(error as Error).message?.includes('canceled') &&
            !(error as Error).message?.includes('cancelled')) {
          console.error('Error sharing:', error)
          toast({
            title: 'Download started',
            description: 'Share the downloaded image to Instagram!',
          })
        }
      }
    })
  }

  const handleDownload = async () => {
    await generateLicenseCard()
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (!blob) return
      downloadImage(blob, petName)
      toast({
        title: 'Card downloaded!',
        description: 'Share your PetLinkID on Instagram! 🐾',
      })
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600">
          <Instagram className="w-4 h-4 mr-2" />
          Create PetLinkID
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="w-5 h-5 text-purple-500" />
            {petName}&apos;s PetLinkID
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          {/* Preview */}
          <div className="relative bg-muted rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto"
              style={{ width: '100%' }}
            />
            {generating && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleShare} 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={generating}
            >
              <Instagram className="w-4 h-4 mr-2" />
              Share to Instagram Stories
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleDownload} variant="outline" disabled={generating}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleShare} variant="outline" disabled={generating}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {!Capacitor.isNativePlatform() && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && (
            <p className="text-xs text-muted-foreground text-center bg-muted/50 rounded-md p-2">
              💡 <strong>Tip for Stories:</strong> Download the image, then open Instagram → Your Story → Add from camera roll.
            </p>
          )}
          <p className="text-xs text-muted-foreground text-center">
            Share your pet&apos;s official PetLinkID and help others discover PetLinkID!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
