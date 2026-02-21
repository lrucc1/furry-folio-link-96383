import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { IOSPageLayout } from '@/components/ios/IOSPageLayout';
import { MobileCard } from '@/components/ios/MobileCard';
import { FormSection, FormRow } from '@/components/ios/FormSection';
import { ImageCropDialog } from '@/components/ImageCropDialog';
import { VetClinicAutocomplete, VetClinicData } from '@/components/VetClinicAutocomplete';
import { RegistrySelect, InsuranceProviderSelect } from '@/components/RegionAwareSelect';
import { BreedAutocomplete } from '@/components/BreedAutocomplete';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { ChevronLeft, MapPin, Save, Upload, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRole } from '@/rbac/useRole';
import { canDeletePets } from '@/rbac/guards';
import { z } from 'zod';

const PetSchema = z.object({
  name: z.string().trim().min(1, 'Pet name is required').max(100, 'Name must be under 100 characters'),
  species: z.string().trim().min(1, 'Species is required'),
  breed: z.string().trim().max(100).optional().or(z.literal('')),
  color: z.string().trim().max(100).optional().or(z.literal('')),
  sex: z.string().trim().optional().or(z.literal('')),
  date_of_birth: z.string().trim().optional().or(z.literal('')),
  weight_kg: z.string().optional().or(z.literal('')),
  microchip_number: z.string().trim().max(30).optional().or(z.literal('')),
  registry_name: z.string().trim().max(100).optional().or(z.literal('')),
  registry_link: z.string().trim().url('Must be a valid URL').optional().or(z.literal('')),
  clinic_name: z.string().trim().max(120).optional().or(z.literal('')),
  clinic_address: z.string().trim().max(200).optional().or(z.literal('')),
  insurance_provider: z.string().trim().max(120).optional().or(z.literal('')),
  insurance_policy: z.string().trim().max(120).optional().or(z.literal('')),
  notes: z.string().trim().max(1000, 'Notes must be under 1000 characters').optional().or(z.literal('')),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof PetSchema>, string>>;

export default function IOSEditPet() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const { role } = useRole(id || null);

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
  });

  useEffect(() => {
    if (id && user) fetchPetDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchPetDetails is defined in component
  }, [id, user]);

  const fetchPetDetails = async () => {
    if (!user || !id) return;
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

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
      });
      setPhotoPreview(data.photo_url);
    } catch (error) {
      toast.error('Failed to load pet details');
      navigate('/ios-home');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FieldErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const result = PetSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof FieldErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedImage = async (croppedBlob: Blob) => {
    if (!user || !id) return;
    setUploading(true);
    try {
      if (formData.photo_url) {
        try {
          const oldPhotoPath = formData.photo_url.split('/').pop();
          if (oldPhotoPath && oldPhotoPath.includes(user.id)) {
            const fullPath = `${user.id}/${oldPhotoPath.split(`${user.id}/`)[1]}`;
            await supabase.storage.from('pet-documents').remove([fullPath]);
          }
        } catch {}
      }

      const fileName = `${user.id}/${id}-${Math.random()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('pet-documents')
        .upload(fileName, croppedBlob, { upsert: true });

      if (uploadError) throw uploadError;

      // Generate signed URL for preview, but store only the path
      const { data: signedData } = await supabase.storage
        .from('pet-documents')
        .createSignedUrl(fileName, 3600);

      setPhotoPreview(signedData?.signedUrl || null);
      // Store only the storage path, not the full URL
      setFormData(prev => ({ ...prev, photo_url: fileName }));
      toast.success('Photo uploaded');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    if (!user || !formData.photo_url) {
      setPhotoPreview(null);
      setFormData(prev => ({ ...prev, photo_url: '' }));
      return;
    }
    try {
      const oldPhotoPath = formData.photo_url.split('/').pop();
      if (oldPhotoPath && oldPhotoPath.includes(user.id)) {
        const fullPath = `${user.id}/${oldPhotoPath.split(`${user.id}/`)[1]}`;
        await supabase.storage.from('pet-documents').remove([fullPath]);
      }
    } catch {}
    setPhotoPreview(null);
    setFormData(prev => ({ ...prev, photo_url: '' }));
  };

  const handleSubmit = async () => {
    if (!user || !id) return;
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setSaving(true);
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
        vet_name: formData.clinic_name || null,
        insurance_provider: formData.insurance_provider || null,
        insurance_policy: formData.insurance_policy || null,
        notes: formData.notes || null,
        photo_url: formData.photo_url || null,
      };

      const { error } = await supabase
        .from('pets')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast.success(`${formData.name}'s profile updated`);
      navigate(`/pets/${id}`);
    } catch {
      toast.error('Failed to update pet');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !id) return;
    setDeleting(true);
    try {
      await supabase.from('vaccinations').delete().eq('pet_id', id);
      await supabase.from('health_reminders').delete().eq('pet_id', id);
      await supabase.from('pet_documents').delete().eq('pet_id', id);
      await supabase.from('pet_memberships').delete().eq('pet_id', id);
      await supabase.from('pet_invites').delete().eq('pet_id', id);

      if (formData.photo_url) {
        try {
          const photoPath = formData.photo_url.split('/').pop();
          if (photoPath && photoPath.includes(user.id)) {
            const fullPath = `${user.id}/${photoPath.split(`${user.id}/`)[1]}`;
            await supabase.storage.from('pet-documents').remove([fullPath]);
          }
        } catch {}
      }

      const { error } = await supabase.from('pets').delete().eq('id', id);
      if (error) throw error;

      toast.success(`${formData.name} has been removed`);
      navigate('/ios-home');
    } catch {
      toast.error('Failed to delete pet');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const headerLeft = (
    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-10 w-10 p-0">
      <ChevronLeft className="w-6 h-6" />
    </Button>
  );

  const headerRight = (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleSubmit}
      disabled={saving}
      className="text-primary font-semibold"
    >
      {saving ? 'Saving...' : 'Save'}
    </Button>
  );

  if (loading) {
    return (
      <IOSPageLayout title="Edit Pet" headerLeft={headerLeft}>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </IOSPageLayout>
    );
  }

  return (
    <IOSPageLayout title={`Edit ${formData.name}`} headerLeft={headerLeft} headerRight={headerRight}>
      <div className="pb-8">
        {/* Profile Photo */}
        <FormSection title="Profile Photo">
          <div className="p-4">
            <label className="cursor-pointer block">
              <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden bg-muted relative group border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="Pet" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); removePhoto(); }}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <Upload className="w-8 h-8 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">
                      {uploading ? 'Uploading...' : 'Add photo'}
                    </p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </FormSection>

        {/* Basic Information */}
        <FormSection title="Basic Information">
          <FormRow label="Pet Name" required error={errors.name}>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Max"
              className={`bg-muted/50 border-0 ${errors.name ? 'ring-2 ring-destructive' : ''}`}
            />
          </FormRow>
          
          <FormRow label="Species" required error={errors.species}>
            <Select value={formData.species} onValueChange={(value) => handleInputChange('species', value)}>
              <SelectTrigger className={`bg-muted/50 border-0 ${errors.species ? 'ring-2 ring-destructive' : ''}`}>
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
          </FormRow>

          <FormRow label="Breed" error={errors.breed}>
            <BreedAutocomplete
              species={formData.species}
              value={formData.breed}
              onChange={(value) => handleInputChange('breed', value)}
              placeholder="Select or type breed"
            />
          </FormRow>

          <FormRow label="Colour/Markings" error={errors.color}>
            <Input
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              placeholder="e.g., Golden, white chest"
              className="bg-muted/50 border-0"
            />
          </FormRow>

          <FormRow label="Sex">
            <Select value={formData.sex} onValueChange={(value) => handleInputChange('sex', value)}>
              <SelectTrigger className="bg-muted/50 border-0">
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </FormRow>

          <FormRow label="Date of Birth">
            <Input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              className="bg-muted/50 border-0"
            />
          </FormRow>

          <FormRow label="Weight (kg)">
            <Input
              type="number"
              step="0.1"
              min="0"
              value={formData.weight_kg}
              onChange={(e) => handleInputChange('weight_kg', e.target.value)}
              placeholder="e.g., 25.5"
              className="bg-muted/50 border-0"
            />
          </FormRow>

          <div className="flex items-center justify-between p-4">
            <span className="font-medium">Desexed</span>
            <Switch
              checked={formData.desexed}
              onCheckedChange={(checked) => handleInputChange('desexed', checked)}
            />
          </div>
        </FormSection>

        {/* Microchip & Registry */}
        <FormSection title="Microchip & Registry">
          <FormRow label="Microchip Number" error={errors.microchip_number}>
            <Input
              value={formData.microchip_number}
              onChange={(e) => handleInputChange('microchip_number', e.target.value)}
              placeholder="15-digit number"
              className="bg-muted/50 border-0"
            />
          </FormRow>

          <FormRow label="Registry Name">
            <RegistrySelect
              value={formData.registry_name}
              onChange={(value) => handleInputChange('registry_name', value)}
              placeholder="Select registry"
            />
          </FormRow>

          <FormRow label="Registry Website" error={errors.registry_link}>
            <Input
              value={formData.registry_link}
              onChange={(e) => handleInputChange('registry_link', e.target.value)}
              placeholder="https://..."
              className={`bg-muted/50 border-0 ${errors.registry_link ? 'ring-2 ring-destructive' : ''}`}
            />
          </FormRow>
        </FormSection>

        {/* Health & Care */}
        <FormSection title="Health & Care">
          <FormRow label="Vet Clinic">
            <VetClinicAutocomplete
              value={formData.clinic_name}
              clinicAddress={formData.clinic_address}
              onChange={(data: VetClinicData) => {
                setFormData(prev => ({
                  ...prev,
                  clinic_name: data.name,
                  clinic_address: data.address,
                }));
              }}
              placeholder="Start typing vet clinic name…"
            />
            {formData.clinic_address && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground mt-2 p-2 bg-muted/30 rounded-lg">
                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{formData.clinic_address}</span>
              </div>
            )}
          </FormRow>

          <FormRow label="Insurance Provider">
            <InsuranceProviderSelect
              value={formData.insurance_provider}
              onChange={(value) => handleInputChange('insurance_provider', value)}
              placeholder="Select provider"
            />
          </FormRow>

          <FormRow label="Policy Number">
            <Input
              value={formData.insurance_policy}
              onChange={(e) => handleInputChange('insurance_policy', e.target.value)}
              placeholder="Policy number"
              className="bg-muted/50 border-0"
            />
          </FormRow>
        </FormSection>

        {/* Notes */}
        <FormSection title="Additional Notes">
          <div className="p-4">
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional information about your pet..."
              className={`min-h-[100px] bg-muted/50 border-0 resize-none ${errors.notes ? 'ring-2 ring-destructive' : ''}`}
            />
            {errors.notes && (
              <p className="text-xs text-destructive mt-2">{errors.notes}</p>
            )}
          </div>
        </FormSection>

        {/* Actions */}
        <div className="px-4 pt-2 space-y-3">
          <Button 
            onClick={handleSubmit}
            disabled={saving || !formData.name || !formData.species}
            className="w-full h-12 text-base font-semibold rounded-xl"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                Save Changes
              </span>
            )}
          </Button>

          {canDeletePets(role) && (
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              className="w-full h-12 text-base font-semibold rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Pet
            </Button>
          )}
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {formData.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All pet data including vaccinations, health reminders, and documents will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? 'Deleting...' : 'Delete Forever'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Crop Dialog */}
        <ImageCropDialog
          open={cropDialogOpen}
          onClose={() => { setCropDialogOpen(false); setImageToCrop(null); }}
          image={imageToCrop}
          onCropComplete={handleCroppedImage}
          aspectRatio={1}
        />
      </div>
    </IOSPageLayout>
  );
}
