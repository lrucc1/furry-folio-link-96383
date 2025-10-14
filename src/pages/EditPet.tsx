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
import { DashboardHeader } from '@/components/DashboardHeader'
import { ImageCropDialog } from '@/components/ImageCropDialog'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

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
        desexed: data.desexed || false,
        microchip_number: data.microchip_number || '',
        registry_name: data.registry_name || '',
        registry_link: data.registry_link || '',
        vet_clinic: data.vet_name || '',
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
      const updateData = {
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed || null,
        color: formData.color || null,
        gender: formData.sex || null,
        date_of_birth: formData.date_of_birth || null,
        desexed: formData.desexed,
        microchip_number: formData.microchip_number || null,
        registry_name: formData.registry_name || null,
        registry_link: formData.registry_link || null,
        vet_name: formData.vet_clinic || null,
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
                    <Label htmlFor="color">Color/Markings</Label>
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
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
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
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link to={`/pets/${id}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <ImageCropDialog
          image={imageToCrop}
          open={cropDialogOpen}
          onClose={() => setCropDialogOpen(false)}
          onCropComplete={handleCroppedImage}
          aspectRatio={1}
        />
      </main>
    </div>
  )
}

export default EditPet
