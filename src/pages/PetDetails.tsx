import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { calculateAge } from '@/lib/age-utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardHeader } from '@/components/DashboardHeader'
import { Footer } from '@/components/Footer'
import { ArrowLeft, Heart, MapPin, QrCode, Calendar, Shield, Users, Edit, Download, Upload, Scan, ExternalLink, Bell, CheckCircle, Trash2, Plus, Eye, Edit2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from '@/hooks/use-toast'
import { PetDocuments } from '@/components/PetDocuments'
import { VaccinationModal } from '@/components/VaccinationModal'
import { EditVaccinationModal } from '@/components/EditVaccinationModal'
import { SharingTab } from '@/components/SharingTab'
import { HealthReminderModal } from '@/components/HealthReminderModal'
import { EditHealthReminderModal } from '@/components/EditHealthReminderModal'
import { au } from '@/lib/auEnglish'

interface Pet {
  id: string
  name: string
  species: string
  breed: string | null
  colour: string | null
  sex: string | null
  date_of_birth: string | null
  desexed: boolean
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

  useEffect(() => {
    if (id) {
      fetchPetDetails()
      fetchVaccinations()
      fetchHealthReminders()
    }
  }, [id, user])

  const fetchPetDetails = async () => {
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
  }

  const fetchVaccinations = async () => {
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
  }

  const fetchHealthReminders = async () => {
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
  }

  const toggleReminderComplete = async (reminderId: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('health_reminders')
        .update({ completed: !currentStatus })
        .eq('id', reminderId)

      if (error) throw error

      setHealthReminders(healthReminders.map(r => 
        r.id === reminderId ? { ...r, completed: !currentStatus } : r
      ))

      toast({
        title: !currentStatus ? "Reminder completed" : "Reminder reopened",
      })
    } catch (error) {
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
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
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
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="health">Health & Docs</TabsTrigger>
            <TabsTrigger value="lost">Lost Mode</TabsTrigger>
            <TabsTrigger value="sharing">Sharing</TabsTrigger>
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
            <PetDocuments petId={id!} />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {au('Vaccinations')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vaccinations.length > 0 ? (
                  <div className="space-y-3">
                    {vaccinations.map((vaccination) => (
                      <div key={vaccination.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
                        <div className="flex-1">
                          <h4 className="font-medium">{vaccination.vaccine_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {au('Given')}: {new Date(vaccination.vaccine_date).toLocaleDateString()}
                          </p>
                          {vaccination.next_due_date && (
                            <Badge 
                              variant={new Date(vaccination.next_due_date) < new Date() ? "destructive" : "secondary"}
                              className="mt-2"
                            >
                              {au('Due')}: {new Date(vaccination.next_due_date).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditVaccination(vaccination)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Health Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {healthReminders.length > 0 ? (
                  <div className="space-y-3">
                    {healthReminders.map((reminder) => {
                      const isOverdue = new Date(reminder.reminder_date) < new Date()
                      const isPastDue = isOverdue && !reminder.completed
                      
                      return (
                        <div 
                          key={reminder.id} 
                          className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group ${
                            reminder.completed ? 'bg-muted/50 opacity-60' : isPastDue ? 'border-destructive/50 bg-destructive/5' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <button
                              onClick={() => toggleReminderComplete(reminder.id, reminder.completed)}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                reminder.completed 
                                  ? 'bg-primary border-primary' 
                                  : 'border-muted-foreground hover:border-primary'
                              }`}
                            >
                              {reminder.completed && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                            </button>
                            <div className="flex-1">
                              <h4 className={`font-medium ${reminder.completed ? 'line-through' : ''}`}>
                                {reminder.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {reminder.reminder_type && (
                                  <span className="capitalize">{reminder.reminder_type.replace('_', ' ')} • </span>
                                )}
                                {new Date(reminder.reminder_date).toLocaleDateString()}
                              </p>
                              {reminder.description && (
                                <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isPastDue && (
                              <Badge variant="destructive">Overdue</Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditReminder(reminder)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </div>
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

                    <div className="flex gap-4">
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
            <SharingTab petId={id!} />
          </TabsContent>
        </Tabs>
      </main>
      
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
      
      <Footer />
    </div>
  )
}

export default PetDetails