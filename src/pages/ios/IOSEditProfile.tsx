import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { IOSPageLayout } from '@/components/ios/IOSPageLayout';
import { PageTransition } from '@/components/ios/PageTransition';
import { MobileCard } from '@/components/ios/MobileCard';
import { FormSection, FormRow } from '@/components/ios/FormSection';
import { LoadingBoundary } from '@/components/ios/LoadingBoundary';
import { IOSEditProfileSkeleton } from '@/components/ios/IOSSkeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CountrySelector } from '@/components/CountrySelector';
import { TimezoneSelector } from '@/components/TimezoneSelector';
import { ImageCropDialog } from '@/components/ImageCropDialog';
import { ChevronLeft, Camera, User } from 'lucide-react';
import { toast } from 'sonner';

export default function IOSEditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    full_name: '',
    phone: '',
    country_code: 'AU',
    timezone: 'Australia/Sydney',
    avatar_url: ''
  });
  
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchProfile is defined in component
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      if (data) {
        setFormData({
          display_name: data.display_name || '',
          full_name: data.full_name || '',
          phone: data.phone || '',
          country_code: data.country_code || 'AU',
          timezone: data.timezone || 'Australia/Sydney',
          avatar_url: data.avatar_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!user) return;
    
    try {
      const fileName = `${user.id}/avatar-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedBlob, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success('Photo updated');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name.trim() || null,
          full_name: formData.full_name.trim() || null,
          phone: formData.phone.trim() || null,
          country_code: formData.country_code,
          timezone: formData.timezone,
          avatar_url: formData.avatar_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      toast.success('Profile updated');
      navigate(-1);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
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
      onClick={handleSave}
      disabled={saving}
      className="text-primary font-semibold"
    >
      {saving ? 'Saving...' : 'Save'}
    </Button>
  );

  return (
    <IOSPageLayout title="Edit Profile" headerLeft={headerLeft} headerRight={loading ? undefined : headerRight}>
      <LoadingBoundary loading={loading} skeleton={<IOSEditProfileSkeleton />}>
        <PageTransition>
          <div className="pb-8">
            {/* Profile Photo */}
            <MobileCard className="mb-6">
              <div className="flex flex-col items-center py-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group"
                >
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {formData.avatar_url ? (
                      <img 
                        src={formData.avatar_url} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md">
                    <Camera className="w-4 h-4 text-primary-foreground" />
                  </div>
                </button>
                <p className="text-sm text-muted-foreground mt-3">Tap to change photo</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>
            </MobileCard>

            {/* Personal Information */}
            <FormSection title="Personal Information">
              <FormRow label="Display Name">
                <Input
                  value={formData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  placeholder="How you want to be called"
                  className="bg-muted/50 border-0"
                />
              </FormRow>
              <FormRow label="Full Name">
                <Input
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Your legal name"
                  className="bg-muted/50 border-0"
                />
              </FormRow>
              <FormRow label="Email">
                <Input
                  value={user?.email || ''}
                  disabled
                  className="bg-muted/30 border-0 text-muted-foreground"
                />
              </FormRow>
              <FormRow label="Phone">
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Your phone number"
                  className="bg-muted/50 border-0"
                />
              </FormRow>
            </FormSection>

            {/* Location */}
            <FormSection title="Location">
              <FormRow label="Country">
                <CountrySelector
                  value={formData.country_code}
                  onChange={(value) => handleInputChange('country_code', value)}
                />
              </FormRow>
              <FormRow label="Timezone">
                <TimezoneSelector
                  value={formData.timezone}
                  onChange={(value) => handleInputChange('timezone', value)}
                />
              </FormRow>
            </FormSection>
          </div>
        </PageTransition>
      </LoadingBoundary>

      <ImageCropDialog
        open={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        image={selectedImage}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
      />
    </IOSPageLayout>
  );
}
