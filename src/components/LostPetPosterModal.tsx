import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import QRCode from 'qrcode'
import { supabase } from '@/integrations/supabase/client'
import { Capacitor } from '@capacitor/core'

interface LostPetPosterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pet: {
    name: string
    species: string
    breed: string | null
    colour: string | null
    weight_kg: number | null
    gender: string | null
    photo_url: string | null
    public_id: string
    ownerPhone?: string | null
    emergencyContactName?: string | null
    emergencyContactPhone?: string | null
  }
  publicUrl: string
}

const POSTER_WIDTH = 1200
const POSTER_HEIGHT = 1600

// Load image with CORS handling
const loadImage = async (url: string): Promise<HTMLImageElement | null> => {
  const isNative = Capacitor.isNativePlatform()
  const isSupabaseUrl = url.includes('supabase.co/storage')

  // On native platforms with Supabase images, use proxy
  if (isNative && isSupabaseUrl) {
    try {
      const { data, error } = await supabase.functions.invoke('proxy-pet-image', { body: { url } })
      if (error) throw error
      if (data?.base64) {
        const img = new Image()
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = reject
          img.src = `data:${data.contentType || 'image/jpeg'};base64,${data.base64}`
        })
        return img
      }
    } catch (err) {
      console.warn('[Poster] Proxy failed:', err)
    }
  }

  // Standard load with CORS
  const img = new Image()
  if (!isNative) img.crossOrigin = 'anonymous'
  
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
      img.src = url
    })
    return img
  } catch {
    console.warn('[Poster] Direct load failed:', url)
    return null
  }
}

