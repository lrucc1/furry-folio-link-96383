import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Instagram, Download, Share2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface InstagramShareCardProps {
  petName: string
  petSpecies: string
  petBreed: string | null
  petPhoto: string | null
  publicId: string
  publicUrl: string
}

export const InstagramShareCard = ({
  petName,
  petSpecies,
  petBreed,
  petPhoto,
  publicId,
  publicUrl,
}: InstagramShareCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      generateCard()
    }
  }, [isOpen])

  const generateCard = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size for Instagram post (1080x1080)
    canvas.width = 1080
    canvas.height = 1080

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 1080)
    gradient.addColorStop(0, '#9b87f5')
    gradient.addColorStop(1, '#7E69AB')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1080, 1080)

    // Add decorative circles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.beginPath()
    ctx.arc(900, 200, 300, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(180, 900, 250, 0, Math.PI * 2)
    ctx.fill()

    // White card background
    ctx.fillStyle = '#ffffff'
    ctx.roundRect(90, 90, 900, 900, 40)
    ctx.fill()

    // Pet photo
    if (petPhoto) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = petPhoto
        })

        // Draw circular pet photo
        ctx.save()
        ctx.beginPath()
        ctx.arc(540, 320, 150, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(img, 390, 170, 300, 300)
        ctx.restore()

        // Photo border
        ctx.strokeStyle = '#9b87f5'
        ctx.lineWidth = 6
        ctx.beginPath()
        ctx.arc(540, 320, 150, 0, Math.PI * 2)
        ctx.stroke()
      } catch (error) {
        console.error('Error loading pet photo:', error)
      }
    } else {
      // Placeholder circle
      ctx.fillStyle = '#f0f0f0'
      ctx.beginPath()
      ctx.arc(540, 320, 150, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#9b87f5'
      ctx.font = 'bold 80px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('🐾', 540, 340)
    }

    // Pet name
    ctx.fillStyle = '#1a1a1a'
    ctx.font = 'bold 72px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(petName, 540, 540)

    // Pet details
    const details = petBreed ? `${petBreed} • ${petSpecies}` : petSpecies
    ctx.fillStyle = '#666666'
    ctx.font = '36px Arial'
    ctx.fillText(details, 540, 590)

    // PetLinkID branding
    ctx.fillStyle = '#9b87f5'
    ctx.font = 'bold 48px Arial'
    ctx.fillText('PetLinkID', 540, 680)

    // Pet ID Badge (similar to profile)
    const badgeWidth = 220
    const badgeHeight = 50
    const badgeX = 540 - badgeWidth / 2
    const badgeY = 700

    // Badge background
    ctx.fillStyle = '#f0f0f0'
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 8)
    ctx.fill()

    // Badge border
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 2
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 8)
    ctx.stroke()

    // Shield icon (simplified)
    ctx.fillStyle = '#666666'
    ctx.font = '28px Arial'
    ctx.textAlign = 'left'
    ctx.fillText('🛡️', badgeX + 15, badgeY + 35)

    // Public ID text
    ctx.fillStyle = '#1a1a1a'
    ctx.font = 'bold 24px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(publicId, badgeX + 55, badgeY + 34)

    // QR Code
    const qrSize = 180
    const qrImg = new Image()
    await new Promise((resolve) => {
      qrImg.onload = resolve
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`
    })
    ctx.drawImage(qrImg, 450, 770, qrSize, qrSize)

    // CTA text
    ctx.fillStyle = '#666666'
    ctx.font = '28px Arial'
    ctx.fillText('Scan to view my profile!', 540, 990)
  }

  const handleDownload = async () => {
    await generateCard()
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `${petName}-petlinkid-card.png`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)

      toast({
        title: 'Card downloaded!',
        description: 'Share it on Instagram to help your pet go viral! 🚀',
      })
    })
  }

  const handleShare = async () => {
    await generateCard()
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob(async (blob) => {
      if (!blob) return

      const file = new File([blob], `${petName}-petlinkid-card.png`, { type: 'image/png' })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Meet ${petName}!`,
            text: `Check out ${petName} on PetLinkID! 🐾`,
          })
        } catch (error) {
          if ((error as Error).name !== 'AbortError') {
            console.error('Error sharing:', error)
            handleDownload()
          }
        }
      } else {
        handleDownload()
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600">
          <Instagram className="w-4 h-4 mr-2" />
          Share on Instagram
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="w-5 h-5 text-purple-500" />
            Share {petName}&apos;s Card
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto rounded-lg shadow-xl"
              style={{ width: '100%', maxWidth: '400px' }}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            A beautiful card showcasing {petName}&apos;s profile with PetLinkID branding and QR code
          </p>
          <div className="flex gap-2 w-full">
            <Button onClick={handleShare} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            💡 Tip: Post this on Instagram Stories or Feed to help {petName} go viral and showcase PetLinkID!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
