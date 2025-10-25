import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface HealthReminderModalProps {
  open: boolean;
  onClose: () => void;
  petId: string;
  onSuccess: () => void;
}

export function HealthReminderModal({ open, onClose, petId, onSuccess }: HealthReminderModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    reminder_type: 'general',
    reminder_date: '',
    description: '',
    recurrence_enabled: false,
    recurrence_interval: 'none' as 'none' | 'monthly' | 'yearly'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.reminder_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('health_reminders')
        .insert({
          pet_id: petId,
          user_id: user.id,
          title: formData.title,
          reminder_type: formData.reminder_type,
          reminder_date: formData.reminder_date,
          description: formData.description || null,
          completed: false,
          recurrence_enabled: formData.recurrence_enabled,
          recurrence_interval: formData.recurrence_enabled ? formData.recurrence_interval : 'none'
        });

      if (error) throw error;

      toast.success('Health reminder added successfully');
      setFormData({
        title: '',
        reminder_type: 'general',
        reminder_date: '',
        description: '',
        recurrence_enabled: false,
        recurrence_interval: 'none'
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding health reminder:', error);
      toast.error('Failed to add health reminder');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Health Reminder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Reminder Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Worming treatment, Flea treatment"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder_type">Type</Label>
            <Select 
              value={formData.reminder_type} 
              onValueChange={(value) => setFormData({ ...formData, reminder_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="worming">Worming</SelectItem>
                <SelectItem value="flea_tick">Flea & Tick</SelectItem>
                <SelectItem value="checkup">Vet Checkup</SelectItem>
                <SelectItem value="medication">Medication</SelectItem>
                <SelectItem value="grooming">Grooming</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder_date">Due Date *</Label>
            <Input
              id="reminder_date"
              type="date"
              value={formData.reminder_date}
              onChange={(e) => setFormData({ ...formData, reminder_date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Repeat</Label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Enable recurring reminder</span>
              <Switch
                checked={formData.recurrence_enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, recurrence_enabled: checked })}
                aria-label="Enable recurring reminder"
              />
            </div>
            {formData.recurrence_enabled && (
              <div className="pt-2">
                <Label className="text-sm">Repeat interval</Label>
                <Select
                  value={formData.recurrence_interval}
                  onValueChange={(val) => setFormData({ ...formData, recurrence_interval: val as 'monthly' | 'yearly' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  We will remind you before the next due date based on this interval.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any notes about this reminder..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Add Reminder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
