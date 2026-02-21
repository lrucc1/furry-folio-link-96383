import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { calculateAge } from '@/lib/age-utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, MapPin, QrCode, Shield, Users, Edit, Download, Scan, Bell, CheckCircle, Plus, Eye, Edit2, Syringe, AlertCircle, Home, Scale } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { PetDocuments } from '@/components/PetDocuments'
import { PetPhotoGallery } from '@/components/PetPhotoGallery'
import { VaccinationModal } from '@/components/VaccinationModal'
import { EditVaccinationModal } from '@/components/EditVaccinationModal'
import { SharingTab } from '@/components/SharingTab'
import { HealthReminderModal } from '@/components/HealthReminderModal'
import { EditHealthReminderModal } from '@/components/EditHealthReminderModal'
import { InstagramShareCard } from '@/components/InstagramShareCard'
import { QRCodeModal } from '@/components/QRCodeModal'
import { LostPetPosterModal } from '@/components/LostPetPosterModal'
import { IOSPageLayout } from '@/components/ios/IOSPageLayout'
import { MobileCard } from '@/components/ios/MobileCard'
import { SwipeableItem } from '@/components/ios/SwipeableItem'
import { PetAvatarLarge } from '@/components/PetAvatar'
import { log } from '@/lib/log'

interface Pet {
  id: string
  name: string
  species: string
  breed: string | null
  colour: string | null
  gender: string | null
  date_of_birth: string | null
  desexed: boolean
  weight_kg: number | null
  microchip_number: string | null
  registry_name: string | null
  registry_link: string | null
  vet_clinic: string | null
  clinic_name: string | null
  clinic_address: string | null
  insurance_provider: string | null
  insurance_policy: string | null
  notes: string | null
  photo_url: string | null
  is_lost: boolean
  public_id: string
  public_token: string
  created_at: string
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  user_id: string
}

interface Vaccination {
  id: string
  vaccine_name: string
  vaccine_date: string
  next_due_date: string | null
  notes: string | null
}

interface HealthReminder {
  id: string
  title: string
  reminder_type: string | null
  reminder_date: string
  description: string | null
  completed: boolean
}

