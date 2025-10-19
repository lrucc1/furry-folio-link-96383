import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tier } from '@/lib/plan/effectivePlan';

interface ChangeTierModalProps {
  userId: string;
  currentTier: Tier;
  userName?: string;
  onClose: () => void;
  onSaved: () => void;
}

export function ChangeTierModal({ userId, currentTier, userName, onClose, onSaved }: ChangeTierModalProps) {
  const [newTier, setNewTier] = useState<Tier>(currentTier);
  const [expiresAt, setExpiresAt] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('admin-set-plan', {
        body: {
          target_user_id: userId,
          new_tier: newTier,
          expires_at: expiresAt || null,
          note: note || null,
        },
      });

      if (error) throw error;

      if (data?.ok) {
        toast.success('Plan tier updated successfully');
        onSaved();
        onClose();
      } else {
        throw new Error('Failed to update plan tier');
      }
    } catch (error) {
      console.error('Error updating tier:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update tier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Plan Tier</DialogTitle>
          <DialogDescription>
            {userName ? `Update the plan tier for ${userName}` : 'Update user plan tier'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tier">Plan Tier</Label>
            <Select value={newTier} onValueChange={(value) => setNewTier(value as Tier)}>
              <SelectTrigger id="tier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">free - $0/month</SelectItem>
                <SelectItem value="premium">premium - $4.49/month</SelectItem>
                <SelectItem value="family">family - $7.99/month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires">Expires At (optional)</Label>
            <Input
              id="expires"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="Reason for change..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Tier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
