import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Header } from '@/components/Header'
import { ImageCropDialog } from '@/components/ImageCropDialog'
import { VetClinicAutocomplete, VetClinicData } from '@/components/VetClinicAutocomplete'
import { ArrowLeft, Upload, X, Trash2, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { useRole } from '@/rbac/useRole'
import { canDeletePets } from '@/rbac/guards'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const EditPet = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { role } = useRole(id || null)
  
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    color: '',
    sex: '',
    date_of_birth: '',
    desexed: false,
    weight_kg: '',
    microchip_number: '',
    registry_name: '',
    registry_link: '',
    clinic_name: '',
    clinic_address: '',
    insurance_provider: '',
    insurance_policy: '',
    notes: '',
    photo_url: '',
  })

  useEffect(() => {
    if (id) {
      fetchPetDetails()
    }
  }, [id, user])

  const fetchPetDetails = async () => {
    if (!user || !id) return

    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      
      setFormData({
        name: data.name || '',
        species: data.species || '',
        breed: data.breed || '',
        color: data.color || '',
        sex: data.gender || '',
        date_of_birth: data.date_of_birth || '',
        desexed: !!data.desexed,
        weight_kg: data.weight_kg ? String(data.weight_kg) : '',
        microchip_number: data.microchip_number || '',
        registry_name: data.registry_name || '',
        registry_link: data.registry_link || '',
        clinic_name: (data as any).clinic_name || data.vet_name || '',
        clinic_address: (data as any).clinic_address || '',
        insurance_provider: data.insurance_provider || '',
        insurance_policy: data.insurance_policy || '',
        notes: data.notes || '',
        photo_url: data.photo_url || '',
      })
      
      setPhotoPreview(data.photo_url)
    } catch (error) {
      console.error('Error fetching pet details:', error)
      toast({
        title: "Error",
        description: "Failed to load pet details.",
        variant: "destructive",
      })
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setImageToCrop(reader.result as string)
      setCropDialogOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCroppedImage = async (croppedBlob: Blob) => {
    if (!user || !id) return

    setUploading(true)
    try {
      // Delete old photo from storage if it exists
      if (formData.photo_url) {
        try {
          const oldPhotoPath = formData.photo_url.split('/').pop()
          if (oldPhotoPath && oldPhotoPath.includes(user.id)) {
            const fullPath = `${user.id}/${oldPhotoPath.split(`${user.id}/`)[1]}`
            await supabase.storage
              .from('pet-documents')
              .remove([fullPath])
            console.log('Old photo deleted:', fullPath)
          }
        } catch (deleteError) {
          console.error('Error deleting old photo:', deleteError)
          // Continue with upload even if delete fails
        }
      }

      const fileName = `${user.id}/${id}-${Math.random()}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('pet-documents')
        .upload(fileName, croppedBlob, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('pet-documents')
        .getPublicUrl(fileName)

      setPhotoPreview(publicUrl)
      setFormData(prev => ({ ...prev, photo_url: publicUrl }))

      toast({
        title: "Photo uploaded",
        description: "Profile picture uploaded successfully!",
      })
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = async () => {
    if (!user || !formData.photo_url) {
      setPhotoPreview(null)
      setFormData(prev => ({ ...prev, photo_url: '' }))
      return
    }

    try {
      const oldPhotoPath = formData.photo_url.split('/').pop()
      if (oldPhotoPath && oldPhotoPath.includes(user.id)) {
        const fullPath = `${user.id}/${oldPhotoPath.split(`${user.id}/`)[1]}`
        await supabase.storage
          .from('pet-documents')
          .remove([fullPath])
        console.log('Photo removed from storage:', fullPath)
      }
    } catch (error) {
      console.error('Error removing photo:', error)
    }

    setPhotoPreview(null)
    setFormData(prev => ({ ...prev, photo_url: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !id) return

    setSaving(true)
    try {
      const updateData: any = {
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed || null,
        color: formData.color || null,
        gender: formData.sex || null,
        date_of_birth: formData.date_of_birth || null,
        desexed: formData.desexed,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        microchip_number: formData.microchip_number || null,
        registry_name: formData.registry_name || null,
        registry_link: formData.registry_link || null,
        clinic_name: formData.clinic_name || null,
        clinic_address: formData.clinic_address || null,
        vet_name: formData.clinic_name || null, // Keep legacy field for compatibility
        insurance_provider: formData.insurance_provider || null,
        insurance_policy: formData.insurance_policy || null,
        notes: formData.notes || null,
        photo_url: formData.photo_url || null,
      }

      const { error } = await supabase
        .from('pets')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: "Pet updated!",
        description: `${formData.name}'s profile has been updated.`,
      })

      navigate(`/pets/${id}`)
    } catch (error) {
      console.error('Error updating pet:', error)
      toast({
        title: "Error",
        description: "Failed to update pet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDelete = async () => {
    if (!user || !id) return

    setDeleting(true)
    try {
      // Delete related data first
      await supabase.from('vaccinations').delete().eq('pet_id', id)
      await supabase.from('health_reminders').delete().eq('pet_id', id)
      await supabase.from('pet_documents').delete().eq('pet_id', id)
      await supabase.from('pet_memberships').delete().eq('pet_id', id)
      await supabase.from('pet_invites').delete().eq('pet_id', id)

      // Delete pet photo from storage if exists
      if (formData.photo_url) {
        try {
          const photoPath = formData.photo_url.split('/').pop()
          if (photoPath && photoPath.includes(user.id)) {
            const fullPath = `${user.id}/${photoPath.split(`${user.id}/`)[1]}`
            await supabase.storage.from('pet-documents').remove([fullPath])
          }
        } catch (error) {
          console.error('Error deleting photo:', error)
        }
      }

      // Finally delete the pet
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: "Pet deleted",
        description: `${formData.name} has been removed from your account.`,
      })

      navigate('/dashboard')
    } catch (error) {
      console.error('Error deleting pet:', error)
      toast({
        title: "Error",
        description: "Failed to delete pet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/pets/${id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pet Details
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit {formData.name}</CardTitle>
            <p className="text-muted-foreground">
              Update your pet's profile information
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Profile Photo</h3>
                <Label htmlFor="photo" className="cursor-pointer block">
                  <div className="w-48 h-48 rounded-xl overflow-hidden bg-muted relative group border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors">
                    {photoPreview ? (
                      <>
                        <img src={photoPreview} alt="Pet preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="w-12 h-12 text-white" />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            removePhoto();
                          }}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <Upload className="w-12 h-12 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {uploading ? 'Uploading...' : 'Click to upload photo'}
                        </p>
                      </div>
                    )}
                  </div>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                </Label>
              </div>

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
                    <Select value={formData.species} onValueChange={(value) => handleInputChange('species', value)} required>
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
                    <Label htmlFor="breed">Breed</Label>
                    <Input
                      id="breed"
                      value={formData.breed}
                      onChange={(e) => handleInputChange('breed', e.target.value)}
                      placeholder="e.g., Golden Retriever"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="color">Colour/Markings</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      placeholder="e.g., Golden, white chest"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sex">Sex</Label>
                    <Select value={formData.sex} onValueChange={(value) => handleInputChange('sex', value)}>
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
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.date_of_birth && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.date_of_birth ? (
                            format(new Date(formData.date_of_birth), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.date_of_birth ? new Date(formData.date_of_birth) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              handleInputChange('date_of_birth', format(date, 'yyyy-MM-dd'))
                            }
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight_kg">Weight (kg)</Label>
                    <Input
                      id="weight_kg"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.weight_kg}
                      onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                      placeholder="e.g., 25.5"
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
                    <Select value={formData.registry_name} onValueChange={(value) => handleInputChange('registry_name', value)}>
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
                  <Label htmlFor="clinic_name">Vet clinic</Label>
                  <VetClinicAutocomplete
                    value={formData.clinic_name}
                    clinicAddress={formData.clinic_address}
                    onChange={(data: VetClinicData) => {
                      handleInputChange('clinic_name', data.name);
                      handleInputChange('clinic_address', data.address);
                    }}
                    placeholder="Start typing vet clinic name…"
                  />
                  <p className="text-xs text-muted-foreground">
                    Type the vet clinic name and select from suggestions
                  </p>
                </div>

                {formData.clinic_address && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Selected Address</Label>
                    <p className="text-sm bg-muted px-3 py-2 rounded-md">{formData.clinic_address}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insurance_provider">Insurance Provider</Label>
                    <Select 
                      value={formData.insurance_provider} 
                      onValueChange={(value) => handleInputChange('insurance_provider', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AAMI Pet Insurance">AAMI Pet Insurance</SelectItem>
                        <SelectItem value="Australian Seniors Pet Insurance">Australian Seniors Pet Insurance</SelectItem>
                        <SelectItem value="Bow Wow Meow">Bow Wow Meow</SelectItem>
                        <SelectItem value="Budget Direct Pet Insurance">Budget Direct Pet Insurance</SelectItem>
                        <SelectItem value="Choosi Pet Insurance">Choosi Pet Insurance</SelectItem>
                        <SelectItem value="GMHBA Pet Insurance">GMHBA Pet Insurance</SelectItem>
                        <SelectItem value="Guide Dogs Pet Insurance">Guide Dogs Pet Insurance</SelectItem>
                        <SelectItem value="Knose Pet Insurance">Knose Pet Insurance</SelectItem>
                        <SelectItem value="Medibank Pet Insurance">Medibank Pet Insurance</SelectItem>
                        <SelectItem value="Pet Insurance Australia">Pet Insurance Australia</SelectItem>
                        <SelectItem value="Petplan">Petplan</SelectItem>
                        <SelectItem value="Petsy Pet Insurance">Petsy Pet Insurance</SelectItem>
                        <SelectItem value="PIA Pet Insurance">PIA Pet Insurance</SelectItem>
                        <SelectItem value="RSPCA Pet Insurance">RSPCA Pet Insurance</SelectItem>
                        <SelectItem value="Woolworths Pet Insurance">Woolworths Pet Insurance</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Notes</h3>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional information about your pet..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(`/pets/${id}`)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Delete Pet Section - Only visible to owners */}
        {canDeletePets(role) && (
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium">Delete Pet Profile</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Remove this pet and all associated records from your account
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={deleting}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <strong>{formData.name}</strong> and all associated data including:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Health records and vaccinations</li>
                  <li>Health reminders</li>
                  <li>Documents and photos</li>
                  <li>Family member access</li>
                </ul>
                <p className="mt-3 font-semibold text-destructive">This action cannot be undone.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Forever'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <ImageCropDialog
          open={cropDialogOpen}
          onClose={() => {
            setCropDialogOpen(false)
            setImageToCrop(null)
          }}
          image={imageToCrop}
          onCropComplete={handleCroppedImage}
          aspectRatio={1}
        />
      </main>
    </div>
  )
}

export default EditPet
