import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { au } from '@/lib/auEnglish';
import { Copy } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
}

interface InviteFamilyModalProps {
  open: boolean;
  onClose: () => void;
  petId?: string;
  onSuccess: (inviteUrl: string) => void;
}

export function InviteFamilyModal({ open, onClose, petId, onSuccess }: InviteFamilyModalProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    role: 'family' as 'family' | 'caregiver' | 'vet',
    selectedPetIds: petId ? [petId] : [] as string[]
  });

  useEffect(() => {
    if (open && user) {
      fetchUserPets();
    }
  }, [open, user]);

  useEffect(() => {
    if (petId) {
      setFormData(prev => ({ ...prev, selectedPetIds: [petId] }));
    }
  }, [petId]);

  const fetchUserPets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('pets')
        .select('id, name, species')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error(au('Please enter an email address'));
      return;
    }

    if (formData.selectedPetIds.length === 0) {
      toast.error(au('Please select at least one pet'));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(au('Please enter a valid email address'));
      return;
    }

    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Create invites for each selected pet
      const invitePromises = formData.selectedPetIds.map(petId =>
        supabase.functions.invoke('invite-family', {
          body: {
            pet_id: petId,
            email: formData.email,
            role: formData.role
          }
        })
      );

      const results = await Promise.all(invitePromises);
      
      // Check if any failed
      const failed = results.filter(r => r.error);
      if (failed.length > 0) {
        throw new Error('Some invites failed to create');
      }

      // Use the first invite URL for display
      setInviteUrl(results[0].data.inviteUrl);
      toast.success(au(`${formData.selectedPetIds.length} invite${formData.selectedPetIds.length > 1 ? 's' : ''} created`));
      onSuccess(results[0].data.inviteUrl);
    } catch (error) {
      console.error('Error creating invite:', error);
      toast.error(au('Failed to create invite'));
    } finally {
      setSaving(false);
    }
  };

  const togglePetSelection = (petId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPetIds: prev.selectedPetIds.includes(petId)
        ? prev.selectedPetIds.filter(id => id !== petId)
        : [...prev.selectedPetIds, petId]
    }));
  };

  const copyLink = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      toast.success(au('Link copied'));
    }
  };

  const handleClose = () => {
    setFormData({ email: '', role: 'family', selectedPetIds: petId ? [petId] : [] });
    setInviteUrl(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{au('Invite family member')}</DialogTitle>
        </DialogHeader>
        
        {!inviteUrl ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>
                {au('Select Pets')} <span className="text-destructive">*</span>
              </Label>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3 bg-background">
                {pets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{au('No pets found')}</p>
                ) : (
                  pets.map((pet) => (
                    <div key={pet.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pet-${pet.id}`}
                        checked={formData.selectedPetIds.includes(pet.id)}
                        onCheckedChange={() => togglePetSelection(pet.id)}
                      />
                      <label
                        htmlFor={`pet-${pet.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {pet.name} ({pet.species})
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">
                {au('Email address')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={au('name@example.com')}
                required
              />
            </div>

            <div>
              <Label htmlFor="role">{au('Role')}</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'family' | 'caregiver' | 'vet') => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="family">{au('Family')}</SelectItem>
                  <SelectItem value="caregiver">{au('Caregiver')}</SelectItem>
                  <SelectItem value="vet">{au('Veterinarian (VetShare)')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.role === 'vet' && au('Vets can only view medical records and health information')}
                {formData.role === 'family' && au('Family members can view and edit all pet information')}
                {formData.role === 'caregiver' && au('Caregivers have read-only access to pet information')}
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
                {au('Cancel')}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? au('Creating...') : au('Create invite')}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">{au('Invite link created')}</p>
              <p className="text-xs text-muted-foreground mb-3">
                {au('Share this link with the person you want to invite. They will need to sign in or create an account to accept.')}
              </p>
              <div className="flex items-center gap-2">
                <Input value={inviteUrl} readOnly className="text-sm" />
                <Button size="icon" variant="outline" onClick={copyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>{au('Done')}</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
