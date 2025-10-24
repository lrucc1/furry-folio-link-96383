import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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

interface HealthReminder {
  id: string;
  title: string;
  reminder_type: string | null;
  reminder_date: string;
  description: string | null;
  completed: boolean;
}

interface EditHealthReminderModalProps {
  open: boolean;
  onClose: () => void;
  reminder: HealthReminder | null;
  petId: string;
  onSuccess: () => void;
}

export function EditHealthReminderModal({ 
  open, 
  onClose, 
  reminder,
  petId,
  onSuccess 
}: EditHealthReminderModalProps) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    reminder_type: 'general',
    reminder_date: '',
    description: ''
  });

  useEffect(() => {
    if (reminder) {
      setFormData({
        title: reminder.title || '',
        reminder_type: reminder.reminder_type || 'general',
        reminder_date: reminder.reminder_date || '',
        description: reminder.description || ''
      });
    }
  }, [reminder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.reminder_date || !reminder) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('health_reminders')
        .update({
          title: formData.title,
          reminder_type: formData.reminder_type,
          reminder_date: formData.reminder_date,
          description: formData.description || null
        })
        .eq('id', reminder.id);

      if (error) throw error;

      toast.success('Health reminder updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating health reminder:', error);
      toast.error('Failed to update health reminder');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!reminder) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('health_reminders')
        .delete()
        .eq('id', reminder.id);

      if (error) throw error;

      toast.success('Health reminder deleted successfully');
      onSuccess();
      onClose();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting health reminder:', error);
      toast.error('Failed to delete health reminder');
    } finally {
      setDeleting(false);
    }
  };

  if (!reminder) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Health Reminder</DialogTitle>
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add any notes about this reminder..."
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
                Delete
              </Button>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="flex-1 sm:flex-none">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1 sm:flex-none">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Health Reminder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this health reminder? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