const PetDetails = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pet, setPet] = useState<Pet | null>(null)
  const [ownerPhone, setOwnerPhone] = useState<string | null>(null)
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
  const [healthReminders, setHealthReminders] = useState<HealthReminder[]>([])
  const [loading, setLoading] = useState(true)
  const [vaccinationModalOpen, setVaccinationModalOpen] = useState(false)
  const [editVaccinationModalOpen, setEditVaccinationModalOpen] = useState(false)
  const [selectedVaccination, setSelectedVaccination] = useState<Vaccination | null>(null)
  const [healthReminderModalOpen, setHealthReminderModalOpen] = useState(false)
  const [editReminderModalOpen, setEditReminderModalOpen] = useState(false)
  const [selectedReminder, setSelectedReminder] = useState<HealthReminder | null>(null)
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false)
  const [posterModalOpen, setPosterModalOpen] = useState(false)

  const fetchPetDetails = useCallback(async () => {
    if (!user || !id) return

    try {
      const { data, error } = await (supabase as any)
        .from('pets')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setPet(data)

      if (data?.user_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', data.user_id)
          .maybeSingle()
        
        if (profileData?.phone) {
          setOwnerPhone(profileData.phone)
        }
      }
    } catch (error) {
      log.error('Error fetching pet details:', error)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }, [id, user, navigate])

  const fetchVaccinations = useCallback(async () => {
    if (!id) return

    try {
      const { data, error } = await (supabase as any)
        .from('vaccinations')
        .select('id, vaccine_name, vaccine_date, next_due_date, notes')
        .eq('pet_id', id)
        .order('vaccine_date', { ascending: false })

      if (error) throw error
      setVaccinations(data || [])
    } catch (error) {
      log.error('Error fetching vaccinations:', error)
    }
  }, [id])

  const fetchHealthReminders = useCallback(async () => {
    if (!id) return

    try {
      const { data, error } = await (supabase as any)
        .from('health_reminders')
        .select('*')
        .eq('pet_id', id)
        .order('reminder_date', { ascending: true })

      if (error) throw error
      setHealthReminders(data || [])
    } catch (error) {
      log.error('Error fetching health reminders:', error)
    }
  }, [id])

  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchPetDetails(), fetchVaccinations(), fetchHealthReminders()]);
  }, [fetchPetDetails, fetchVaccinations, fetchHealthReminders])

  useEffect(() => {
    if (id) {
      fetchPetDetails()
      fetchVaccinations()
      fetchHealthReminders()
    }
  }, [id, user, fetchPetDetails, fetchVaccinations, fetchHealthReminders])

  const toggleReminderComplete = async (reminderId: string, currentStatus: boolean) => {
    const reminder = healthReminders.find(r => r.id === reminderId);
    const newStatus = !currentStatus;
    
    setHealthReminders(healthReminders.map(r => 
      r.id === reminderId ? { ...r, completed: newStatus } : r
    ));

    try {
      const { error } = await (supabase as any)
        .from('health_reminders')
        .update({ completed: newStatus })
        .eq('id', reminderId)

      if (error) throw error

      if (newStatus && reminder) {
        toast({
          title: "Reminder completed",
          description: reminder.title,
          action: (
            <ToastAction 
              altText="Undo"
              onClick={() => toggleReminderComplete(reminderId, true)}
            >
              Undo
            </ToastAction>
          ),
        })
      } else {
        toast({
          title: "Reminder reopened",
        })
      }
    } catch (error) {
      setHealthReminders(healthReminders.map(r => 
        r.id === reminderId ? { ...r, completed: currentStatus } : r
      ));
      log.error('Error updating reminder:', error)
      toast({
        title: "Error",
        description: "Failed to update reminder",
        variant: "destructive",
      })
    }
  }

  const deleteReminder = async (reminderId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('health_reminders')
        .delete()
        .eq('id', reminderId)

      if (error) throw error
      setHealthReminders(healthReminders.filter(r => r.id !== reminderId))
      toast({ title: "Reminder deleted" })
    } catch (error) {
      log.error('Error deleting reminder:', error)
      toast({ title: "Error", description: "Failed to delete reminder", variant: "destructive" })
    }
  }

  const deleteVaccination = async (vaccinationId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('vaccinations')
        .delete()
        .eq('id', vaccinationId)

      if (error) throw error
      setVaccinations(vaccinations.filter(v => v.id !== vaccinationId))
      toast({ title: "Vaccination deleted" })
    } catch (error) {
      log.error('Error deleting vaccination:', error)
      toast({ title: "Error", description: "Failed to delete vaccination", variant: "destructive" })
    }
  }

  const handleEditVaccination = (vaccination: Vaccination) => {
    setSelectedVaccination(vaccination)
    setEditVaccinationModalOpen(true)
  }

  const handleEditReminder = (reminder: HealthReminder) => {
    setSelectedReminder(reminder)
    setEditReminderModalOpen(true)
  }

  const toggleLostStatus = async () => {
    if (!pet) return

    try {
      const { error } = await (supabase as any)
        .from('pets')
        .update({ is_lost: !pet.is_lost })
        .eq('id', pet.id)

      if (error) throw error

      setPet({ ...pet, is_lost: !pet.is_lost })
      
      toast({
        title: pet.is_lost ? "Pet marked as found!" : "Pet marked as lost",
        description: pet.is_lost 
          ? `${pet.name} has been marked as found.`
          : `${pet.name} has been marked as lost. Share the recovery link to help bring them home.`,
      })
    } catch (error) {
      log.error('Error toggling lost status:', error)
      toast({
        title: "Error",
        description: "Failed to update pet status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const generatePoster = () => {
    setPosterModalOpen(true)
  }

  const shareRecoveryLink = async () => {
    const url = `${window.location.origin}/found/${pet?.public_token}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Help find ${pet?.name}`,
          text: `I've lost my ${pet?.species.toLowerCase()} ${pet?.name}. Please help me find them!`,
          url: url,
        })
      } catch (error) {
        log.error('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(url)
      toast({
        title: "Link copied!",
        description: "Recovery link has been copied to your clipboard.",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!pet) {
    return (
      <IOSPageLayout title="Pet Details">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Pet not found</h1>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </IOSPageLayout>
    )
  }

  const publicUrl = `${window.location.origin}/found/${pet.public_token}`

  const iosHeaderRight = (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" asChild className="h-10 w-10 p-0 touch-manipulation">
        <Link to={`/pets/${pet.id}/weight`}>
          <Scale className="w-5 h-5" />
        </Link>
      </Button>
      <Button variant="ghost" size="sm" asChild className="h-10 w-10 p-0 touch-manipulation">
        <Link to={`/pets/${pet.id}/edit`}>
          <Edit className="w-5 h-5" />
        </Link>
      </Button>
    </div>
  )

  const iosPetContent = (
    <div className="space-y-4">
      {/* Pet Header Card */}
      <MobileCard className="overflow-hidden">
        <div className="flex gap-4">
          <PetAvatarLarge 
            photoUrl={pet.photo_url} 
            species={pet.species} 
            name={pet.name}
            className="w-20 h-20 flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground truncate">{pet.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {pet.breed ? `${pet.breed} ${pet.species}` : pet.species}
                </p>
              </div>
              {pet.is_lost && (
                <Badge variant="destructive" className="text-xs flex-shrink-0">
                  <MapPin className="w-3 h-3 mr-1" />
                  Lost
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {pet.date_of_birth && (
                <Badge variant="secondary" className="text-xs">
                  {calculateAge(pet.date_of_birth)}
                </Badge>
              )}
              {pet.weight_kg && (
                <Badge variant="secondary" className="text-xs">
                  {pet.weight_kg} kg
                </Badge>
              )}
              {pet.gender && (
                <Badge variant="outline" className="text-xs">
                  {pet.gender}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </MobileCard>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-4 gap-2">
        <Button 
          variant="outline" 
          className="h-16 flex-col gap-1 rounded-xl touch-manipulation"
          onClick={() => navigate(`/pets/${pet.id}/edit`)}
        >
          <Edit2 className="w-5 h-5" />
          <span className="text-xs">Edit</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-16 flex-col gap-1 rounded-xl touch-manipulation"
          onClick={() => navigate(`/pets/${pet.id}/weight`)}
        >
          <Scale className="w-5 h-5" />
          <span className="text-xs">Weight</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-16 flex-col gap-1 rounded-xl touch-manipulation"
          onClick={shareRecoveryLink}
        >
          <QrCode className="w-5 h-5" />
          <span className="text-xs">QR</span>
        </Button>
        <Button 
          variant={pet.is_lost ? "destructive" : "outline"}
          className="h-16 flex-col gap-1 rounded-xl touch-manipulation"
          onClick={toggleLostStatus}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-xs">{pet.is_lost ? 'Found' : 'Lost'}</span>
        </Button>
      </div>

      {/* iOS Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full grid grid-cols-4 h-12 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg h-10 text-xs touch-manipulation">
            <Home className="w-4 h-4 mr-1" />
            Info
          </TabsTrigger>
          <TabsTrigger value="health" className="rounded-lg h-10 text-xs touch-manipulation">
            <Heart className="w-4 h-4 mr-1" />
            Health
          </TabsTrigger>
          <TabsTrigger value="lost" className="rounded-lg h-10 text-xs touch-manipulation">
            <AlertCircle className="w-4 h-4 mr-1" />
            Lost
          </TabsTrigger>
          <TabsTrigger value="sharing" className="rounded-lg h-10 text-xs touch-manipulation">
            <Users className="w-4 h-4 mr-1" />
            Share
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <MobileCard>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Scan className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Microchip</h3>
                <p className="text-sm text-muted-foreground">
                  {pet.microchip_number ? pet.microchip_number.replace(/(.{3})/g, '$1 ') : 'Not registered'}
                </p>
              </div>
            </div>
            {pet.registry_name && (
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">Registry: {pet.registry_name}</p>
              </div>
            )}
          </MobileCard>

          {(pet.clinic_name || pet.clinic_address) && (
            <MobileCard>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{pet.clinic_name || 'Vet Clinic'}</h3>
                  {pet.clinic_address && (
                    <p className="text-sm text-muted-foreground">{pet.clinic_address}</p>
                  )}
                </div>
              </div>
            </MobileCard>
          )}

          {pet.insurance_provider && (
            <MobileCard>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{pet.insurance_provider}</h3>
                  {pet.insurance_policy && (
                    <p className="text-sm text-muted-foreground">Policy: {pet.insurance_policy}</p>
                  )}
                </div>
              </div>
            </MobileCard>
          )}

          {pet.notes && (
            <MobileCard>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground">{pet.notes}</p>
            </MobileCard>
          )}

          <MobileCard>
            <PetPhotoGallery 
              petId={pet.id}
              currentProfilePhoto={pet.photo_url}
              onProfilePhotoChange={(url) => setPet({ ...pet, photo_url: url || null })}
            />
          </MobileCard>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="space-y-4 mt-4">
          <MobileCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Syringe className="w-4 h-4" />
                Vaccinations
              </h3>
              <Button 
                size="sm" 
                variant="outline"
                className="h-9 touch-manipulation"
                onClick={() => setVaccinationModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            
            {vaccinations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No vaccinations recorded</p>
            ) : (
              <div className="space-y-3">
                {vaccinations.slice(0, 5).map((vac) => (
                  <SwipeableItem 
                    key={vac.id}
                    onDelete={() => deleteVaccination(vac.id)}
                    deleteConfirmTitle="Delete vaccination?"
                    deleteConfirmDescription={`Are you sure you want to delete "${vac.vaccine_name}"? This cannot be undone.`}
                  >
                    <div 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-xl touch-manipulation active:bg-muted"
                      onClick={() => handleEditVaccination(vac)}
                    >
                      <div>
                        <p className="font-medium text-sm">{vac.vaccine_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(vac.vaccine_date).toLocaleDateString()}
                        </p>
                      </div>
                      {vac.next_due_date && (
                        <Badge variant="outline" className="text-xs">
                          Due: {new Date(vac.next_due_date).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </SwipeableItem>
                ))}
              </div>
            )}
          </MobileCard>

          <MobileCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Reminders
              </h3>
              <Button 
                size="sm" 
                variant="outline"
                className="h-9 touch-manipulation"
                onClick={() => setHealthReminderModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            
            {healthReminders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No reminders</p>
            ) : (
              <div className="space-y-3">
                {healthReminders.filter(r => !r.completed).slice(0, 5).map((reminder) => (
                  <SwipeableItem
                    key={reminder.id}
                    onDelete={() => deleteReminder(reminder.id)}
                    onComplete={() => toggleReminderComplete(reminder.id, reminder.completed)}
                    deleteConfirmTitle="Delete reminder?"
                    deleteConfirmDescription={`Are you sure you want to delete "${reminder.title}"? This cannot be undone.`}
                  >
                    <div 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-xl touch-manipulation active:bg-muted"
                      onClick={() => handleEditReminder(reminder)}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{reminder.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(reminder.reminder_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">← complete | delete →</span>
                    </div>
                  </SwipeableItem>
                ))}
              </div>
            )}
          </MobileCard>

          <MobileCard>
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Download className="w-4 h-4" />
              Documents
            </h3>
            <PetDocuments petId={pet.id} />
          </MobileCard>
        </TabsContent>

        {/* Lost Tab */}
        <TabsContent value="lost" className="space-y-4 mt-4">
          <MobileCard className={pet.is_lost ? 'border-destructive/50 bg-destructive/5' : ''}>
            <div className="text-center py-4">
              <MapPin className={`w-12 h-12 mx-auto mb-3 ${pet.is_lost ? 'text-destructive' : 'text-muted-foreground'}`} />
              <h3 className="text-lg font-semibold mb-2">
                {pet.is_lost ? `${pet.name} is marked as lost` : 'Lost Mode'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {pet.is_lost 
                  ? 'Share the recovery link to help bring them home'
                  : 'If your pet goes missing, mark them as lost to enable recovery features'
                }
              </p>
              <div className="space-y-2">
                <Button 
                  variant={pet.is_lost ? "outline" : "destructive"}
                  className="w-full h-12 rounded-xl touch-manipulation"
                  onClick={toggleLostStatus}
                >
                  {pet.is_lost ? 'Mark as Found' : 'Mark as Lost'}
                </Button>
                {pet.is_lost && (
                  <Button 
                    variant="default"
                    className="w-full h-12 rounded-xl touch-manipulation"
                    onClick={shareRecoveryLink}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Share Recovery Link
                  </Button>
                )}
              </div>
            </div>
          </MobileCard>

          <MobileCard>
            <h3 className="font-semibold mb-3">Public Profile</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Anyone who scans your pet's QR tag will see this page
            </p>
            <Button 
              variant="outline" 
              className="w-full h-11 rounded-xl touch-manipulation"
              asChild
            >
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <Eye className="w-4 h-4 mr-2" />
                Preview Public Profile
              </a>
            </Button>
          </MobileCard>
        </TabsContent>

        {/* Sharing Tab */}
        <TabsContent value="sharing" className="space-y-4 mt-4">
          <MobileCard>
            <h3 className="font-semibold mb-3">Share {pet.name}'s Profile</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Create a beautiful Instagram-ready card to share {pet.name}'s profile! 🚀
            </p>
            <InstagramShareCard 
              petName={pet.name}
              petSpecies={pet.species}
              petBreed={pet.breed}
              petColour={pet.colour}
              petWeight={pet.weight_kg}
              petGender={pet.gender}
              petPhoto={pet.photo_url}
              publicId={pet.public_id}
              publicUrl={publicUrl}
              dateOfBirth={pet.date_of_birth}
            />
          </MobileCard>
          
          <SharingTab petId={pet.id} />
        </TabsContent>
      </Tabs>
    </div>
  );

  const modals = (
    <>
      <VaccinationModal
        open={vaccinationModalOpen}
        onClose={() => setVaccinationModalOpen(false)}
        petId={id!}
        defaultClinic={pet?.clinic_name || pet?.vet_clinic || ''}
        defaultClinicAddress={pet?.clinic_address || ''}
        onSuccess={fetchVaccinations}
      />

      <EditVaccinationModal
        open={editVaccinationModalOpen}
        onClose={() => {
          setEditVaccinationModalOpen(false)
          setSelectedVaccination(null)
        }}
        vaccination={selectedVaccination}
        petId={id!}
        defaultClinic={pet?.clinic_name || pet?.vet_clinic || ''}
        defaultClinicAddress={pet?.clinic_address || ''}
        onSuccess={fetchVaccinations}
      />

      <HealthReminderModal
        open={healthReminderModalOpen}
        onClose={() => setHealthReminderModalOpen(false)}
        petId={id!}
        onSuccess={fetchHealthReminders}
      />

      <EditHealthReminderModal
        open={editReminderModalOpen}
        onClose={() => {
          setEditReminderModalOpen(false)
          setSelectedReminder(null)
        }}
        reminder={selectedReminder}
        petId={id!}
        onSuccess={fetchHealthReminders}
      />

      <QRCodeModal
        open={qrCodeModalOpen}
        onOpenChange={setQrCodeModalOpen}
        publicUrl={publicUrl}
        petName={pet.name}
      />

      <LostPetPosterModal
        open={posterModalOpen}
        onOpenChange={setPosterModalOpen}
        pet={{
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          colour: pet.colour,
          weight_kg: pet.weight_kg,
          gender: pet.gender,
          photo_url: pet.photo_url,
          public_id: pet.public_id,
          ownerPhone: ownerPhone,
          emergencyContactName: pet.emergency_contact_name,
          emergencyContactPhone: pet.emergency_contact_phone
        }}
        publicUrl={publicUrl}
      />
    </>
  )

  return (
    <IOSPageLayout title={pet.name} headerRight={iosHeaderRight} onRefresh={handleRefresh}>
      <div className="px-4 py-4">
        {iosPetContent}
      </div>
      {modals}
    </IOSPageLayout>
  )
}

export default PetDetails
