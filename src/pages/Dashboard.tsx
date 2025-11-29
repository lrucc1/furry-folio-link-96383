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
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { PendingInvitesModal } from '@/components/PendingInvitesModal'
import { IOSPageLayout } from '@/components/ios/IOSPageLayout'
import { Plus, Crown, Heart, RefreshCw, Scale, Tag, Bell } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { calculateAge } from '@/lib/age-utils'
import { au } from '@/lib/auEnglish'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { toast } from 'sonner'
import { useAutoTimezone } from '@/hooks/useAutoTimezone'
import { useIsNativeApp } from '@/hooks/useIsNativeApp'

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
  weight_kg?: number | null
}

const Dashboard = () => {
  const { user } = useAuth()
  const { tier } = usePlan()
  const navigate = useNavigate()
  const isNative = useIsNativeApp()
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvitesModal, setShowInvitesModal] = useState(false)
  const [hasCheckedInvites, setHasCheckedInvites] = useState(false)

  // Auto-detect and save timezone for new users
  useAutoTimezone(user?.id)

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
      // Error handled silently
    }
  };

  const fetchPets = async () => {
    if (!user) return

    try {
      // Fetch pets owned by user with limit
      const { data: ownedPets, error: ownedError } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .limit(100)

      if (ownedError) throw ownedError

      // Fetch shared pet IDs via memberships with limit
      const { data: memberships, error: membershipError } = await supabase
        .from('pet_memberships')
        .select('pet_id')
        .eq('user_id', user.id)
        .limit(100)

      if (membershipError) throw membershipError

      // Fetch the actual shared pets
      let sharedPets: Pet[] = []
      if (memberships && memberships.length > 0) {
        const petIds = memberships.map(m => m.pet_id)
        const { data: sharedPetsData, error: sharedError } = await supabase
          .from('pets')
          .select('*')
          .in('id', petIds)
          .limit(100)

        if (sharedError) throw sharedError
        sharedPets = sharedPetsData || []
      }

      // Combine owned and shared pets
      const allPets = [...(ownedPets || []), ...sharedPets]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setPets(allPets)
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await fetchPets();
    toast.success('Dashboard refreshed');
  };

  const {
    containerRef,
    isRefreshing,
    pullDistance,
    shouldShowLoader,
    loaderOpacity,
    loaderRotation,
  } = usePullToRefresh({
    onRefresh: handleRefresh,
  });

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
      // Error handled silently
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

  const PetsContent = () => (
    <>
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{au('My Pets')}</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
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
          {/* iOS: Simple grid without health reminders sidebar */}
          {isNative ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
          ) : (
            /* Web: Full layout with health reminders sidebar */
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="lg:col-span-1 order-first lg:order-1">
                <HealthReminders />
              </div>
              
              <div className="lg:col-span-3 order-last lg:order-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
          )}

          {/* Upgrade card for iOS */}
          {isNative && !canAddPet && tier === 'free' && (
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
        </>
      )}
    </>
  )

  const MobileDashboard = () => {
    const primaryPet = pets[0]

    return (
      <div className="md:hidden max-w-md mx-auto px-4 pt-4 pb-24 space-y-5">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5 space-y-2">
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="text-2xl font-bold">Manage your pets in one place</h1>
            <p className="text-sm text-muted-foreground">Passports, QR tags, health and recovery are all here.</p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-medium text-muted-foreground">Your Pets</h3>
            {pets.length > 0 && (
              <Button variant="ghost" size="sm" className="h-9" onClick={() => navigate('/pets/new')}>
                <Plus className="w-4 h-4 mr-1" />
                Add pet
              </Button>
            )}
          </div>

          {pets.length === 0 ? (
            <Card className="rounded-2xl text-center shadow-sm">
              <CardContent className="p-8 space-y-3">
                <Heart className="w-10 h-10 text-muted-foreground mx-auto" />
                <h3 className="font-semibold text-lg">No pets yet</h3>
                <p className="text-sm text-muted-foreground">Add your first pet to get started.</p>
                <Button className="w-full rounded-full" onClick={() => navigate('/pets/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add your first pet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {pets.map((pet) => (
                <Card
                  key={pet.id}
                  className="rounded-2xl shadow-sm cursor-pointer"
                  onClick={() => handleViewPetDetails(pet)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                      <img
                        src={pet.photo_url || 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop'}
                        alt={pet.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm truncate">{pet.name}</h4>
                        {pet.is_lost && <Badge variant="destructive" className="text-xs px-1.5 py-0">Lost</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {pet.breed || pet.species}
                      </p>
                    </div>
                    <Badge variant="secondary" className="px-2 py-0.5 rounded-full text-xs flex-shrink-0">Open</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {primaryPet && (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Quick actions</p>
                  <h3 className="text-lg font-semibold">{primaryPet.name}</h3>
                </div>
                <Badge variant="secondary">{tier === 'pro' ? 'Pro' : 'Free'}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-16 rounded-2xl flex flex-col items-center justify-center gap-1 text-center p-2"
                  onClick={() => navigate(`/pets/${primaryPet.id}`)}>
                  <Heart className="w-4 h-4" />
                  <span className="text-xs font-semibold">Pet Passport</span>
                </Button>
                <Button variant="outline" className="h-16 rounded-2xl flex flex-col items-center justify-center gap-1 text-center p-2"
                  onClick={() => navigate(`/pets/${primaryPet.id}/weight`)}>
                  <Scale className="w-4 h-4" />
                  <span className="text-xs font-semibold">Weight</span>
                </Button>
                <Button variant="outline" className="h-16 rounded-2xl flex flex-col items-center justify-center gap-1 text-center p-2"
                  onClick={() => navigate(`/pets/${primaryPet.id}#health`)}>
                  <Bell className="w-4 h-4" />
                  <span className="text-xs font-semibold">Medical</span>
                </Button>
                <Button variant="outline" className="h-16 rounded-2xl flex flex-col items-center justify-center gap-1 text-center p-2"
                  onClick={() => navigate('/smart-tags')}>
                  <Tag className="w-4 h-4" />
                  <span className="text-xs font-semibold">QR Tag</span>
                </Button>
              </div>
              <Button className="w-full rounded-full h-12" onClick={() => navigate('/pets/new')}>
                <Plus className="w-4 h-4 mr-2" /> Add another pet
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // iOS Native Layout
  if (isNative) {
    return (
      <IOSPageLayout title={au('My Pets')}>
        <div 
          ref={containerRef}
          className="px-4 py-6"
          style={{ 
            transform: `translateY(${pullDistance}px)`, 
            transition: isRefreshing ? 'transform 0.3s ease-out' : 'none' 
          }}
        >
          {shouldShowLoader && (
            <div 
              className="fixed top-20 left-1/2 -translate-x-1/2 z-40"
              style={{ opacity: loaderOpacity }}
            >
              <RefreshCw 
                className="w-6 h-6 text-primary" 
                style={{ transform: `rotate(${loaderRotation}deg)` }}
              />
            </div>
          )}
          
          <PetsContent />
        </div>
        
        <PendingInvitesModal 
          open={showInvitesModal} 
          onClose={() => setShowInvitesModal(false)} 
        />
      </IOSPageLayout>
    )
  }

  // Web Layout
  return (
    <div ref={containerRef} className="min-h-screen bg-background" style={{ transform: `translateY(${pullDistance}px)`, transition: isRefreshing ? 'transform 0.3s ease-out' : 'none' }}>
      {shouldShowLoader && (
        <div
          className="fixed top-0 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center pt-4"
          style={{ opacity: loaderOpacity }}
        >
          <RefreshCw 
            className="w-6 h-6 text-primary" 
            style={{ transform: `rotate(${loaderRotation}deg)` }}
          />
        </div>
      )}
      <Header />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="md:hidden">
          <MobileDashboard />
        </div>

        <div className="hidden md:block">
          <PetsContent />
        </div>
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
