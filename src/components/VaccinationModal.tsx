import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VetClinicAutocomplete, VetClinicData } from '@/components/VetClinicAutocomplete';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { au } from '@/lib/auEnglish';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useEntitlementCheck } from '@/hooks/useEntitlementCheck';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface VaccinationModalProps {
  open: boolean;
  onClose: () => void;
  petId: string;
  defaultClinic?: string;
  defaultClinicAddress?: string;
  onSuccess: () => void;
}

export function VaccinationModal({ 
  open, 
  onClose, 
  petId, 
  defaultClinic = '',
  defaultClinicAddress = '',
  onSuccess 
}: VaccinationModalProps) {
  const { canCreate, message } = useEntitlementCheck('reminders_active_max');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    vaccine_name: '',
    vaccine_date: '',
    next_due_date: '',
    clinic_name: defaultClinic,
    clinic_address: defaultClinicAddress,
    notes: '',
    recurrence_enabled: false,
    recurrence_interval: 'none' as 'none' | 'monthly' | 'yearly'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check entitlement BEFORE creating
    if (!canCreate) {
      toast.error(message || au('Reminder limit reached. Upgrade to Pro for unlimited reminders.'));
      return;
    }
    
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
          notes: formData.notes || null,
          recurrence_enabled: formData.recurrence_enabled,
          recurrence_interval: formData.recurrence_enabled ? formData.recurrence_interval : 'none'
        });

      if (error) throw error;

      toast.success(au('Vaccination added successfully'));
      setFormData({
        vaccine_name: '',
        vaccine_date: '',
        next_due_date: '',
        clinic_name: defaultClinic,
        clinic_address: defaultClinicAddress,
        notes: '',
        recurrence_enabled: false,
        recurrence_interval: 'none'
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

  const handleClinicChange = (clinicData: VetClinicData) => {
    setFormData({ 
      ...formData, 
      clinic_name: clinicData.name,
      clinic_address: clinicData.address
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{au('Add vaccination')}</DialogTitle>
        </DialogHeader>
        
        {!canCreate && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between gap-2">
              <span>{message || au('Reminder limit reached.')}</span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/pricing">{au('Upgrade')}</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
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
            <Label>{au('Repeat')}</Label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{au('Enable recurring reminder')}</span>
              <Switch
                checked={formData.recurrence_enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, recurrence_enabled: checked })}
                aria-label={au('Enable recurring reminder')}
              />
            </div>
            {formData.recurrence_enabled && (
              <div className="pt-2">
                <Label className="text-sm">{au('Repeat interval')}</Label>
                <Select
                  value={formData.recurrence_interval}
                  onValueChange={(val) => setFormData({ ...formData, recurrence_interval: val as 'monthly' | 'yearly' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={au('Select interval')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">{au('Monthly')}</SelectItem>
                    <SelectItem value="yearly">{au('Yearly')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {au('We will remind you before the next due date based on this interval.')}
                </p>
              </div>
            )}
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              {au('Cancel')}
            </Button>
            <Button type="submit" disabled={saving || !canCreate}>
              {saving ? au('Saving...') : au('Add vaccination')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
