import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Copy, ExternalLink } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import QRCode from 'qrcode'

interface QRCodeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  publicUrl: string
  petName: string
}

export const QRCodeModal = ({ open, onOpenChange, publicUrl, petName }: QRCodeModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open && canvasRef.current) {
      setLoading(true)
      QRCode.toCanvas(canvasRef.current, publicUrl, {
        width: 280,
        margin: 2,
        color: { dark: '#1a1a1a', light: '#ffffff' }
      }, (error) => {
        if (error) {
          console.error('QR generation failed:', error)
          toast({
            title: 'Error',
            description: 'Failed to generate QR code',
            variant: 'destructive'
          })
        }
        setLoading(false)
      })
    }
  }, [open, publicUrl])

  const downloadQRCode = () => {
    if (!canvasRef.current) return

    try {
      const link = document.createElement('a')
      link.download = `${petName.replace(/\s+/g, '-').toLowerCase()}-qr-code.png`
      link.href = canvasRef.current.toDataURL('image/png')
      link.click()
      
      toast({
        title: 'QR Code Downloaded',
        description: 'The QR code has been saved to your device'
      })
    } catch (error) {
      console.error('Download failed:', error)
      toast({
        title: 'Download Failed',
        description: 'Could not download the QR code',
        variant: 'destructive'
      })
    }
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl)
    toast({
      title: 'Link Copied',
      description: 'Recovery link copied to clipboard'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{petName}'s QR Code</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <canvas 
              ref={canvasRef} 
              className={loading ? 'opacity-50' : ''}
            />
          </div>
          
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Scan this code to view {petName}'s public profile and contact information
          </p>

          <div className="w-full space-y-2">
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <code className="flex-1 text-xs font-mono truncate">{publicUrl}</code>
              <Button size="icon" variant="ghost" onClick={copyUrl} className="h-8 w-8 shrink-0">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={downloadQRCode} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download QR
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Profile
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
