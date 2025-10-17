import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { au } from '@/lib/auEnglish';

interface VaccinationModalProps {
  open: boolean;
  onClose: () => void;
  petId: string;
  onSuccess: () => void;
}

export function VaccinationModal({ open, onClose, petId, onSuccess }: VaccinationModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    vaccine_name: '',
    date_given: '',
    clinic: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vaccine_name || !formData.date_given) {
      toast.error(au('Please fill in all required fields'));
      return;
    }

    // Check if date is in the future
    const selectedDate = new Date(formData.date_given);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      toast.error(au('Date given cannot be in the future'));
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('vaccinations')
        .insert({
          pet_id: petId,
          vaccine_name: formData.vaccine_name,
          date_given: formData.date_given,
          clinic: formData.clinic || null,
          notes: formData.notes || null,
          created_by: user.id
        });

      if (error) throw error;

      toast.success(au('Vaccination added'));
      setFormData({ vaccine_name: '', date_given: '', clinic: '', notes: '' });
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error adding vaccination:', error);
      toast.error(au('Failed to add vaccination'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{au('Add vaccination')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="vaccine_name">
              {au('Vaccine name')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="vaccine_name"
              value={formData.vaccine_name}
              onChange={(e) => setFormData({ ...formData, vaccine_name: e.target.value })}
              placeholder={au('e.g., C5, F3, Rabies')}
              required
            />
          </div>

          <div>
            <Label htmlFor="date_given">
              {au('Date given')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="date_given"
              type="date"
              value={formData.date_given}
              onChange={(e) => setFormData({ ...formData, date_given: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <Label htmlFor="clinic">{au('Clinic')}</Label>
            <Input
              id="clinic"
              value={formData.clinic}
              onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
              placeholder={au('e.g., City Vet Clinic')}
            />
          </div>

          <div>
            <Label htmlFor="notes">{au('Notes')}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={au('Any additional information...')}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              {au('Cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? au('Saving...') : au('Add vaccination')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
