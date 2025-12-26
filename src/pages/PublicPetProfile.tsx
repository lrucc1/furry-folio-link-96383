import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { Heart, MapPin, Shield, Calendar, Phone, Mail, User } from 'lucide-react'
import { calculateAge } from '@/lib/age-utils'
import { PetAvatarLarge } from '@/components/PetAvatar'

interface Pet {
  name: string
  species: string
  breed: string | null
  date_of_birth: string | null
  photo_url: string | null
  is_lost: boolean
  microchip_number: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  owner?: {
    email: string | null
    full_name: string | null
    phone: string | null
  }
}

const PublicPetProfile = () => {
  const { publicToken } = useParams<{ publicToken: string }>()
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (publicToken) {
      fetchPetDetails()
    }
  }, [publicToken])

  const fetchPetDetails = async () => {
    if (!publicToken) return

    try {
      // Fetch all pet data via the secure edge function
      const { data, error } = await supabase.functions.invoke('public-pet-contact', {
        body: { public_token: publicToken }
      });

      if (error || !data) {
        console.error('Error fetching pet details:', error);
        setPet(null);
        return;
      }

      // Construct pet object from edge function response
      setPet({
        name: data.pet.name,
        species: data.pet.species,
        breed: data.pet.breed,
        date_of_birth: data.pet.date_of_birth,
        photo_url: data.pet.photo_url,
        is_lost: data.pet.is_lost,
        microchip_number: data.pet.microchip_number,
        emergency_contact_name: data.emergency_contact.name,
        emergency_contact_phone: data.emergency_contact.phone,
        owner: data.owner ? {
          full_name: data.owner.full_name,
          email: data.owner.email,
          phone: data.owner.phone,
        } : undefined
      });
    } catch (error) {
      console.error('Error fetching pet details:', error);
      setPet(null);
    } finally {
      setLoading(false);
    }
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
              This pet profile could not be found.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-md md:max-w-2xl space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <a href="/" aria-label="Go to home">
              <Logo iconClassName="w-12 h-12" textClassName="font-bold text-2xl text-white" />
            </a>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Pet Profile</h1>
          {pet.is_lost && (
            <Badge variant="destructive" className="text-sm">
              <MapPin className="w-3 h-3 mr-1" />
              This pet is currently lost
            </Badge>
          )}
        </div>

        {/* Pet Information Card */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-strong">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-6">
              <PetAvatarLarge
                photoUrl={pet.photo_url}
                species={pet.species}
                name={pet.name}
                className="w-48 h-48"
              />
              
              <div className="text-center w-full">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-foreground">{pet.name}</h2>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  {pet.breed ? `${pet.breed} ${pet.species}` : pet.species}
                </p>

                <div className="grid grid-cols-1 gap-4 text-left max-w-md mx-auto">
                  {pet.date_of_birth && (
                    <div className="p-3 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground">Age</span>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {calculateAge(pet.date_of_birth)}
                      </p>
                    </div>
                  )}
                  {pet.microchip_number && (
                    <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                      <span className="text-sm text-muted-foreground">Microchip Number</span>
                      <p className="font-mono text-sm font-medium">
                        {pet.microchip_number.replace(/(.{3})/g, '$1 ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lost Pet Alert - only if marked as lost */}
            {pet.is_lost && (
              <div className="mt-6 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <h3 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  🚨 This pet is lost - Please help reunite them!
                </h3>
                <p className="text-sm text-muted-foreground">
                  If you've found {pet.name}, please contact the owner immediately using the details below.
                </p>
              </div>
            )}

            {/* Owner Contact Information - Only shown when pet is marked lost */}
            {pet.is_lost && (pet.owner?.phone || pet.owner?.email || pet.emergency_contact_phone) && (
              <Card className={`mt-6 ${pet.is_lost ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'}`}>
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-semibold text-sm mb-3">
                    {pet.is_lost ? '📞 Contact Owner Immediately' : '👋 If Found, Please Contact Owner'}
                  </h4>

                  {pet.owner?.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-primary" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Owner's Phone</p>
                        <a 
                          href={`tel:${pet.owner.phone}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {pet.owner.phone}
                        </a>
                      </div>
                      <Button 
                        size="sm" 
                        variant={pet.is_lost ? 'default' : 'outline'}
                        onClick={() => window.location.href = `tel:${pet.owner.phone}`}
                      >
                        Call Now
                      </Button>
                    </div>
                  )}

                  {pet.emergency_contact_phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-primary" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Emergency Contact</p>
                        <a 
                          href={`tel:${pet.emergency_contact_phone}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {pet.emergency_contact_phone}
                        </a>
                      </div>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = `tel:${pet.emergency_contact_phone}`}
                      >
                        Call
                      </Button>
                    </div>
                  )}
                  
                  {pet.owner?.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-primary" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Email</p>
                        <a 
                          href={`mailto:${pet.owner.email}`}
                          className="font-medium text-primary hover:underline break-all"
                        >
                          {pet.owner.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {pet.owner?.full_name && (
                    <div className="flex items-center gap-3 text-sm">
                      <User className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Owner</p>
                        <p className="font-medium">{pet.owner.full_name}</p>
                      </div>
                    </div>
                  )}

                  {pet.emergency_contact_name && (
                    <div className="flex items-center gap-3 text-sm">
                      <User className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Emergency Contact Name</p>
                        <p className="font-medium">{pet.emergency_contact_name}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!pet.is_lost && (
              <div className="mt-6 p-4 bg-muted/70 rounded-lg border border-muted">
                <p className="text-sm text-muted-foreground">
                  This pet is not marked as lost. Owner contact details are hidden until the pet is reported missing.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          {(pet.owner?.phone || pet.emergency_contact_phone) && (
            <Button
              className="w-full h-12 rounded-full text-base font-semibold"
              onClick={() => {
                const phone = pet.owner?.phone || pet.emergency_contact_phone
                if (phone) {
                  window.location.href = `tel:${phone}`
                }
              }}
            >
              Contact owner now
            </Button>
          )}

          <p className="text-white/80 text-sm text-center">
            Powered by PetLinkID - Keep your pets safe
          </p>
        </div>
      </div>
    </div>
  )
}

export default PublicPetProfile
