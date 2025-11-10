import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Instagram, Download, Share2, Image as ImageIcon } from 'lucide-react'
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

type Theme = 'passport' | 'gradient' | 'playful'
type Format = 'stories' | 'feed' | 'tiktok'

const THEME_NAMES: Record<Theme, string> = {
  passport: 'Classic Passport',
  gradient: 'Modern Gradient',
  playful: 'Playful Sticker'
}

const FORMAT_NAMES: Record<Format, string> = {
  stories: 'Instagram Stories',
  feed: 'Instagram Feed',
  tiktok: 'TikTok'
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
  const [theme, setTheme] = useState<Theme>('passport')
  const [format, setFormat] = useState<Format>('stories')
  const [generating, setGenerating] = useState(false)

  const petAge = dateOfBirth ? calculateAge(dateOfBirth) : null

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      generateCard()
    }
  }, [isOpen, theme, format])

  const getCanvasDimensions = (format: Format) => {
    switch (format) {
      case 'stories':
      case 'tiktok':
        return { width: 1080, height: 1920 }
      case 'feed':
        return { width: 1080, height: 1080 }
    }
  }

  const drawPetLinkIDLogo = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    scale: number = 1,
    color: string = '#9b87f5'
  ) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(scale, scale)
    
    // Draw Link2 icon (rotated 45 degrees chain link)
    ctx.save()
    ctx.rotate(Math.PI / 4) // 45 degrees
    
    // Chain link shape
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    
    // Left link
    ctx.beginPath()
    ctx.arc(-8, 0, 6, 0, Math.PI * 2)
    ctx.stroke()
    
    // Right link
    ctx.beginPath()
    ctx.arc(8, 0, 6, 0, Math.PI * 2)
    ctx.stroke()
    
    // Connecting bar
    ctx.beginPath()
    ctx.moveTo(-4, -4)
    ctx.lineTo(4, 4)
    ctx.stroke()
    
    ctx.restore()
    
    // Draw "PetLinkID" text next to icon
    ctx.fillStyle = color
    ctx.font = `bold ${24}px Arial`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('PetLinkID', 25, 0)
    
    ctx.restore()
  }

  const generateCard = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setGenerating(true)
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = getCanvasDimensions(format)
    canvas.width = width
    canvas.height = height

    // Theme-specific generation
    switch (theme) {
      case 'passport':
        await generatePassportTheme(ctx, width, height)
        break
      case 'gradient':
        await generateGradientTheme(ctx, width, height)
        break
      case 'playful':
        await generatePlayfulTheme(ctx, width, height)
        break
    }

    setGenerating(false)
  }

  const generatePassportTheme = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Background - cream paper texture
    ctx.fillStyle = '#F5F1E8'
    ctx.fillRect(0, 0, width, height)

    // Embossed border
    const borderSize = 60
    ctx.strokeStyle = '#E8DFC8'
    ctx.lineWidth = 4
    ctx.strokeRect(borderSize, borderSize, width - borderSize * 2, height - borderSize * 2)
    
    ctx.strokeStyle = '#C4B89B'
    ctx.lineWidth = 2
    ctx.strokeRect(borderSize + 10, borderSize + 10, width - (borderSize + 10) * 2, height - (borderSize + 10) * 2)

    // PetLinkID Logo Header
    drawPetLinkIDLogo(ctx, width / 2 - 70, borderSize + 35, 1.2, '#9b87f5')

    const contentTop = borderSize + 80
    const photoHeight = Math.floor(height * 0.45)

    // Load and draw pet photo
    if (petPhoto) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = reject
          img.src = petPhoto
        })

        // Calculate crop for hero image
        const padding = 120
        const photoWidth = width - padding * 2
        const aspectRatio = img.width / img.height
        const targetAspectRatio = photoWidth / photoHeight

        let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height

        if (aspectRatio > targetAspectRatio) {
          sWidth = img.height * targetAspectRatio
          sx = (img.width - sWidth) / 2
        } else {
          sHeight = img.width / targetAspectRatio
          sy = (img.height - sHeight) / 2
        }

        // Rounded rectangle for photo
        ctx.save()
        const radius = 30
        const x = padding
        const y = contentTop
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + photoWidth - radius, y)
        ctx.quadraticCurveTo(x + photoWidth, y, x + photoWidth, y + radius)
        ctx.lineTo(x + photoWidth, y + photoHeight - radius)
        ctx.quadraticCurveTo(x + photoWidth, y + photoHeight, x + photoWidth - radius, y + photoHeight)
        ctx.lineTo(x + radius, y + photoHeight)
        ctx.quadraticCurveTo(x, y + photoHeight, x, y + photoHeight - radius)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.closePath()
        ctx.clip()

        ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, photoWidth, photoHeight)
        ctx.restore()

        // Photo border
        ctx.strokeStyle = '#9b87f5'
        ctx.lineWidth = 8
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + photoWidth - radius, y)
        ctx.quadraticCurveTo(x + photoWidth, y, x + photoWidth, y + radius)
        ctx.lineTo(x + photoWidth, y + photoHeight - radius)
        ctx.quadraticCurveTo(x + photoWidth, y + photoHeight, x + photoWidth - radius, y + photoHeight)
        ctx.lineTo(x + radius, y + photoHeight)
        ctx.quadraticCurveTo(x, y + photoHeight, x, y + photoHeight - radius)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.stroke()
      } catch (error) {
        console.error('Error loading pet photo:', error)
      }
    }

    const textTop = contentTop + photoHeight + 60

    // Pet name - LARGE
    ctx.fillStyle = '#1a1a1a'
    ctx.font = 'bold 96px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(petName, width / 2, textTop)

    // Breed + Age
    const details = petBreed 
      ? `${petBreed}${petAge ? ` • ${petAge}` : ''}`
      : `${petSpecies}${petAge ? ` • ${petAge}` : ''}`
    ctx.fillStyle = '#666666'
    ctx.font = '40px Arial'
    ctx.fillText(details, width / 2, textTop + 70)

    // "OFFICIAL PET PASSPORT" header
    ctx.fillStyle = '#9b87f5'
    ctx.font = 'bold 32px Arial'
    ctx.fillText('OFFICIAL PET PASSPORT', width / 2, textTop + 140)

    // ID Badge
    const badgeY = textTop + 180
    const badgeWidth = 280
    const badgeHeight = 60
    const badgeX = (width - badgeWidth) / 2

    ctx.fillStyle = '#f5f5f5'
    ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight)
    ctx.strokeStyle = '#ddd'
    ctx.lineWidth = 2
    ctx.strokeRect(badgeX, badgeY, badgeWidth, badgeHeight)

    ctx.fillStyle = '#666666'
    ctx.font = '32px Arial'
    ctx.textAlign = 'left'
    ctx.fillText('🛡️', badgeX + 20, badgeY + 42)

    ctx.fillStyle = '#1a1a1a'
    ctx.font = 'bold 28px monospace'
    ctx.fillText(publicId, badgeX + 70, badgeY + 40)

    // QR Code - small in bottom right
    const qrSize = 160
    const qrX = width - borderSize - qrSize - 60
    const qrY = height - borderSize - qrSize - 60
    const qrImg = new Image()
    await new Promise<void>((resolve) => {
      qrImg.onload = () => resolve()
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`
    })
    
    // QR background
    ctx.fillStyle = 'white'
    ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20)
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

    // "VERIFIED" stamp
    ctx.save()
    ctx.translate(180, height - 200)
    ctx.rotate(-0.3)
    ctx.strokeStyle = '#dc2626'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.arc(0, 0, 70, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = '#dc2626'
    ctx.font = 'bold 28px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('VERIFIED', 0, -10)
    ctx.fillText('✓', 0, 25)
    ctx.restore()

    // Bottom branding with logo
    drawPetLinkIDLogo(ctx, width / 2 - 60, height - borderSize - 35, 0.8, '#00000030')
  }

  const generateGradientTheme = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Soft gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#fae8ff')
    gradient.addColorStop(0.5, '#e9d5ff')
    gradient.addColorStop(1, '#fbcfe8')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Glassmorphism card
    const cardPadding = 80
    const cardY = 120
    const cardHeight = height - 240

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
    ctx.shadowBlur = 30
    ctx.shadowOffsetY = 10
    
    const radius = 40
    ctx.beginPath()
    ctx.moveTo(cardPadding + radius, cardY)
    ctx.lineTo(width - cardPadding - radius, cardY)
    ctx.quadraticCurveTo(width - cardPadding, cardY, width - cardPadding, cardY + radius)
    ctx.lineTo(width - cardPadding, cardY + cardHeight - radius)
    ctx.quadraticCurveTo(width - cardPadding, cardY + cardHeight, width - cardPadding - radius, cardY + cardHeight)
    ctx.lineTo(cardPadding + radius, cardY + cardHeight)
    ctx.quadraticCurveTo(cardPadding, cardY + cardHeight, cardPadding, cardY + cardHeight - radius)
    ctx.lineTo(cardPadding, cardY + radius)
    ctx.quadraticCurveTo(cardPadding, cardY, cardPadding + radius, cardY)
    ctx.fill()
    ctx.shadowBlur = 0

    // PetLinkID Logo at top
    drawPetLinkIDLogo(ctx, width / 2 - 70, cardY + 40, 1, '#9b87f5')

    const photoTop = cardY + 120
    const photoHeight = Math.floor(cardHeight * 0.5)

    // Pet photo
    if (petPhoto) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = reject
          img.src = petPhoto
        })

        const padding = 140
        const photoWidth = width - padding * 2

        ctx.save()
        const x = padding
        const y = photoTop
        const r = 30
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + photoWidth - r, y)
        ctx.quadraticCurveTo(x + photoWidth, y, x + photoWidth, y + r)
        ctx.lineTo(x + photoWidth, y + photoHeight - r)
        ctx.quadraticCurveTo(x + photoWidth, y + photoHeight, x + photoWidth - r, y + photoHeight)
        ctx.lineTo(x + r, y + photoHeight)
        ctx.quadraticCurveTo(x, y + photoHeight, x, y + photoHeight - r)
        ctx.lineTo(x, y + r)
        ctx.quadraticCurveTo(x, y, x + r, y)
        ctx.closePath()
        ctx.clip()

        const aspectRatio = img.width / img.height
        const targetAspectRatio = photoWidth / photoHeight
        let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height

        if (aspectRatio > targetAspectRatio) {
          sWidth = img.height * targetAspectRatio
          sx = (img.width - sWidth) / 2
        } else {
          sHeight = img.width / targetAspectRatio
          sy = (img.height - sHeight) / 2
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, photoWidth, photoHeight)
        ctx.restore()
      } catch (error) {
        console.error('Error loading pet photo:', error)
      }
    }

    const textTop = photoTop + photoHeight + 80

    // Pet name
    ctx.fillStyle = '#1a1a1a'
    ctx.font = 'bold 90px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(petName, width / 2, textTop)

    // Details
    const details = petBreed 
      ? `${petBreed}${petAge ? ` • ${petAge}` : ''}`
      : `${petSpecies}${petAge ? ` • ${petAge}` : ''}`
    ctx.fillStyle = '#666666'
    ctx.font = '36px Arial'
    ctx.fillText(details, width / 2, textTop + 60)

    // ID
    ctx.fillStyle = '#9b87f5'
    ctx.font = 'bold 28px monospace'
    ctx.fillText(`🛡️ ${publicId}`, width / 2, textTop + 120)

    // QR Code
    const qrSize = 140
    const qrX = (width - qrSize) / 2
    const qrY = height - 280
    const qrImg = new Image()
    await new Promise<void>((resolve) => {
      qrImg.onload = () => resolve()
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`
    })
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

    // Subtle logo at bottom
    drawPetLinkIDLogo(ctx, width / 2 - 60, height - 80, 0.8, '#00000030')
  }

  const generatePlayfulTheme = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Bright background
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, '#fef3c7')
    gradient.addColorStop(1, '#fed7aa')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Fun logo with playful color
    drawPetLinkIDLogo(ctx, width / 2 - 70, 100, 1.2, '#f59e0b')

    // Decorative paw prints
    ctx.fillStyle = 'rgba(251, 191, 36, 0.2)'
    ctx.font = '80px Arial'
    ctx.fillText('🐾', 100, 200)
    ctx.fillText('🐾', width - 150, 300)
    ctx.fillText('🐾', 120, height - 200)
    ctx.fillText('🐾', width - 170, height - 300)

    const photoTop = 180
    const photoHeight = Math.floor(height * 0.4)

    // Pet photo with sticker frame
    if (petPhoto) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = reject
          img.src = petPhoto
        })

        const padding = 120
        const photoWidth = width - padding * 2

        // Sticker background
        ctx.fillStyle = 'white'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
        ctx.shadowBlur = 20
        ctx.shadowOffsetY = 8
        const stickerPadding = 15
        ctx.fillRect(padding - stickerPadding, photoTop - stickerPadding, 
                     photoWidth + stickerPadding * 2, photoHeight + stickerPadding * 2)
        ctx.shadowBlur = 0

        ctx.save()
        const x = padding
        const y = photoTop
        const r = 25
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + photoWidth - r, y)
        ctx.quadraticCurveTo(x + photoWidth, y, x + photoWidth, y + r)
        ctx.lineTo(x + photoWidth, y + photoHeight - r)
        ctx.quadraticCurveTo(x + photoWidth, y + photoHeight, x + photoWidth - r, y + photoHeight)
        ctx.lineTo(x + r, y + photoHeight)
        ctx.quadraticCurveTo(x, y + photoHeight, x, y + photoHeight - r)
        ctx.lineTo(x, y + r)
        ctx.quadraticCurveTo(x, y, x + r, y)
        ctx.closePath()
        ctx.clip()

        const aspectRatio = img.width / img.height
        const targetAspectRatio = photoWidth / photoHeight
        let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height

        if (aspectRatio > targetAspectRatio) {
          sWidth = img.height * targetAspectRatio
          sx = (img.width - sWidth) / 2
        } else {
          sHeight = img.width / targetAspectRatio
          sy = (img.height - sHeight) / 2
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, photoWidth, photoHeight)
        ctx.restore()
      } catch (error) {
        console.error('Error loading pet photo:', error)
      }
    }

    const textTop = photoTop + photoHeight + 80

    // Pet name - bubbly font
    ctx.fillStyle = '#1a1a1a'
    ctx.font = 'bold 100px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(petName, width / 2, textTop)

    // Details
    const details = petBreed 
      ? `${petBreed}${petAge ? ` • ${petAge}` : ''}`
      : `${petSpecies}${petAge ? ` • ${petAge}` : ''}`
    ctx.fillStyle = '#78350f'
    ctx.font = '38px Arial'
    ctx.fillText(details, width / 2, textTop + 70)

    // Fun badge
    ctx.fillStyle = '#f59e0b'
    ctx.beginPath()
    ctx.arc(width / 2, textTop + 150, 50, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'white'
    ctx.font = 'bold 24px Arial'
    ctx.fillText('★', width / 2, textTop + 160)

    // ID
    ctx.fillStyle = '#1a1a1a'
    ctx.font = 'bold 30px monospace'
    ctx.fillText(`🛡️ ${publicId}`, width / 2, textTop + 220)

    // QR Code
    const qrSize = 140
    const qrX = (width - qrSize) / 2
    const qrY = height - 300
    const qrImg = new Image()
    await new Promise<void>((resolve) => {
      qrImg.onload = () => resolve()
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`
    })
    
    // QR sticker background
    ctx.fillStyle = 'white'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
    ctx.shadowBlur = 15
    ctx.fillRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24)
    ctx.shadowBlur = 0
    
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

    // Logo at bottom
    drawPetLinkIDLogo(ctx, width / 2 - 60, height - 100, 0.8, '#78350f')
  }

  const handleShare = async () => {
    await generateCard()
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob(async (blob) => {
      if (!blob) return

      try {
        await shareToInstagram({ imageBlob: blob, petName, publicUrl })
        toast({
          title: 'Opening Instagram...',
          description: 'Share your PetLinkID card on your story! 🚀',
        })
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error)
          toast({
            title: 'Download started',
            description: 'Share the downloaded image on Instagram!',
          })
        }
      }
    })
  }

  const handleDownload = async () => {
    await generateCard()
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (!blob) return
      downloadImage(blob, petName)
      toast({
        title: 'Card downloaded!',
        description: 'Share your PetLinkID card on Instagram! 🚀',
      })
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600">
          <Instagram className="w-4 h-4 mr-2" />
          Create PetLinkID Card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="w-5 h-5 text-purple-500" />
            {petName}&apos;s PetLinkID Card
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          {/* Theme Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Theme</label>
            <Select value={theme} onValueChange={(v) => setTheme(v as Theme)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(THEME_NAMES).map(([key, name]) => (
                  <SelectItem key={key} value={key}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Format Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <Select value={format} onValueChange={(v) => setFormat(v as Format)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FORMAT_NAMES).map(([key, name]) => (
                  <SelectItem key={key} value={key}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            💡 Pro tip: Use <strong>Stories</strong> format to showcase your pet&apos;s PetLinkID card! Share to your story and help others discover PetLinkID.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
