import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VetClinicAutocomplete, VetClinicData } from '@/components/VetClinicAutocomplete';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { au } from '@/lib/auEnglish';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Vaccination {
  id: string;
  vaccine_name: string;
  vaccine_date: string;
  next_due_date: string | null;
  notes: string | null;
}

interface EditVaccinationModalProps {
  open: boolean;
  onClose: () => void;
  vaccination: Vaccination | null;
  petId: string;
  defaultClinic?: string;
  defaultClinicAddress?: string;
  onSuccess: () => void;
}

export function EditVaccinationModal({ 
  open, 
  onClose, 
  vaccination,
  petId,
  defaultClinic = '',
  defaultClinicAddress = '',
  onSuccess 
}: EditVaccinationModalProps) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    vaccine_name: '',
    vaccine_date: '',
    next_due_date: '',
    clinic_name: defaultClinic,
    clinic_address: defaultClinicAddress,
    notes: ''
  });

  useEffect(() => {
    if (vaccination) {
      setFormData({
        vaccine_name: vaccination.vaccine_name || '',
        vaccine_date: vaccination.vaccine_date || '',
        next_due_date: vaccination.next_due_date || '',
        clinic_name: defaultClinic,
        clinic_address: defaultClinicAddress,
        notes: vaccination.notes || ''
      });
    }
  }, [vaccination, defaultClinic, defaultClinicAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vaccine_name || !formData.vaccine_date || !vaccination) {
      toast.error(au('Please fill in all required fields'));
      return;
    }

    if (new Date(formData.vaccine_date) > new Date()) {
      toast.error(au('Vaccination date cannot be in the future'));
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('vaccinations')
        .update({
          vaccine_name: formData.vaccine_name,
          vaccine_date: formData.vaccine_date,
          next_due_date: formData.next_due_date || null,
          notes: formData.notes || null
        })
        .eq('id', vaccination.id);

      if (error) throw error;

      toast.success(au('Vaccination updated successfully'));
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating vaccination:', error);
      toast.error(au('Failed to update vaccination'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!vaccination) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('vaccinations')
        .delete()
        .eq('id', vaccination.id);

      if (error) throw error;

      toast.success(au('Vaccination deleted successfully'));
      onSuccess();
      onClose();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting vaccination:', error);
      toast.error(au('Failed to delete vaccination'));
    } finally {
      setDeleting(false);
    }
  };

  const handleClinicChange = (clinicData: VetClinicData) => {
    setFormData({ 
      ...formData, 
      clinic_name: clinicData.name,
      clinic_address: clinicData.address
    });
  };

  if (!vaccination) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{au('Edit Vaccination')}</DialogTitle>
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
              <Label htmlFor="clinic_name">{au('Clinic')}</Label>
              <VetClinicAutocomplete
                value={formData.clinic_name}
                clinicAddress={formData.clinic_address}
                onChange={handleClinicChange}
                placeholder={au('Search for vet clinic...')}
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

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {au('Delete')}
              </Button>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="flex-1 sm:flex-none">
                  {au('Cancel')}
                </Button>
                <Button type="submit" disabled={saving} className="flex-1 sm:flex-none">
                  {saving ? au('Saving...') : au('Save Changes')}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{au('Delete Vaccination')}</AlertDialogTitle>
            <AlertDialogDescription>
              {au('Are you sure you want to delete this vaccination record? This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{au('Cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? au('Deleting...') : au('Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
