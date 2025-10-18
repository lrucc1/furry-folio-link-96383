import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    role: 'family' as 'family' | 'caregiver',
    selectedPetId: petId || ''
  });

  useEffect(() => {
    if (open && user) {
      fetchUserPets();
    }
  }, [open, user]);

  useEffect(() => {
    if (petId) {
      setFormData(prev => ({ ...prev, selectedPetId: petId }));
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
      
      // If no petId was provided and we have pets, select the first one
      if (!petId && data && data.length > 0) {
        setFormData(prev => ({ ...prev, selectedPetId: data[0].id }));
      }
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

    if (!formData.selectedPetId) {
      toast.error(au('Please select a pet'));
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

      const { data, error } = await supabase.functions.invoke('invite-family', {
        body: {
          pet_id: formData.selectedPetId,
          email: formData.email,
          role: formData.role
        }
      });

      if (error) throw error;

      setInviteUrl(data.inviteUrl);
      toast.success(au('Invite created'));
      onSuccess(data.inviteUrl);
    } catch (error) {
      console.error('Error creating invite:', error);
      toast.error(au('Failed to create invite'));
    } finally {
      setSaving(false);
    }
  };

  const copyLink = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      toast.success(au('Link copied'));
    }
  };

  const handleClose = () => {
    setFormData({ email: '', role: 'family', selectedPetId: petId || '' });
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
            {!petId && (
              <div>
                <Label htmlFor="pet">
                  {au('Select Pet')} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.selectedPetId}
                  onValueChange={(value) => setFormData({ ...formData, selectedPetId: value })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder={au('Choose a pet...')} />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {pets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name} ({pet.species})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
                onValueChange={(value: 'family' | 'caregiver') => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="family">{au('Family')}</SelectItem>
                  <SelectItem value="caregiver">{au('Caregiver')}</SelectItem>
                </SelectContent>
              </Select>
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
