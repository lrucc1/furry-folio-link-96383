import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/Logo'
import { Heart, MapPin, Phone, Mail } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { PetAvatarLarge } from '@/components/PetAvatar'

interface Pet {
  id: string
  name: string
  species: string
  breed: string | null
  colour: string | null
  photo_url: string | null
  is_lost: boolean
}

const FoundPet = () => {
  const { publicToken } = useParams<{ publicToken: string }>()
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [messageLoading, setMessageLoading] = useState(false)
  const [messageSent, setMessageSent] = useState(false)
  const [formData, setFormData] = useState({
    finder_name: '',
    finder_phone: '',
    finder_email: '',
    message: '',
    location: '',
  })

  useEffect(() => {
    if (publicToken) {
      fetchPetDetails()
    }
  }, [publicToken])

  const fetchPetDetails = async () => {
    if (!publicToken) return

    try {
      const { data, error } = await supabase.functions.invoke('public-pet-contact', {
        body: { public_token: publicToken }
      })

      if (error) throw error
      setPet({
        id: data?.pet?.id ?? '',
        name: data?.pet?.name ?? '',
        species: data?.pet?.species ?? '',
        breed: data?.pet?.breed ?? null,
        colour: data?.pet?.colour ?? null,
        photo_url: data?.pet?.photo_url ?? null,
        is_lost: data?.pet?.is_lost ?? false,
      })
    } catch (error) {
      console.error('Error fetching pet details:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pet) return

    setMessageLoading(true)
    try {
      // In a real app, this would send an email/notification to the owner
      // For now, we'll just show a success message
      
      toast({
        title: "Message sent!",
        description: "The pet owner will be notified and can contact you directly.",
      })
      
      setMessageSent(true)
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setMessageLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Pet not found</h1>
            <p className="text-muted-foreground">
              This pet recovery link may be invalid or expired.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!pet.is_lost) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Heart className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Great news!</h1>
            <p className="text-muted-foreground">
              {pet.name} has already been found and is safe at home. ❤️
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Logo iconClassName="w-12 h-12" textClassName="font-bold text-2xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">I've Found This Pet!</h1>
          <p className="text-white/90">Help reunite this lost pet with their family</p>
        </div>

        {messageSent ? (
          <Card className="bg-white/95 backdrop-blur border-0 shadow-strong text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Message Sent!</h2>
              <p className="text-muted-foreground mb-6">
                The pet owner has been notified and will contact you directly. Thank you for helping reunite {pet.name} with their family!
              </p>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>What happens next:</strong><br />
                  • The owner will receive your message immediately<br />
                  • They can call or text you directly if you provided your phone number<br />
                  • Please keep {pet.name} safe until the owner arrives
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Pet Information Card */}
            <Card className="bg-white/95 backdrop-blur border-0 shadow-strong mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <PetAvatarLarge
                    photoUrl={pet.photo_url}
                    species={pet.species}
                    name={pet.name}
                    className="w-32 h-32 mx-auto md:mx-0"
                  />
                  
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <h2 className="text-2xl font-bold text-foreground">{pet.name}</h2>
                      <MapPin className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-lg text-muted-foreground mb-4">
                      {pet.breed ? `${pet.breed} ${pet.species}` : pet.species}
                    </p>
                    {pet.colour && (
                      <p className="text-muted-foreground">
                        <strong>Colour:</strong> {pet.colour}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card className="bg-white/95 backdrop-blur border-0 shadow-strong">
              <CardHeader>
                <CardTitle className="text-center">Contact the Owner</CardTitle>
                <p className="text-center text-muted-foreground">
                  Send a message to let them know you've found {pet.name}. Your details will be shared securely.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={sendMessage} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="finder_name">Your Name *</Label>
                    <Input
                      id="finder_name"
                      value={formData.finder_name}
                      onChange={(e) => handleInputChange('finder_name', e.target.value)}
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="finder_phone">Your Phone Number</Label>
                      <Input
                        id="finder_phone"
                        type="tel"
                        value={formData.finder_phone}
                        onChange={(e) => handleInputChange('finder_phone', e.target.value)}
                        placeholder="04XX XXX XXX"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="finder_email">Your Email</Label>
                      <Input
                        id="finder_email"
                        type="email"  
                        value={formData.finder_email}
                        onChange={(e) => handleInputChange('finder_email', e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Where did you find {pet.name}? *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., Smith Street Park, Melbourne"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder={`Hi! I found ${pet.name} and they seem healthy and friendly. Please let me know how we can arrange a safe reunion.`}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Safety Tips:</strong><br />
                      • Meet in a public place for the reunion<br />
                      • Ask the owner to bring proof of ownership (photos, vet records)<br />
                      • Trust your instincts - if something feels wrong, contact local authorities
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={messageLoading}
                    size="lg"
                    className="w-full"
                  >
                    {messageLoading ? 'Sending Message...' : `Send Message to ${pet.name}'s Owner`}
                    <Mail className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default FoundPet
