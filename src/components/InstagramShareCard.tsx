import { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Instagram, Download, Share2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { shareToInstagram, downloadImage } from '@/lib/shareToInstagram'
import { calculateAge } from '@/lib/age-utils'

interface InstagramShareCardProps {
  petName: string
  petSpecies: string
  petBreed: string | null
  petPhoto: string | null
  publicId: string
  publicUrl: string
  dateOfBirth: string | null
}

export const InstagramShareCard = ({
  petName,
  petSpecies,
  petBreed,
  petPhoto,
  publicId,
  publicUrl,
  dateOfBirth,
}: InstagramShareCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [generating, setGenerating] = useState(false)

  const petAge = dateOfBirth ? calculateAge(dateOfBirth) : null

  // Stories format: 1080x1920
  const WIDTH = 1080
  const HEIGHT = 1920

  const generateLicenseCard = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setGenerating(true)
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = WIDTH
    canvas.height = HEIGHT

    // Background - premium gradient
    const bgGradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
    bgGradient.addColorStop(0, '#1a1a2e')
    bgGradient.addColorStop(0.5, '#16213e')
    bgGradient.addColorStop(1, '#0f3460')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    // Subtle pattern overlay for texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'
    for (let i = 0; i < HEIGHT; i += 4) {
      ctx.fillRect(0, i, WIDTH, 1)
    }

    // Main card dimensions (credit card aspect ratio)
    const cardPadding = 60
    const cardWidth = WIDTH - cardPadding * 2
    const cardHeight = 600
    const cardY = 380
    const cardRadius = 40

    // Card shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 60
    ctx.shadowOffsetY = 20

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

    // Holographic accent stripe at top of card
    const stripeHeight = 12
    const holoGradient = ctx.createLinearGradient(cardPadding, cardY, cardPadding + cardWidth, cardY)
    holoGradient.addColorStop(0, '#9b87f5')
    holoGradient.addColorStop(0.25, '#f97316')
    holoGradient.addColorStop(0.5, '#9b87f5')
    holoGradient.addColorStop(0.75, '#22c55e')
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

    // "PET LICENSE ID" header on card
    ctx.fillStyle = '#1a1a1a'
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('PET LICENSE ID', cardPadding + 40, cardY + 70)

    // PetLinkID logo text on right
    ctx.fillStyle = '#9b87f5'
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('PetLinkID', cardPadding + cardWidth - 40, cardY + 70)

    // Photo section (left side of card)
    const photoSize = 280
    const photoX = cardPadding + 40
    const photoY = cardY + 110
    const photoRadius = 20

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

    // Pet details (right side of card)
    const detailsX = photoX + photoSize + 50
    const detailsY = photoY + 20

    // Pet name
    ctx.fillStyle = '#1a1a1a'
    ctx.font = 'bold 56px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'left'
    
    // Truncate name if too long
    let displayName = petName
    ctx.font = 'bold 56px system-ui, -apple-system, sans-serif'
    while (ctx.measureText(displayName).width > cardWidth - photoSize - 130 && displayName.length > 1) {
      displayName = displayName.slice(0, -1)
    }
    if (displayName !== petName) displayName += '...'
    ctx.fillText(displayName, detailsX, detailsY + 40)

    // Breed
    ctx.fillStyle = '#6b7280'
    ctx.font = '32px system-ui, -apple-system, sans-serif'
    const breedText = petBreed || petSpecies
    ctx.fillText(breedText, detailsX, detailsY + 90)

    // Age (if available)
    if (petAge) {
      ctx.fillStyle = '#9b87f5'
      ctx.font = 'bold 28px system-ui, -apple-system, sans-serif'
      ctx.fillText(petAge, detailsX, detailsY + 135)
    }

    // Species icon
    const speciesEmoji = petSpecies.toLowerCase() === 'dog' ? '🐕' : 
                         petSpecies.toLowerCase() === 'cat' ? '🐈' : 
                         petSpecies.toLowerCase() === 'bird' ? '🐦' : 
                         petSpecies.toLowerCase() === 'rabbit' ? '🐰' : '🐾'
    ctx.font = '48px system-ui'
    ctx.fillText(speciesEmoji, detailsX, detailsY + 200)

    // ID number with shield
    ctx.fillStyle = '#1a1a1a'
    ctx.font = 'bold 24px monospace'
    ctx.fillText(`ID: ${publicId}`, detailsX, detailsY + 260)

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
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('SCAN ME', qrX + qrSize / 2, qrY + qrSize + 30)

    // "LICENSED" badge
    const badgeX = cardPadding + 50
    const badgeY = cardY + cardHeight - 60
    ctx.fillStyle = '#22c55e'
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('✓ LICENSED', badgeX, badgeY)

    // Security pattern (subtle lines on card)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)'
    ctx.lineWidth = 1
    for (let i = cardY + 100; i < cardY + cardHeight; i += 8) {
      ctx.beginPath()
      ctx.moveTo(cardPadding, i)
      ctx.lineTo(cardPadding + cardWidth, i)
      ctx.stroke()
    }

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
    ctx.fillStyle = '#9b87f5'
    ctx.font = 'bold 40px system-ui, -apple-system, sans-serif'
    ctx.fillText('Get yours at PetLinkID.com', WIDTH / 2, HEIGHT - 200)

    // Paw prints decoration
    ctx.font = '60px system-ui'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fillText('🐾', 100, 200)
    ctx.fillText('🐾', WIDTH - 150, 280)
    ctx.fillText('🐾', 80, HEIGHT - 400)
    ctx.fillText('🐾', WIDTH - 130, HEIGHT - 350)

    // PetLinkID logo at top
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('PetLinkID', WIDTH / 2, 180)

    // Tagline under logo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = '28px system-ui, -apple-system, sans-serif'
    ctx.fillText('Keep your pets safe', WIDTH / 2, 230)

    setGenerating(false)
  }, [petAge, petBreed, petName, petPhoto, petSpecies, publicId, publicUrl])

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      generateLicenseCard()
    }
  }, [isOpen, generateLicenseCard])

  const handleShare = async () => {
    await generateLicenseCard()
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob(async (blob) => {
      if (!blob) return

      try {
        await shareToInstagram({ imageBlob: blob, petName, publicUrl })
        toast({
          title: 'Opening share...',
          description: 'Share your PetLinkID to your story! 🚀',
        })
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
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

          <p className="text-xs text-muted-foreground text-center">
            Share your pet&apos;s official PetLinkID and help others discover PetLinkID! 🐾
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
