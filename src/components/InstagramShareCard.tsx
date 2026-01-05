import { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Instagram, Download, Share2, Copy, RefreshCw } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { shareToInstagram, downloadImage, copyImageToClipboard, ShareResult } from '@/lib/shareToInstagram'
import { calculateAge } from '@/lib/age-utils'
import { Capacitor } from '@capacitor/core'
import { format } from 'date-fns'
import { supabase } from '@/integrations/supabase/client'
import QRCode from 'qrcode'

// Constants
const WIDTH = 1080
const HEIGHT = 1920
const PREVIEW_SCALE = 0.2
const PREVIEW_WIDTH = WIDTH * PREVIEW_SCALE
const PREVIEW_HEIGHT = HEIGHT * PREVIEW_SCALE
const IMAGE_LOAD_TIMEOUT = 10000 // 10 seconds

// Helper to create a timeout promise
const withTimeout = <T,>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), ms)
    )
  ])
}

// Helper to load images with CORS handling - uses proxy for native platforms
const loadImageWithCORS = async (url: string): Promise<HTMLImageElement | null> => {
  const isNative = Capacitor.isNativePlatform()
  const isSupabaseUrl = url.includes('supabase.co/storage')
  
  console.log('[InstagramShare] Loading image:', url, 'isNative:', isNative, 'isSupabase:', isSupabaseUrl)
  
  // On native platforms with Supabase images, use proxy to avoid canvas tainting
  if (isNative && isSupabaseUrl) {
    try {
      console.log('[InstagramShare] Using proxy for native platform...')
      const { data, error } = await withTimeout(
        supabase.functions.invoke('proxy-pet-image', { body: { url } }),
        IMAGE_LOAD_TIMEOUT,
        'Proxy request timed out'
      )
      
      if (error) {
        console.warn('[InstagramShare] Proxy error:', error)
        throw error
      }
      
      if (data?.base64) {
        const img = new Image()
        await withTimeout(
          new Promise<void>((resolve, reject) => {
            img.onload = () => {
              console.log('[InstagramShare] Proxy image load succeeded')
              resolve()
            }
            img.onerror = (e) => {
              console.warn('[InstagramShare] Proxy image render failed:', e)
              reject(new Error('Proxy image render failed'))
            }
            img.src = `data:${data.contentType || 'image/jpeg'};base64,${data.base64}`
          }),
          IMAGE_LOAD_TIMEOUT,
          'Image render timed out'
        )
        return img
      }
    } catch (err) {
      console.warn('[InstagramShare] Proxy failed, trying direct load:', err)
    }
  }
  
  // For web or as fallback: try direct load with CORS
  const img = new Image()
  if (!isNative) {
    img.crossOrigin = 'anonymous'
  }
  
  try {
    await withTimeout(
      new Promise<void>((resolve, reject) => {
        img.onload = () => {
          console.log('[InstagramShare] Direct image load succeeded')
          resolve()
        }
        img.onerror = (e) => {
          console.warn('[InstagramShare] Direct image load failed:', e)
          reject(new Error('Direct load failed'))
        }
        img.src = url
      }),
      IMAGE_LOAD_TIMEOUT,
      'Direct image load timed out'
    )
    return img
  } catch {
    console.log('[InstagramShare] Trying fetch fallback...')
    // Fallback: Fetch as blob and create object URL
    try {
      const response = await withTimeout(
        fetch(url),
        IMAGE_LOAD_TIMEOUT,
        'Fetch timed out'
      )
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const fallbackImg = new Image()
      await withTimeout(
        new Promise<void>((resolve, reject) => {
          fallbackImg.onload = () => {
            console.log('[InstagramShare] Fetch fallback succeeded')
            resolve()
          }
          fallbackImg.onerror = reject
          fallbackImg.src = objectUrl
        }),
        IMAGE_LOAD_TIMEOUT,
        'Fallback image load timed out'
      )
      return fallbackImg
    } catch (err) {
      console.error('[InstagramShare] All image loading attempts failed:', url, err)
      return null
    }
  }
}