export const LostPetPosterModal = ({ open, onOpenChange, pet, publicUrl }: LostPetPosterModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [generating, setGenerating] = useState(false)
  const [previewReady, setPreviewReady] = useState(false)

  const generatePoster = async (forDownload = false) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    setGenerating(true)

    try {
      // Set canvas size
      canvas.width = POSTER_WIDTH
      canvas.height = POSTER_HEIGHT

      // Background - white
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT)

      // Red banner at top
      ctx.fillStyle = '#dc2626'
      ctx.fillRect(0, 0, POSTER_WIDTH, 200)

      // LOST header
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 120px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('LOST PET', POSTER_WIDTH / 2, 140)

      // Pet photo
      const photoSize = 500
      const photoX = (POSTER_WIDTH - photoSize) / 2
      const photoY = 250

      if (pet.photo_url) {
        const petImage = await loadImage(pet.photo_url)
        if (petImage) {
          ctx.save()
          ctx.beginPath()
          ctx.roundRect(photoX, photoY, photoSize, photoSize, 20)
          ctx.clip()
          
          const size = Math.min(petImage.width, petImage.height)
          const sx = (petImage.width - size) / 2
          const sy = (petImage.height - size) / 2
          ctx.drawImage(petImage, sx, sy, size, size, photoX, photoY, photoSize, photoSize)
          ctx.restore()
          
          // Border
          ctx.strokeStyle = '#e5e7eb'
          ctx.lineWidth = 4
          ctx.beginPath()
          ctx.roundRect(photoX, photoY, photoSize, photoSize, 20)
          ctx.stroke()
        }
      } else {
        // Placeholder
        ctx.fillStyle = '#f3f4f6'
        ctx.beginPath()
        ctx.roundRect(photoX, photoY, photoSize, photoSize, 20)
        ctx.fill()
        ctx.fillStyle = '#9ca3af'
        ctx.font = '150px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('🐾', POSTER_WIDTH / 2, photoY + 310)
      }

      // Pet name
      ctx.fillStyle = '#1a1a1a'
      ctx.font = 'bold 80px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(pet.name.toUpperCase(), POSTER_WIDTH / 2, photoY + photoSize + 100)

      // Pet details
      let currentY = photoY + photoSize + 170
      ctx.font = '40px system-ui, -apple-system, sans-serif'
      ctx.fillStyle = '#374151'

      const details: string[] = []
      if (pet.breed) details.push(`${pet.breed} ${pet.species}`)
      else details.push(pet.species)
      if (pet.colour) details.push(`Colour: ${pet.colour}`)
      if (pet.weight_kg) details.push(`Weight: ${pet.weight_kg} kg`)
      if (pet.gender) details.push(`Sex: ${pet.gender}`)

      for (const detail of details) {
        ctx.fillText(detail, POSTER_WIDTH / 2, currentY)
        currentY += 55
      }

      // Contact section - prominent phone numbers
      currentY += 30
      ctx.fillStyle = '#dc2626'
      ctx.fillRect(50, currentY, POSTER_WIDTH - 100, 180)
      
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 36px system-ui, -apple-system, sans-serif'
      ctx.fillText('IF FOUND, PLEASE CALL:', POSTER_WIDTH / 2, currentY + 45)
      
      // Primary phone
      if (pet.ownerPhone) {
        ctx.font = 'bold 60px system-ui, -apple-system, sans-serif'
        ctx.fillText(pet.ownerPhone, POSTER_WIDTH / 2, currentY + 115)
      }
      
      // Emergency contact
      if (pet.emergencyContactPhone && pet.emergencyContactName) {
        ctx.font = '28px system-ui, -apple-system, sans-serif'
        ctx.fillText(`or ${pet.emergencyContactName}: ${pet.emergencyContactPhone}`, POSTER_WIDTH / 2, currentY + 160)
      } else if (pet.emergencyContactPhone) {
        ctx.font = '28px system-ui, -apple-system, sans-serif'
        ctx.fillText(`or Emergency: ${pet.emergencyContactPhone}`, POSTER_WIDTH / 2, currentY + 160)
      }

      currentY += 200

      // QR Code section
      const qrSize = 200
      const qrX = (POSTER_WIDTH - qrSize) / 2
      const qrY = currentY + 20

      // Generate QR code
      try {
        const qrDataUrl = await QRCode.toDataURL(publicUrl, {
          width: qrSize,
          margin: 0,
          color: { dark: '#1a1a1a', light: '#ffffff' }
        })
        const qrImage = new Image()
        await new Promise<void>((resolve, reject) => {
          qrImage.onload = () => resolve()
          qrImage.onerror = reject
          qrImage.src = qrDataUrl
        })
        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)
      } catch (err) {
        console.error('QR generation failed:', err)
      }

      // Scan instruction
      ctx.fillStyle = '#6b7280'
      ctx.font = '24px system-ui, -apple-system, sans-serif'
      ctx.fillText('Scan QR for more info', POSTER_WIDTH / 2, qrY + qrSize + 35)

      // PetLinkID branding at bottom
      ctx.fillStyle = '#2E9B8D'
      ctx.font = 'bold 28px system-ui, -apple-system, sans-serif'
      ctx.fillText('PetLinkID', POSTER_WIDTH / 2, POSTER_HEIGHT - 60)

      ctx.fillStyle = '#9ca3af'
      ctx.font = '20px monospace'
      ctx.fillText(`ID: ${pet.public_id}`, POSTER_WIDTH / 2, POSTER_HEIGHT - 30)

      setPreviewReady(true)
      return canvas
    } catch (error) {
      console.error('Poster generation failed:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate poster',
        variant: 'destructive'
      })
      return null
    } finally {
      setGenerating(false)
    }
  }

  const downloadPoster = async () => {
    const canvas = await generatePoster(true)
    if (!canvas) return

    try {
      const link = document.createElement('a')
      link.download = `${pet.name.replace(/\s+/g, '-').toLowerCase()}-lost-poster.png`
      link.href = canvas.toDataURL('image/png')
      link.click()

      toast({
        title: 'Poster Downloaded',
        description: 'The lost pet poster has been saved to your device'
      })
    } catch (error) {
      console.error('Download failed:', error)
      toast({
        title: 'Download Failed',
        description: 'Could not download the poster',
        variant: 'destructive'
      })
    }
  }

  // Generate preview when modal opens
  // eslint-disable-next-line react-hooks/exhaustive-deps -- generatePoster is defined in component, run when modal opens
  useEffect(() => {
    if (open) {
      setPreviewReady(false)
      generatePoster()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center">Lost Pet Poster</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="relative bg-muted rounded-lg overflow-hidden border shadow-sm" style={{ width: 300, height: 400 }}>
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
              style={{ transform: `scale(${300 / POSTER_WIDTH})`, transformOrigin: 'top left' }}
            />
            {generating && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Download and print this poster to help find {pet.name}
          </p>

          <Button onClick={downloadPoster} disabled={generating} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download Poster
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
