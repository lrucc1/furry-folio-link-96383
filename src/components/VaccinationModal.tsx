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
    vaccine_date: '',
    next_due_date: '',
    clinic: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vaccine_name || !formData.vaccine_date) {
      toast.error(au('Please fill in all required fields'));
      return;
    }

    // Validate date is not in the future
    if (new Date(formData.vaccine_date) > new Date()) {
      toast.error(au('Vaccination date cannot be in the future'));
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
          user_id: user.id,
          vaccine_name: formData.vaccine_name,
          vaccine_date: formData.vaccine_date,
          next_due_date: formData.next_due_date || null,
          notes: formData.notes || null
        });

      if (error) throw error;

      toast.success(au('Vaccination added successfully'));
      setFormData({
        vaccine_name: '',
        vaccine_date: '',
        next_due_date: '',
        clinic: '',
        notes: ''
      });
      onSuccess();
      onClose();
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
          <div className="space-y-2">
            <Label htmlFor="vaccine_name">{au('Vaccine name')} *</Label>
            <Input
              id="vaccine_name"
              value={formData.vaccine_name}
              onChange={(e) => setFormData({ ...formData, vaccine_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vaccine_date">{au('Date given')} *</Label>
            <Input
              id="vaccine_date"
              type="date"
              value={formData.vaccine_date}
              onChange={(e) => setFormData({ ...formData, vaccine_date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="next_due_date">{au('Next due date')}</Label>
            <Input
              id="next_due_date"
              type="date"
              value={formData.next_due_date}
              onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
              placeholder={au('Optional - for reminders')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinic">{au('Clinic')}</Label>
            <Input
              id="clinic"
              value={formData.clinic}
              onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{au('Notes')}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