// Generate QR code as data URL using qrcode package (local, no network)
const generateQRDataURL = async (data: string): Promise<string | null> => {
  try {
    return await QRCode.toDataURL(data, {
      width: 200,
      margin: 0,
      color: { dark: '#1a1a1a', light: '#ffffff' }
    })
  } catch (err) {
    console.error('[InstagramShare] QR generation failed:', err)
    return null
  }
}

// Load image from data URL
const loadImageFromDataURL = (dataUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = dataUrl
  })
}

// Promise-based wrapper for canvas.toBlob
const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob | null> => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

// Draw Lucide Link2 icon on canvas (matches the actual SVG paths)
const drawLinkIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, withGlow: boolean = false) => {
  ctx.save()
  ctx.translate(x + size / 2, y + size / 2)
  ctx.rotate(Math.PI / 4)
  ctx.translate(-size / 2, -size / 2)
  
  if (withGlow) {
    ctx.shadowColor = 'rgba(46, 155, 141, 0.6)'
    ctx.shadowBlur = 12
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }
  
  const scale = size / 24
  ctx.scale(scale, scale)
  
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  ctx.beginPath()
  ctx.moveTo(9, 17)
  ctx.lineTo(7, 17)
  ctx.bezierCurveTo(4.24, 17, 2, 14.76, 2, 12)
  ctx.bezierCurveTo(2, 9.24, 4.24, 7, 7, 7)
  ctx.lineTo(9, 7)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(15, 7)
  ctx.lineTo(17, 7)
  ctx.bezierCurveTo(19.76, 7, 22, 9.24, 22, 12)
  ctx.bezierCurveTo(22, 14.76, 19.76, 17, 17, 17)
  ctx.lineTo(15, 17)
  ctx.stroke()
  
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

// Cached assets interface
interface CachedAssets {
  petImage: HTMLImageElement | null
  qrImage: HTMLImageElement | null
  baseCardImageData: ImageData | null
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
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const cachedAssetsRef = useRef<CachedAssets>({ petImage: null, qrImage: null, baseCardImageData: null })
  const isRenderingRef = useRef(false)
  
  const [isOpen, setIsOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [previewLoaded, setPreviewLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [assetsLoaded, setAssetsLoaded] = useState(false)

  const petAge = dateOfBirth ? calculateAge(dateOfBirth) : null

  // Load assets once when dialog opens
  const loadAssets = useCallback(async () => {
    console.log('[InstagramShare] Loading assets...')
    setGenerating(true)
    setLoadError(false)
    
    try {
      // Load pet image and QR code in parallel
      const [petImage, qrDataUrl] = await Promise.all([
        petPhoto ? loadImageWithCORS(petPhoto) : Promise.resolve(null),
        generateQRDataURL(publicUrl)
      ])
      
      const qrImage = qrDataUrl ? await loadImageFromDataURL(qrDataUrl) : null
      
      cachedAssetsRef.current = {
        petImage,
        qrImage,
        baseCardImageData: null // Will be set after first render
      }
      
      console.log('[InstagramShare] Assets loaded - petImage:', !!petImage, 'qrImage:', !!qrImage)
      setAssetsLoaded(true)
      return true
    } catch (err) {
      console.error('[InstagramShare] Failed to load assets:', err)
      setLoadError(true)
      return false
    } finally {
      setGenerating(false)
    }
  }, [petPhoto, publicUrl])

  // Draw the base card (everything except shimmer) - cached
  const drawBaseCard = useCallback((ctx: CanvasRenderingContext2D) => {
    const { petImage, qrImage } = cachedAssetsRef.current

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
    bgGradient.addColorStop(0, '#0f172a')
    bgGradient.addColorStop(0.5, '#1e293b')
    bgGradient.addColorStop(1, '#1e3a5a')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    // Subtle radial glow
    const glowGradient = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 0, WIDTH / 2, HEIGHT / 2, 600)
    glowGradient.addColorStop(0, 'rgba(46, 155, 141, 0.08)')
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = glowGradient
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    // Card dimensions
    const cardPadding = 60
    const cardWidth = WIDTH - cardPadding * 2
    const cardHeight = 600
    const cardY = 380
    const cardRadius = 40

    // Card shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
    ctx.shadowBlur = 50
    ctx.shadowOffsetY = 15

    // Card background
    const cardGradient = ctx.createLinearGradient(cardPadding, cardY, cardPadding + cardWidth, cardY + cardHeight)
    cardGradient.addColorStop(0, '#ffffff')
    cardGradient.addColorStop(1, '#f8f9fa')

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

    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    // PetLinkID branding
    const brandColor = '#2E9B8D'
    const textColor = '#1a1a1a'
    drawLinkIcon(ctx, cardPadding + 50, cardY + 65, 32, brandColor, true)
    ctx.fillStyle = textColor
    ctx.font = 'bold 30px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('PetLinkID', cardPadding + 95, cardY + 90)

    // ID in top right
    ctx.fillStyle = '#9ca3af'
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('ID:', cardPadding + cardWidth - 200, cardY + 90)
    ctx.fillStyle = textColor
    ctx.font = 'bold 22px monospace'
    ctx.fillText(publicId, cardPadding + cardWidth - 50, cardY + 90)

    // Photo section
    const photoSize = 250
    const photoX = cardPadding + 45
    const photoY = cardY + 115
    const photoRadius = 16

    if (petImage) {
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

      const size = Math.min(petImage.width, petImage.height)
      const sx = (petImage.width - size) / 2
      const sy = (petImage.height - size) / 2
      ctx.drawImage(petImage, sx, sy, size, size, photoX, photoY, photoSize, photoSize)
      ctx.restore()

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
    } else {
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
      ctx.font = '80px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('🐾', photoX + photoSize / 2, photoY + photoSize / 2 + 25)
    }

    // Pet details
    const detailsX = photoX + photoSize + 45
    const detailsY = photoY + 5
    const detailsWidth = cardWidth - photoSize - 130
    const labelWidth = 85
    const labelColor = '#9ca3af'
    const valueColor = '#1a1a1a'

    // NAME
    ctx.fillStyle = labelColor
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('NAME:', detailsX, detailsY + 25)
    
    ctx.fillStyle = valueColor
    ctx.font = 'bold 34px system-ui, -apple-system, sans-serif'
    let displayName = petName
    const maxNameWidth = detailsWidth - labelWidth
    while (ctx.measureText(displayName).width > maxNameWidth && displayName.length > 1) {
      displayName = displayName.slice(0, -1)
    }
    if (displayName !== petName) displayName += '...'
    ctx.fillText(displayName, detailsX + labelWidth, detailsY + 25)

    // BREED
    const breedY = detailsY + 60
    ctx.fillStyle = labelColor
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
    ctx.fillText('BREED:', detailsX, breedY)
    
    ctx.fillStyle = valueColor
    ctx.font = '24px system-ui, -apple-system, sans-serif'
    const breedText = petBreed || petSpecies
    ctx.fillText(breedText, detailsX + labelWidth, breedY)

    // COLOUR
    let currentY = breedY + 35
    if (petColour) {
      ctx.fillStyle = labelColor
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif'
      ctx.fillText('COLOUR / MARKINGS:', detailsX, currentY)
      
      ctx.fillStyle = valueColor
      ctx.font = '22px system-ui, -apple-system, sans-serif'
      let displayColour = petColour
      const colourMaxWidth = detailsWidth - 10
      while (ctx.measureText(displayColour).width > colourMaxWidth && displayColour.length > 1) {
        displayColour = displayColour.slice(0, -1)
      }
      if (displayColour !== petColour) displayColour += '...'
      ctx.fillText(displayColour, detailsX, currentY + 25)
      currentY += 55
    }

    // WEIGHT
    if (petWeight) {
      ctx.fillStyle = labelColor
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
      ctx.fillText('WEIGHT:', detailsX, currentY)
      
      ctx.fillStyle = valueColor
      ctx.font = '24px system-ui, -apple-system, sans-serif'
      ctx.fillText(`${petWeight} kg`, detailsX + labelWidth, currentY)
      currentY += 35
    }

    // Separator
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(detailsX, currentY + 5)
    ctx.lineTo(detailsX + detailsWidth, currentY + 5)
    ctx.stroke()

    // DOB and Age
    const infoY = currentY + 30
    
    if (dateOfBirth) {
      const dobDate = new Date(dateOfBirth)
      const formattedDob = format(dobDate, 'd MMM yyyy')
      
      ctx.fillStyle = labelColor
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
      ctx.fillText('DOB:', detailsX, infoY)
      
      ctx.fillStyle = valueColor
      ctx.font = '24px system-ui, -apple-system, sans-serif'
      ctx.fillText(formattedDob, detailsX + labelWidth, infoY)
      
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
      ctx.fillStyle = labelColor
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
      ctx.fillText('AGE:', detailsX, infoY)
      
      ctx.fillStyle = valueColor
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif'
      ctx.fillText(petAge, detailsX + labelWidth, infoY)
    }

    // SPECIES
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

    // SEX
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

    // QR Code
    const qrSize = 120
    const qrX = cardPadding + cardWidth - qrSize - 40
    const qrY = cardY + cardHeight - qrSize - 50
    
    if (qrImage) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16)
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)
    } else {
      // QR placeholder
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16)
      ctx.fillStyle = '#9ca3af'
      ctx.font = '14px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('QR', qrX + qrSize / 2, qrY + qrSize / 2 + 5)
    }

    // "SCAN ME" text
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

    // Large pet name
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 100px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(petName, WIDTH / 2, cardY + cardHeight + 150)

    // Tagline
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = '36px system-ui, -apple-system, sans-serif'
    ctx.fillText('is officially licensed! 🎉', WIDTH / 2, cardY + cardHeight + 220)

    // CTA
    ctx.fillStyle = '#2E9B8D'
    ctx.font = 'bold 40px system-ui, -apple-system, sans-serif'
    ctx.fillText('Get yours at PetLinkID.io', WIDTH / 2, HEIGHT - 200)

    // Paw prints
    ctx.font = '50px system-ui'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
    ctx.fillText('🐾', 100, 200)
    ctx.fillText('🐾', WIDTH - 140, 280)
    ctx.fillText('🐾', 80, HEIGHT - 400)
    ctx.fillText('🐾', WIDTH - 120, HEIGHT - 350)

    // Logo at top
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('PetLinkID', WIDTH / 2, 180)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = '28px system-ui, -apple-system, sans-serif'
    ctx.fillText('Keep your pets safe', WIDTH / 2, 230)
  }, [petName, petBreed, petColour, petWeight, petGender, petSpecies, petAge, dateOfBirth, publicId])

  // Draw shimmer stripe only (overlay on base card)
  const drawShimmerStripe = useCallback((ctx: CanvasRenderingContext2D, shimmerOffset: number) => {
    const cardPadding = 60
    const cardWidth = WIDTH - cardPadding * 2
    const cardY = 380
    const cardRadius = 40
    const stripeHeight = 12

    // Create animated gradient
    const gradientStart = cardPadding - cardWidth + shimmerOffset
    const gradientEnd = cardPadding + cardWidth * 2 + shimmerOffset
    const holoGradient = ctx.createLinearGradient(gradientStart, cardY, gradientEnd, cardY)
    
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
  }, [])

  // Generate the full card with shimmer
  const generateCard = useCallback((shimmerOffset: number = 0) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = WIDTH
    canvas.height = HEIGHT

    // Draw base card
    drawBaseCard(ctx)
    // Draw shimmer on top
    drawShimmerStripe(ctx, shimmerOffset)
  }, [drawBaseCard, drawShimmerStripe])

  // Preview thumbnail (simpler, no animation)
  const generatePreview = useCallback(async () => {
    const canvas = previewCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = PREVIEW_WIDTH
    canvas.height = PREVIEW_HEIGHT
    ctx.scale(PREVIEW_SCALE, PREVIEW_SCALE)

    // Background
    const bgGradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
    bgGradient.addColorStop(0, '#0f172a')
    bgGradient.addColorStop(0.5, '#1e293b')
    bgGradient.addColorStop(1, '#1e3a5a')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    // Card placeholder
    const cardPadding = 60
    const cardWidth = WIDTH - cardPadding * 2
    const cardHeight = 600
    const cardY = 380
    const cardRadius = 40

    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
    ctx.shadowBlur = 50
    ctx.shadowOffsetY = 15

    ctx.fillStyle = '#ffffff'
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
    ctx.fill()

    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    // Static holographic stripe
    const stripeHeight = 12
    const holoGradient = ctx.createLinearGradient(cardPadding, cardY, cardPadding + cardWidth, cardY)
    holoGradient.addColorStop(0, '#9b87f5')
    holoGradient.addColorStop(0.25, '#22c55e')
    holoGradient.addColorStop(0.5, '#f97316')
    holoGradient.addColorStop(0.75, '#ec4899')
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

    // Placeholder icon
    ctx.fillStyle = '#9ca3af'
    ctx.font = '80px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('🐾', WIDTH / 2, cardY + cardHeight / 2 + 20)

    // Pet name
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 100px system-ui, -apple-system, sans-serif'
    ctx.fillText(petName, WIDTH / 2, cardY + cardHeight + 150)

    // Logo
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif'
    ctx.fillText('PetLinkID', WIDTH / 2, 180)

    setPreviewLoaded(true)
  }, [petName])

  // Shimmer animation - now just updates the stripe, not the whole card
  const startShimmerAnimation = useCallback(() => {
    if (isRenderingRef.current) return
    
    let offset = 0
    const cardWidth = WIDTH - 120
    const animationSpeed = 8
    
    const animate = () => {
      if (!canvasRef.current) return
      
      offset += animationSpeed
      if (offset > cardWidth * 3) {
        offset = 0
      }
      
      generateCard(offset)
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }, [generateCard])

  const stopShimmerAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [])

  // Generate preview on mount
  useEffect(() => {
    generatePreview()
  }, [generatePreview])

  // Handle dialog open/close
  useEffect(() => {
    if (!isOpen) {
      stopShimmerAnimation()
      setAssetsLoaded(false)
      cachedAssetsRef.current = { petImage: null, qrImage: null, baseCardImageData: null }
      return
    }
    
    // Load assets and start animation
    const initCard = async () => {
      const loaded = await loadAssets()
      if (loaded && canvasRef.current) {
        generateCard(0)
        startShimmerAnimation()
      }
    }
    
    // Small delay to ensure canvas is mounted
    const timeoutId = setTimeout(initCard, 100)
    
    return () => {
      clearTimeout(timeoutId)
      stopShimmerAnimation()
    }
  }, [isOpen, loadAssets, generateCard, startShimmerAnimation, stopShimmerAnimation])

  // Retry handler
  const handleRetry = async () => {
    stopShimmerAnimation()
    const loaded = await loadAssets()
    if (loaded && canvasRef.current) {
      generateCard(0)
      startShimmerAnimation()
    }
  }

  const getShareToastMessage = (result: ShareResult) => {
    switch (result.method) {
      case 'native':
        return {
          title: 'Share sheet opened!',
          description: 'Select Instagram → Stories to share your PetLinkID!',
        }
      case 'web-share':
        return {
          title: 'Share sheet opened!',
          description: 'Select Instagram to share your PetLinkID!',
        }
      case 'web-share-url':
        return {
          title: 'Share sheet opened!',
          description: 'Share your PetLinkID link!',
        }
      case 'download':
        return {
          title: 'Image saved!',
          description: result.captionCopied 
            ? 'Caption copied! Open Instagram and add the saved image.'
            : 'Open Instagram and add the saved image.',
        }
      default:
        return {
          title: 'Ready to share!',
          description: 'Share your PetLinkID on Instagram!',
        }
    }
  }

  const handleShare = async () => {
    // Generate final card without animation
    generateCard(0)
    const canvas = canvasRef.current
    if (!canvas) return

    const blob = await canvasToBlob(canvas)
    if (!blob) {
      toast({
        title: 'Error generating image',
        description: 'Please try again or use the Save button.',
        variant: 'destructive',
      })
      return
    }

    try {
      const result = await shareToInstagram({ imageBlob: blob, petName, publicUrl })
      const toastMessage = getShareToastMessage(result)
      toast(toastMessage)
      // Auto-close dialog after successful share
      setTimeout(() => setIsOpen(false), 500)
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
      // Don't close on cancel - let user try again
    }
  }

  const handleDownload = async () => {
    console.log('[InstagramShare] handleDownload started')
    generateCard(0)
    const canvas = canvasRef.current
    if (!canvas) return

    const blob = await canvasToBlob(canvas)
    if (!blob) {
      toast({
        title: 'Error generating image',
        description: 'Please try again.',
        variant: 'destructive',
      })
      return
    }
    
    try {
      const result = await downloadImage(blob, petName)
      console.log('[InstagramShare] Download result:', result)
      
      if (result === 'shared') {
        toast({
          title: 'Share sheet opened!',
          description: 'Save to Photos or share directly to Instagram! 🐾',
        })
      } else {
        toast({
          title: 'Card downloaded!',
          description: 'Share your PetLinkID on Instagram! 🐾',
        })
      }
      // Auto-close dialog after successful download
      setTimeout(() => setIsOpen(false), 500)
    } catch (error) {
      if ((error as Error).message?.includes('canceled') || (error as Error).message?.includes('cancelled')) {
        console.log('[InstagramShare] User cancelled share sheet')
        return
      }
      console.error('[InstagramShare] Download error:', error)
      toast({
        title: 'Error saving image',
        description: 'Please try the Share button instead.',
        variant: 'destructive',
      })
    }
  }

  const handleCopyToClipboard = async () => {
    generateCard(0)
    const canvas = canvasRef.current
    if (!canvas) return

    const blob = await canvasToBlob(canvas)
    if (!blob) {
      toast({
        title: 'Error generating image',
        description: 'Please try again.',
        variant: 'destructive',
      })
      return
    }
    
    const success = await copyImageToClipboard(blob)
    if (success) {
      toast({
        title: 'Copied to clipboard!',
        description: 'Paste the image into Instagram!',
      })
      // Auto-close dialog after successful copy
      setTimeout(() => setIsOpen(false), 500)
    } else {
      toast({
        title: 'Copy not supported',
        description: 'Use the Save button instead.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer group">
          <div className="relative rounded-xl overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all shadow-md hover:shadow-lg">
            <canvas
              ref={previewCanvasRef}
              className="w-full h-auto"
              style={{ 
                display: previewLoaded ? 'block' : 'none',
                maxHeight: '280px',
                objectFit: 'contain'
              }}
            />
            {!previewLoaded && (
              <div 
                className="w-full bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center"
                style={{ height: '280px' }}
              >
                <div className="animate-pulse text-muted-foreground text-sm">Loading preview...</div>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/95 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <Instagram className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-foreground">Create PetLinkID</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Tap to create your Instagram share card
          </p>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="w-5 h-5 text-purple-500" />
            {petName}&apos;s PetLinkID
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
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
            {loadError && !generating && (
              <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center gap-3">
                <p className="text-sm text-muted-foreground">Failed to load image</p>
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleShare} 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={generating || loadError}
            >
              <Instagram className="w-4 h-4 mr-2" />
              {Capacitor.isNativePlatform() ? 'Share to Instagram Stories' : 'Share to Instagram'}
            </Button>
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={handleDownload} variant="outline" disabled={generating || loadError}>
                <Download className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button onClick={handleCopyToClipboard} variant="outline" disabled={generating || loadError}>
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
              <Button onClick={handleShare} variant="outline" disabled={generating || loadError}>
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-2"
              onClick={() => setIsOpen(false)}
            >
              Done
            </Button>
          </div>

          {!Capacitor.isNativePlatform() && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && (
            <p className="text-xs text-muted-foreground text-center bg-muted/50 rounded-md p-2">
              💡 <strong>Tip:</strong> Copy or Save the image, then open Instagram and share it to your feed or story.
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
