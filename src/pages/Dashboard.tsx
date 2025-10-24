import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePlan } from '@/lib/plan/PlanContext'
import { TierFeatures } from '@/config/tierFeatures'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PetCard } from '@/components/PetCard'
import { AddPetCard } from '@/components/AddPetCard'
import { HealthReminders } from '@/components/HealthReminders'
import { DashboardHeader } from '@/components/DashboardHeader'
import { Footer } from '@/components/Footer'
import { PendingInvitesModal } from '@/components/PendingInvitesModal'
import { Plus, Crown, Heart } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { calculateAge } from '@/lib/age-utils'
import { au } from '@/lib/auEnglish'

interface Pet {
  id: string
  name: string
  species: string
  breed: string | null
  date_of_birth: string | null
  photo_url: string | null
  is_lost: boolean
  microchip_number: string | null
  created_at: string
  public_id: string
}

const Dashboard = () => {
  const { user } = useAuth()
  const { tier } = usePlan()
  const navigate = useNavigate()
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvitesModal, setShowInvitesModal] = useState(false)
  const [hasCheckedInvites, setHasCheckedInvites] = useState(false)

  useEffect(() => {
    fetchPets()
    checkPendingInvites()
  }, [user])

  const checkPendingInvites = async () => {
    if (!user || hasCheckedInvites) return;

    try {
      const { data, error } = await supabase
        .from('pet_invites')
        .select('id')
        .eq('email', user.email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        // Small delay so user sees the dashboard first
        setTimeout(() => {
          setShowInvitesModal(true);
        }, 500);
      }
      
      setHasCheckedInvites(true);
    } catch (error) {
      console.error('Error checking pending invites:', error);
    }
  };

  const fetchPets = async () => {
    if (!user) return

    try {
      // Fetch pets owned by user
      const { data: ownedPets, error: ownedError } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)

      if (ownedError) throw ownedError

      // Fetch shared pet IDs via memberships
      const { data: memberships, error: membershipError } = await supabase
        .from('pet_memberships')
        .select('pet_id')
        .eq('user_id', user.id)

      if (membershipError) throw membershipError

      // Fetch the actual shared pets
      let sharedPets: Pet[] = []
      if (memberships && memberships.length > 0) {
        const petIds = memberships.map(m => m.pet_id)
        const { data: sharedPetsData, error: sharedError } = await supabase
          .from('pets')
          .select('*')
          .in('id', petIds)

        if (sharedError) throw sharedError
        sharedPets = sharedPetsData || []
      }

      // Combine owned and shared pets
      const allPets = [...(ownedPets || []), ...sharedPets]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setPets(allPets)
    } catch (error) {
      console.error('Error fetching pets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewPetDetails = (pet: any) => {
    // Navigate to pet details
    navigate(`/pets/${pet.id}`)
  }

  const handleToggleLost = async (petId: string) => {
    try {
      const pet = pets.find(p => p.id === petId)
      if (!pet) return

      const { error } = await supabase
        .from('pets')
        .update({ is_lost: !pet.is_lost })
        .eq('id', petId)

      if (error) throw error

      setPets(pets.map(p => 
        p.id === petId ? { ...p, is_lost: !p.is_lost } : p
      ))
    } catch (error) {
      console.error('Error toggling lost status:', error)
    }
  }

  const maxPets = TierFeatures[tier].maxPets as number
  const canAddPet = maxPets === -1 || pets.length < maxPets

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{au('My Pets')}</h1>
            <p className="text-muted-foreground mt-1">
              {au('Manage your furry family members')}
            </p>
          </div>
          
          {!canAddPet && tier === 'free' && (
            <Badge className="bg-gradient-accent text-accent-foreground">
              <Crown className="w-3 h-3 mr-1" />
              {au('Upgrade for more pets')}
            </Badge>
          )}
        </div>

        {pets.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="text-xl mb-2">{au('No pets yet')}</CardTitle>
              <p className="text-muted-foreground mb-6">
                {au('Add your first pet to get started with PetLinkID')}
              </p>
              <Button asChild size="lg">
                <Link to="/pets/new">
                  <Plus className="w-4 h-4 mr-2" />
                  {au('Add Your First Pet')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid lg:grid-cols-4 gap-6 mb-8">
              <div className="lg:col-span-1">
                <HealthReminders />
              </div>
              
              <div className="lg:col-span-3">
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {pets.map((pet) => (
                    <PetCard
                      key={pet.id}
                      pet={{
                        id: pet.id,
                        name: pet.name,
                        species: pet.species,
                        breed: pet.breed || '',
                        age: calculateAge(pet.date_of_birth),
                        photo: pet.photo_url || 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop',
                        isLost: pet.is_lost,
                        microchipNumber: pet.microchip_number || '',
                        lastVaccination: '2024-06-15',
                        publicId: pet.public_id
                      }}
                      onViewDetails={handleViewPetDetails}
                      onToggleLost={handleToggleLost}
                    />
                  ))}
                  
                  {canAddPet && <AddPetCard />}
                </div>

                {!canAddPet && tier === 'free' && (
                  <Card className="bg-gradient-card border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-primary" />
                        {au('Upgrade to Add More Pets')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        {au(`You've reached the limit of ${maxPets} pet on the Free plan. Upgrade to Pro for unlimited pets.`)}
                      </p>
                      <Button asChild variant="hero">
                        <Link to="/pricing">
                          {au('Upgrade Now')}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      
      <PendingInvitesModal 
        open={showInvitesModal} 
        onClose={() => setShowInvitesModal(false)} 
      />
      
      <Footer />
    </div>
  )
}

export default Dashboard