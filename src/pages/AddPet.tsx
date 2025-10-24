import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { usePlanV2 } from '@/hooks/usePlanV2'
import { EntitlementServiceV2 } from '@/services/EntitlementServiceV2'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { DashboardHeader } from '@/components/DashboardHeader'
import { PaywallModal } from '@/components/PaywallModal'
import { ArrowLeft, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from '@/hooks/use-toast'
import { au } from '@/lib/auEnglish'

const AddPet = () => {
  const { user } = useAuth()
  const { plan, usage, entitlement } = usePlanV2()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

  // Check entitlement when component loads
  useEffect(() => {
    checkCanAddPet()
  }, [user, usage])

  const checkCanAddPet = async () => {
    if (!user || !entitlement) return

    const service = EntitlementServiceV2.getInstance()
    const check = await service.checkEntitlement(user.id, 'pets_max', 1)

    if (!check.allowed) {
      const maxPetsAllowed = entitlement?.pets_max
      const currentCount = usage.pets_count

      if (maxPetsAllowed !== null && currentCount < maxPetsAllowed) {
        return
      }
      setShowPaywall(true)
    }
  }

  const maxPets = entitlement?.pets_max ?? 0
  const currentPets = usage.pets_count
  // Handle both null and -1 as unlimited
  const isUnlimited = maxPets === null || maxPets === -1 || maxPets < 0
  const canAddPet = isUnlimited || currentPets < maxPets
  const remainingPets = isUnlimited 
    ? 'Unlimited' 
    : Math.max(0, maxPets - currentPets)
  const progressPercentage = isUnlimited ? 0 : (currentPets / maxPets) * 100
  
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    color: '',
    sex: '',
    date_of_birth: '',
    desexed: false,
    microchip_number: '',
    registry_name: '',
    registry_link: '',
    vet_clinic: '',
    insurance_provider: '',
    insurance_policy: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Check pet limit with EntitlementServiceV2
    const service = EntitlementServiceV2.getInstance()
    const check = await service.checkEntitlement(user.id, 'pets_max', 1)

    if (!check.allowed) {
      const maxPetsAllowed = entitlement?.pets_max
      if (maxPetsAllowed !== null && usage.pets_count < maxPetsAllowed) {
        // Allow refill when usage indicates available slots
        console.warn('[AddPet] Entitlement denied but usage indicates available pet slot. Allowing add.');
      } else {
        setShowPaywall(true)
        toast({
          title: au("Pet limit reached"),
          description: check.reason || au(`Upgrade to add more pets.`),
          variant: "destructive",
        })
        return
      }
    }

    setLoading(true)
    try {
      // Build insert payload to match backend schema columns only
      const insertData = {
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed || null,
        color: formData.color || null,
        gender: (formData.sex as string) || null,
        date_of_birth: formData.date_of_birth || null,
        microchip_number: formData.microchip_number || null,
        registry_name: formData.registry_name || null,
        registry_link: formData.registry_link || null,
        vet_name: formData.vet_clinic || null,
        notes: formData.notes || null,
      }

      const { data, error } = await supabase
        .from('pets')
        .insert([
            {
              ...insertData,
              user_id: user.id,
              public_id: Math.random().toString(36).substr(2, 9),
            }
        ])
        .select()
        .single()

      if (error) throw error

      toast({
        title: au("Pet added successfully!"),
        description: au(`${formData.name} has been added to your PetLinkID.`),
      })

      navigate('/dashboard')
    } catch (error) {
      console.error('Error adding pet:', error)
      toast({
        title: au("Error"),
        description: au("Failed to add pet. Please try again."),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {au('Back to Dashboard')}
            </Link>
          </Button>
        </div>

        {/* Subscription Status Card */}
        <Card className="mb-6 bg-gradient-card border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">{au('Current Plan')}</p>
                <p className="text-xl font-semibold capitalize">
                  {plan}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{au('Pets Available')}</p>
                <p className="text-xl font-semibold">
                  {currentPets} {au('of')} {isUnlimited ? au('Unlimited') : maxPets}
                </p>
              </div>
            </div>
            
            {!isUnlimited && (
              <div className="space-y-2">
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-sm text-muted-foreground text-center">
                  {remainingPets === 'Unlimited' 
                    ? au('Unlimited pets remaining') 
                    : remainingPets === 0
                    ? au('No pets remaining')
                    : au(`${remainingPets} ${remainingPets === 1 ? 'pet' : 'pets'} remaining`)
                  }
                </p>
              </div>
            )}
            
            {!canAddPet && (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-md">
                <p className="text-sm text-warning-foreground">
                  {au("You've reached your pet limit.")} <Link to="/pricing" className="underline font-medium">{au('Upgrade your plan')}</Link> {au('to add more pets')}.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{au('Add New Pet')}</CardTitle>
            <p className="text-muted-foreground">
              {au('Create a comprehensive profile for your furry family member')}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Pet Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Max"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="species">Species *</Label>
                    <Select onValueChange={(value) => handleInputChange('species', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dog">Dog</SelectItem>
                        <SelectItem value="Cat">Cat</SelectItem>
                        <SelectItem value="Bird">Bird</SelectItem>
                        <SelectItem value="Rabbit">Rabbit</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="breed">Breed *</Label>
                    <Input
                      id="breed"
                      value={formData.breed}
                      onChange={(e) => handleInputChange('breed', e.target.value)}
                      placeholder="e.g., Golden Retriever"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="color">Color/Markings *</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      placeholder="e.g., Golden, white chest"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sex">Sex *</Label>
                    <Select onValueChange={(value) => handleInputChange('sex', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="desexed"
                    checked={formData.desexed}
                    onCheckedChange={(checked) => handleInputChange('desexed', checked)}
                  />
                  <Label htmlFor="desexed">Desexed</Label>
                </div>
              </div>

              {/* Microchip & Registry */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Microchip & Registry</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="microchip_number">Microchip Number</Label>
                  <Input
                    id="microchip_number"
                    value={formData.microchip_number}
                    onChange={(e) => handleInputChange('microchip_number', e.target.value)}
                    placeholder="15-digit number"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="registry_name">Registry Name</Label>
                    <Select onValueChange={(value) => handleInputChange('registry_name', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select registry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pet Address">Pet Address</SelectItem>
                        <SelectItem value="Central Animal Records">Central Animal Records</SelectItem>
                        <SelectItem value="National Pet Registry">National Pet Registry</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registry_link">Registry Website</Label>
                    <Input
                      id="registry_link"
                      value={formData.registry_link}
                      onChange={(e) => handleInputChange('registry_link', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Health & Care */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Health & Care</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="vet_clinic">Vet Clinic</Label>
                  <Input
                    id="vet_clinic"
                    value={formData.vet_clinic}
                    onChange={(e) => handleInputChange('vet_clinic', e.target.value)}
                    placeholder="Clinic name and contact"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insurance_provider">Insurance Provider</Label>
                    <Input
                      id="insurance_provider"
                      value={formData.insurance_provider}
                      onChange={(e) => handleInputChange('insurance_provider', e.target.value)}
                      placeholder="e.g., Petplan"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="insurance_policy">Policy Number</Label>
                    <Input
                      id="insurance_policy"
                      value={formData.insurance_policy}
                      onChange={(e) => handleInputChange('insurance_policy', e.target.value)}
                      placeholder="Policy number"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any special notes about your pet..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={loading || !canAddPet} className="flex-1">
                  {loading ? au('Adding Pet...') : au('Add Pet')}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link to="/dashboard">{au('Cancel')}</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <PaywallModal 
        open={showPaywall}
        onOpenChange={setShowPaywall}
        feature="Add Pet"
        reason="Free plan allows 1 pet. Upgrade to Pro for unlimited pets."
      />
    </div>
  )
}

export default AddPet