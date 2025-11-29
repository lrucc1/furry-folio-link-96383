import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanV2 } from '@/hooks/usePlanV2';
import { EntitlementServiceV2 } from '@/services/EntitlementServiceV2';
import { supabase } from '@/integrations/supabase/client';
import { IOSPageLayout } from '@/components/ios/IOSPageLayout';
import { MobileCard } from '@/components/ios/MobileCard';
import { FormSection, FormRow } from '@/components/ios/FormSection';
import { PaywallModal } from '@/components/PaywallModal';
import { VetClinicAutocomplete, VetClinicData } from '@/components/VetClinicAutocomplete';
import { RegistrySelect, InsuranceProviderSelect } from '@/components/RegionAwareSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, MapPin, PawPrint, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const PetSchema = z.object({
  name: z.string().trim().min(1, 'Pet name is required').max(100, 'Name must be under 100 characters'),
  species: z.string().trim().min(1, 'Species is required').max(50, 'Species must be under 50 characters'),
  breed: z.string().trim().max(100, 'Breed must be under 100 characters').optional().or(z.literal('')),
  color: z.string().trim().max(100, 'Colour must be under 100 characters').optional().or(z.literal('')),
  sex: z.string().trim().max(20).optional().or(z.literal('')),
  date_of_birth: z.string().trim().optional().or(z.literal('')),
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

export default function IOSAddPet() {
  const { user } = useAuth();
  const { plan, usage, entitlement } = usePlanV2();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const currentPets = usage.pets_count;
  const isProPlan = plan === 'PRO';
  const rawMax = entitlement?.pets_max ?? (isProPlan ? null : 1);
  const isUnlimited = isProPlan || rawMax === null || (typeof rawMax === 'number' && rawMax < 0);
  const maxPets = isUnlimited ? -1 : (rawMax as number);
  const canAddPet = isUnlimited || currentPets < maxPets;
  const remainingPets = isUnlimited ? 'Unlimited' : Math.max(0, maxPets - currentPets);

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
    clinic_name: '',
    clinic_address: '',
    insurance_provider: '',
    insurance_policy: '',
    notes: '',
  });

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

  const handleSubmit = async () => {
    if (!user) return;

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const service = EntitlementServiceV2.getInstance();
    const check = await service.checkEntitlement(user.id, 'pets_max', 1);

    if (!check.allowed) {
      const maxPetsAllowed = entitlement?.pets_max;
      if (!(maxPetsAllowed !== null && usage.pets_count < maxPetsAllowed)) {
        setShowPaywall(true);
        toast.error(check.reason || 'Upgrade to add more pets.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        species: formData.species.trim(),
        breed: formData.breed || null,
        sex: formData.sex || null,
        dob: formData.date_of_birth || null,
        microchip: formData.microchip_number || null,
        photo_url: null,
        color: formData.color || null,
        gender: formData.sex || null,
        date_of_birth: formData.date_of_birth || null,
        microchip_number: formData.microchip_number || null,
        registry_name: formData.registry_name || null,
        registry_link: formData.registry_link || null,
        clinic_name: formData.clinic_name || null,
        clinic_address: formData.clinic_address || null,
        insurance_provider: formData.insurance_provider || null,
        insurance_policy: formData.insurance_policy || null,
        notes: formData.notes || null,
      };

      const { data, error } = await supabase.functions.invoke('create-pet', {
        body: payload,
      });

      if (error) {
        const err: any = error;
        const msg = err?.message || err?.context?.message || 'Failed to add pet';
        throw new Error(msg);
      }

      if (!data?.id) {
        throw new Error('Pet was not created');
      }

      toast.success(`${formData.name} has been added!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add pet');
    } finally {
      setLoading(false);
    }
  };

  const headerLeft = (
    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-10 w-10 p-0">
      <ChevronLeft className="w-6 h-6" />
    </Button>
  );

  return (
    <IOSPageLayout title="Add Pet" headerRight={headerLeft}>
      <div className="pb-8">
        {/* Pet Limit Indicator */}
        {!canAddPet && (
          <MobileCard className="mb-6 border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-destructive">Pet limit reached</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upgrade to Pro to add unlimited pets
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => navigate('/pricing')}
                >
                  View Plans
                </Button>
              </div>
            </div>
          </MobileCard>
        )}

        {canAddPet && !isUnlimited && (
          <div className="px-4 mb-4">
            <p className="text-sm text-muted-foreground text-center">
              {remainingPets} {Number(remainingPets) === 1 ? 'pet slot' : 'pet slots'} remaining
            </p>
          </div>
        )}

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
            <Input
              value={formData.breed}
              onChange={(e) => handleInputChange('breed', e.target.value)}
              placeholder="e.g., Golden Retriever"
              className="bg-muted/50 border-0"
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
              <p className="text-xs text-destructive mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.notes}
              </p>
            )}
          </div>
        </FormSection>

        {/* Submit Button */}
        <div className="px-4 pt-2">
          <Button 
            onClick={handleSubmit}
            disabled={!canAddPet || loading || !formData.name || !formData.species}
            className="w-full h-12 text-base font-semibold rounded-xl"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                Adding...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <PawPrint className="w-5 h-5" />
                Add Pet
              </span>
            )}
          </Button>
        </div>

        <PaywallModal
          open={showPaywall}
          onOpenChange={setShowPaywall}
          feature="pet limit"
        />
      </div>
    </IOSPageLayout>
  );
}
