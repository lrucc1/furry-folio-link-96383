import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { Heart, MapPin, Shield, Calendar, Phone, Mail, User } from 'lucide-react'
import { calculateAge } from '@/lib/age-utils'

interface Pet {
  id: string
  name: string
  species: string
  breed: string | null
  date_of_birth: string | null
  photo_url: string | null
  is_lost: boolean
  public_id: string
  microchip_number: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  profiles?: {
    email: string | null
    full_name: string | null
    phone: string | null
  }
}

const PublicPetProfile = () => {
  const { publicId } = useParams<{ publicId: string }>()
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (publicId) {
      fetchPetDetails()
    }
  }, [publicId])

  const fetchPetDetails = async () => {
    if (!publicId) return

    try {
      // First get the pet data
      const { data: petData, error: petError } = await supabase
        .from('pets')
        .select(`
          id, 
          name, 
          species, 
          breed, 
          date_of_birth, 
          photo_url, 
          is_lost, 
          public_id, 
          microchip_number,
          emergency_contact_name,
          emergency_contact_phone,
          user_id
        `)
        .eq('public_id', publicId)
        .single()

      if (petError) throw petError

      // Fetch owner profile data via public function (always, for "found pet" scenarios)
      let ownerProfile = null
      try {
        const { data, error } = await supabase.functions.invoke('public-pet-contact', {
          body: { public_id: publicId }
        });

        if (!error && data?.owner) {
          ownerProfile = {
            full_name: data.owner.full_name ?? null,
            email: data.owner.email ?? null,
            phone: data.owner.phone ?? null,
          };
        }
      } catch (e) {
        console.error('Error invoking public-pet-contact:', e);
      }

      setPet({
        ...petData,
        profiles: ownerProfile
      })
    } catch (error) {
      console.error('Error fetching pet details:', error)
    } finally {
      setLoading(false)
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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Logo iconClassName="w-12 h-12" textClassName="font-bold text-2xl text-white" />
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
              <div className="w-48 h-48 rounded-xl overflow-hidden bg-muted">
                {pet.photo_url ? (
                  <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Heart className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="text-center w-full">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-foreground">{pet.name}</h2>
                  <Badge variant="secondary" className="font-mono text-xs px-3 py-1">
                    <Shield className="w-3 h-3 mr-1.5" />
                    {pet.public_id}
                  </Badge>
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

            {/* Owner Contact Information - Always shown */}
            {(pet.profiles?.phone || pet.profiles?.email || pet.emergency_contact_phone) && (
              <Card className={`mt-6 ${pet.is_lost ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'}`}>
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-semibold text-sm mb-3">
                    {pet.is_lost ? '📞 Contact Owner Immediately' : '👋 If Found, Please Contact Owner'}
                  </h4>
                  
                  {!pet.is_lost && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Found this pet? They're not marked as lost, but the owner would appreciate being contacted.
                    </p>
                  )}

                  {pet.profiles?.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-primary" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Owner's Phone</p>
                        <a 
                          href={`tel:${pet.profiles.phone}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {pet.profiles.phone}
                        </a>
                      </div>
                      <Button 
                        size="sm" 
                        variant={pet.is_lost ? 'default' : 'outline'}
                        onClick={() => window.location.href = `tel:${pet.profiles.phone}`}
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
                  
                  {pet.profiles?.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-primary" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Email</p>
                        <a 
                          href={`mailto:${pet.profiles.email}`}
                          className="font-medium text-primary hover:underline break-all"
                        >
                          {pet.profiles.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {pet.profiles?.full_name && (
                    <div className="flex items-center gap-3 text-sm">
                      <User className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Owner</p>
                        <p className="font-medium">{pet.profiles.full_name}</p>
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
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm">
            Powered by PetLinkID - Keep your pets safe
          </p>
        </div>
      </div>
    </div>
  )
}

export default PublicPetProfile
