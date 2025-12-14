import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { calculateAge } from '@/lib/age-utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Heart, MapPin, QrCode, Calendar, Shield, Users, Edit, Download, Upload, Scan, ExternalLink, Bell, CheckCircle, Trash2, Plus, Eye, Edit2, Syringe, AlertCircle, Home, ChevronLeft, Scale } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { PetDocuments } from '@/components/PetDocuments'
import { VaccinationModal } from '@/components/VaccinationModal'
import { EditVaccinationModal } from '@/components/EditVaccinationModal'
import { SharingTab } from '@/components/SharingTab'
import { HealthReminderModal } from '@/components/HealthReminderModal'
import { EditHealthReminderModal } from '@/components/EditHealthReminderModal'
import { InstagramShareCard } from '@/components/InstagramShareCard'
import { au } from '@/lib/auEnglish'
import { IOSPageLayout } from '@/components/ios/IOSPageLayout'
import { useIsNativeApp } from '@/hooks/useIsNativeApp'
import { MobileCard } from '@/components/ios/MobileCard'
import { SwipeableItem } from '@/components/ios/SwipeableItem'

interface Pet {
  id: string
  name: string
  species: string
  breed: string | null
  colour: string | null
  sex: string | null
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
  created_at: string
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
  const isNative = useIsNativeApp()
  const [pet, setPet] = useState<Pet | null>(null)
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
  const [healthReminders, setHealthReminders] = useState<HealthReminder[]>([])
  const [loading, setLoading] = useState(true)
  const [vaccinationModalOpen, setVaccinationModalOpen] = useState(false)
  const [editVaccinationModalOpen, setEditVaccinationModalOpen] = useState(false)
  const [selectedVaccination, setSelectedVaccination] = useState<Vaccination | null>(null)
  const [healthReminderModalOpen, setHealthReminderModalOpen] = useState(false)
  const [editReminderModalOpen, setEditReminderModalOpen] = useState(false)
  const [selectedReminder, setSelectedReminder] = useState<HealthReminder | null>(null)

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
    } catch (error) {
      console.error('Error fetching pet details:', error)
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
      console.error('Error fetching vaccinations:', error)
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
      console.error('Error fetching health reminders:', error)
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
    
    // Optimistically update UI
    setHealthReminders(healthReminders.map(r => 
      r.id === reminderId ? { ...r, completed: newStatus } : r
    ));

    try {
      const { error } = await (supabase as any)
        .from('health_reminders')
        .update({ completed: newStatus })
        .eq('id', reminderId)

      if (error) throw error

      // Show undo toast when completing (not when reopening)
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
      // Revert on error
      setHealthReminders(healthReminders.map(r => 
        r.id === reminderId ? { ...r, completed: currentStatus } : r
      ));
      console.error('Error updating reminder:', error)
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

      toast({
        title: "Reminder deleted",
      })
    } catch (error) {
      console.error('Error deleting reminder:', error)
      toast({
        title: "Error",
        description: "Failed to delete reminder",
        variant: "destructive",
      })
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

      toast({
        title: "Vaccination deleted",
      })
    } catch (error) {
      console.error('Error deleting vaccination:', error)
      toast({
        title: "Error",
        description: "Failed to delete vaccination",
        variant: "destructive",
      })
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
      console.error('Error toggling lost status:', error)
      toast({
        title: "Error",
        description: "Failed to update pet status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const generatePoster = () => {
    // This would generate a PDF poster with QR code
    toast({
      title: "Poster Generated",
      description: "Download will start shortly.",
    })
  }

  const shareRecoveryLink = async () => {
    const url = `${window.location.origin}/found/${pet?.public_id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Help find ${pet?.name}`,
          text: `I've lost my ${pet?.species.toLowerCase()} ${pet?.name}. Please help me find them!`,
          url: url,
        })
      } catch (error) {
        console.log('Error sharing:', error)
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
    if (isNative) {
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
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Pet not found</h1>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  const publicUrl = `${window.location.origin}/found/${pet.public_id}`

  // iOS Header with back and edit buttons
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

  // iOS-optimized pet content
  const iosPetContent = (
    <div className="space-y-4">
      {/* Pet Header Card - Compact for iOS */}
      <MobileCard className="overflow-hidden">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
            {pet.photo_url ? (
              <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>
          
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
              {pet.sex && (
                <Badge variant="outline" className="text-xs">
                  {pet.sex}
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

      {/* iOS Tabs with larger touch targets */}
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

        {/* Overview Tab - iOS optimized */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Microchip Info */}
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

          {/* Vet Info */}
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

          {/* Insurance */}
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

          {/* Notes */}
          {pet.notes && (
            <MobileCard>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground">{pet.notes}</p>
            </MobileCard>
          )}
        </TabsContent>

        {/* Health Tab - iOS optimized */}
        <TabsContent value="health" className="space-y-4 mt-4">
          {/* Vaccinations */}
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

          {/* Health Reminders */}
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

          {/* Documents */}
          <MobileCard>
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Download className="w-4 h-4" />
              Documents
            </h3>
            <PetDocuments petId={pet.id} />
          </MobileCard>
        </TabsContent>

        {/* Lost Tab - iOS optimized */}
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

          <InstagramShareCard 
            petName={pet.name}
            petSpecies={pet.species}
            petBreed={pet.breed}
            petPhoto={pet.photo_url}
            publicId={pet.public_id}
            publicUrl={publicUrl}
            dateOfBirth={pet.date_of_birth}
          />
        </TabsContent>

        {/* Sharing Tab - iOS optimized */}
        <TabsContent value="sharing" className="mt-4">
          <SharingTab petId={pet.id} />
        </TabsContent>
      </Tabs>
    </div>
  );

  // Pet content shared between iOS and Web
  const petContent = (
    <>
      {/* iOS: Compact back button */}
      {isNative && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/dashboard')}
          className="mb-4 -ml-2 h-10 touch-manipulation"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Dashboard
        </Button>
      )}

      {/* Web: Full navigation bar */}
      {!isNative && (
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link to={`/pets/${pet.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Pet
            </Link>
          </Button>
        </div>
      )}

        {/* Pet Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-32 h-32 rounded-xl overflow-hidden bg-muted flex-shrink-0 relative group">
                {pet.photo_url ? (
                  <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Heart className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <Link 
                  to={`/pets/${pet.id}/edit`}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Upload className="w-8 h-8 text-white" />
                </Link>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">{pet.name}</h1>
                    <p className="text-lg text-muted-foreground">
                      {pet.breed ? `${pet.breed} ${pet.species}` : pet.species}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant="secondary" className="font-mono text-xs px-3 py-1">
                      <Shield className="w-3 h-3 mr-1.5" />
                      {pet.public_id}
                    </Badge>
                    {pet.is_lost && (
                      <Badge variant="destructive" className="text-sm">
                        <MapPin className="w-3 h-3 mr-1" />
                        Lost
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {pet.colour && (
                    <div>
                      <span className="text-muted-foreground">Colour:</span>
                      <p className="font-medium">{pet.colour}</p>
                    </div>
                  )}
                  {pet.sex && (
                    <div>
                      <span className="text-muted-foreground">Sex:</span>
                      <p className="font-medium">{pet.sex}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Desexed:</span>
                    <p className="font-medium">{pet.desexed ? 'Yes' : 'No'}</p>
                  </div>
                  {pet.date_of_birth && (
                    <>
                      <div>
                        <span className="text-muted-foreground">DOB:</span>
                        <p className="font-medium">
                          {new Date(pet.date_of_birth).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Age:</span>
                        <p className="font-medium">
                          {calculateAge(pet.date_of_birth)}
                        </p>
                      </div>
                    </>
                  )}
                  {pet.weight_kg && (
                    <div>
                      <span className="text-muted-foreground">Weight:</span>
                      <p className="font-medium">{pet.weight_kg} kg</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full grid grid-cols-2 gap-2 h-auto p-2 md:grid-cols-4 md:h-10 md:p-1 md:gap-0">
            <TabsTrigger value="overview" className="flex-col h-16 md:flex-row md:h-auto group">
              <Home className="w-4 h-4 mb-1 md:mb-0 md:mr-2 text-muted-foreground group-data-[state=active]:text-primary transition-all group-data-[state=active]:scale-110" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="flex-col h-16 md:flex-row md:h-auto group">
              <Heart className="w-4 h-4 mb-1 md:mb-0 md:mr-2 text-muted-foreground group-data-[state=active]:text-primary transition-all group-data-[state=active]:scale-110" />
              <span>Health & Docs</span>
            </TabsTrigger>
            <TabsTrigger value="lost" className="flex-col h-16 md:flex-row md:h-auto group">
              <AlertCircle className="w-4 h-4 mb-1 md:mb-0 md:mr-2 text-muted-foreground group-data-[state=active]:text-primary transition-all group-data-[state=active]:scale-110" />
              <span>Lost Mode</span>
            </TabsTrigger>
            <TabsTrigger value="sharing" className="flex-col h-16 md:flex-row md:h-auto group">
              <Users className="w-4 h-4 mb-1 md:mb-0 md:mr-2 text-muted-foreground group-data-[state=active]:text-primary transition-all group-data-[state=active]:scale-110" />
              <span>Sharing</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scan className="w-5 h-5" />
                    Microchip & Registry
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pet.microchip_number ? (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-muted-foreground">Microchip Number:</span>
                          <p className="font-mono text-lg font-semibold mt-1">
                            {pet.microchip_number.replace(/(.{3})/g, '$1 ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No microchip number registered
                    </div>
                  )}
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-sm text-muted-foreground">Registry:</span>
                        <p className="font-semibold text-lg mt-1">{pet.registry_name || '—'}</p>
                        {pet.registry_link && (
                          <a
                            className="inline-flex items-center text-primary hover:underline mt-2 text-sm"
                            href={pet.registry_link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Open Registry
                          </a>
                        )}
                      </div>
                      {!pet.registry_link && (
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/pets/${pet.id}/edit`}>Add Registry Website</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {!pet.microchip_number && !pet.registry_name && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/pets/${pet.id}/edit`}>
                        <Scan className="w-4 h-4 mr-2" />
                        Add Microchip Details
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Care Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pet.vet_clinic && (
                    <div>
                      <span className="text-sm text-muted-foreground">Vet Clinic:</span>
                      <p className="font-medium">{pet.vet_clinic}</p>
                    </div>
                  )}
                  
                  {pet.insurance_provider && (
                    <div>
                      <span className="text-sm text-muted-foreground">Insurance:</span>
                      <p className="font-medium">
                        {pet.insurance_provider}
                        {pet.insurance_policy && ` (${pet.insurance_policy})`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {pet.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{pet.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Health & Documents Tab */}
          <TabsContent value="health" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Health Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {healthReminders.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {healthReminders.map((reminder) => {
                      const dueDate = new Date(reminder.reminder_date)
                      const today = new Date()
                      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                      
                      let dueDateColor = 'text-muted-foreground'
                      let dueDateBg = 'bg-muted/50'
                      let iconColor = 'text-muted-foreground'
                      
                      if (!reminder.completed) {
                        if (daysUntilDue < 0 || daysUntilDue <= 7) {
                          dueDateColor = 'text-destructive'
                          dueDateBg = 'bg-destructive/10'
                          iconColor = 'text-destructive'
                        } else if (daysUntilDue <= 30) {
                          dueDateColor = 'text-yellow-600 dark:text-yellow-500'
                          dueDateBg = 'bg-yellow-50 dark:bg-yellow-950/30'
                          iconColor = 'text-yellow-600 dark:text-yellow-500'
                        }
                      }
                      
                      const ReminderIcon = reminder.completed ? CheckCircle : Bell
                      
                      return (
                        <div 
                          key={reminder.id} 
                          className={`group relative flex items-center gap-3 p-3 border rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer ${
                            reminder.completed ? 'opacity-60' : ''
                          }`}
                          onClick={() => handleEditReminder(reminder)}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleReminderComplete(reminder.id, reminder.completed)
                            }}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${dueDateBg} hover:scale-105 transition-transform`}
                          >
                            <ReminderIcon className={`w-5 h-5 ${reminder.completed ? 'text-primary' : iconColor}`} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium text-sm truncate ${reminder.completed ? 'line-through' : ''}`}>
                              {reminder.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {reminder.reminder_type && (
                                <span className="capitalize">{reminder.reminder_type.replace('_', ' ')} • </span>
                              )}
                              {new Date(reminder.reminder_date).toLocaleDateString()}
                            </p>
                            {!reminder.completed && (
                              <p className={`text-xs font-medium ${dueDateColor} mt-1`}>
                                {daysUntilDue < 0 
                                  ? `Overdue ${Math.abs(daysUntilDue)}d` 
                                  : daysUntilDue === 0
                                  ? 'Due today'
                                  : `Due in ${daysUntilDue}d`}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditReminder(reminder)
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">No health reminders set</p>
                  </div>
                )}
                <Button onClick={() => setHealthReminderModalOpen(true)} className="w-full mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Health Reminder
                </Button>
              </CardContent>
            </Card>
            
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {au('Vaccinations')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vaccinations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vaccinations.map((vaccination) => {
                      const dueDate = vaccination.next_due_date ? new Date(vaccination.next_due_date) : null
                      const today = new Date()
                      const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null
                      
                      let dueDateColor = 'text-muted-foreground'
                      let dueDateBg = 'bg-muted/50'
                      if (daysUntilDue !== null) {
                        if (daysUntilDue < 0 || daysUntilDue <= 7) {
                          dueDateColor = 'text-destructive'
                          dueDateBg = 'bg-destructive/10'
                        } else if (daysUntilDue <= 30) {
                          dueDateColor = 'text-yellow-600 dark:text-yellow-500'
                          dueDateBg = 'bg-yellow-50 dark:bg-yellow-950/30'
                        }
                      }
                      
                      return (
                        <div 
                          key={vaccination.id} 
                          className="group relative flex items-center gap-3 p-3 border rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer"
                          onClick={() => handleEditVaccination(vaccination)}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${dueDateBg}`}>
                            <Syringe className={`w-5 h-5 ${dueDateColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{vaccination.vaccine_name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {new Date(vaccination.vaccine_date).toLocaleDateString()}
                            </p>
                            {dueDate && (
                              <p className={`text-xs font-medium ${dueDateColor} mt-1`}>
                                {daysUntilDue < 0 
                                  ? `Overdue ${Math.abs(daysUntilDue)}d` 
                                  : daysUntilDue === 0
                                  ? 'Due today'
                                  : `Due in ${daysUntilDue}d`}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditVaccination(vaccination)
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">{au('No vaccinations recorded yet')}</p>
                  </div>
                )}
                <Button onClick={() => setVaccinationModalOpen(true)} className="w-full mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  {au('Add vaccination')}
                </Button>
              </CardContent>
            </Card>


            <PetDocuments petId={id!} />
          </TabsContent>

          {/* Lost Mode Tab */}
          <TabsContent value="lost" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Lost Pet Recovery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Lost Status</h4>
                    <p className="text-sm text-muted-foreground">
                      {pet.is_lost ? `${pet.name} is currently marked as lost` : `${pet.name} is safe at home`}
                    </p>
                  </div>
                  <Button 
                    variant={pet.is_lost ? "secondary" : "destructive"}
                    onClick={toggleLostStatus}
                  >
                    {pet.is_lost ? 'Mark as Found' : 'Mark as Lost'}
                  </Button>
                </div>

                {pet.is_lost && (
                  <>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Recovery Link</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Share this link to help people who find {pet.name} contact you safely:
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 bg-background rounded text-xs font-mono">
                          {publicUrl}
                        </code>
                        <Button size="sm" onClick={shareRecoveryLink}>
                          Share
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <InstagramShareCard
                        petName={pet.name}
                        petSpecies={pet.species}
                        petBreed={pet.breed}
                        petPhoto={pet.photo_url}
                        publicId={pet.public_id}
                        publicUrl={publicUrl}
                        dateOfBirth={pet.date_of_birth}
                      />
                      <Button onClick={generatePoster} className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Generate Poster
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <QrCode className="w-4 h-4 mr-2" />
                        Show QR Code
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sharing Tab */}
          <TabsContent value="sharing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Share {pet.name}&apos;s Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3">
                  <InstagramShareCard
                    petName={pet.name}
                    petSpecies={pet.species}
                    petBreed={pet.breed}
                    petPhoto={pet.photo_url}
                    publicId={pet.public_id}
                    publicUrl={publicUrl}
                    dateOfBirth={pet.date_of_birth}
                  />
                  <p className="text-sm text-muted-foreground">
                    Create a beautiful Instagram-ready card to share {pet.name}&apos;s profile and help PetLinkID grow! 🚀
                  </p>
                </div>
              </CardContent>
            </Card>
            <SharingTab petId={id!} />
          </TabsContent>
        </Tabs>
    </>
  )

  // Modals shared between iOS and Web
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
    </>
  )

  // iOS Layout
  if (isNative) {
    return (
      <IOSPageLayout title={pet.name} headerRight={iosHeaderRight} onRefresh={handleRefresh}>
        <div className="px-4 py-4">
          {iosPetContent}
        </div>
        {modals}
      </IOSPageLayout>
    )
  }

  // Web Layout
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {petContent}
      </main>
      {modals}
    </div>
  )
}

export default PetDetails
