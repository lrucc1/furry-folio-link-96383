import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { au } from '@/lib/auEnglish';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { log } from '@/lib/log';

export function DeleteAccount() {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      toast.error(au('Please type DELETE to confirm'));
      return;
    }

    setDeleting(true);

    try {
      log.info('[DeleteAccount] Starting account deletion...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Call delete-account edge function
      const { data, error } = await supabase.functions.invoke('delete-account');

      if (error) throw error;

      log.info('[DeleteAccount] Account deleted successfully');

      // Sign out
      await supabase.auth.signOut();

      // Show success message and redirect
      toast.success(au('Account deleted successfully'));
      
      setTimeout(() => {
        navigate('/');
      }, 1500);

    } catch (error: any) {
      log.error('[DeleteAccount] Deletion failed:', error);
      toast.error(error.message || au('Failed to delete account'));
      setDeleting(false);
    }
  };

  return (
    <>
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {au('Delete account')}
          </CardTitle>
          <CardDescription>
            {au('Permanently delete your account and all associated data. This action cannot be undone.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <h4 className="font-medium text-destructive mb-2">{au('Warning:')}</h4>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>{au('All your pets and their records will be deleted')}</li>
                <li>{au('All health reminders and vaccinations will be deleted')}</li>
                <li>{au('All documents will be deleted')}</li>
                <li>{au('All invitations will be cancelled')}</li>
                <li>{au('This action is immediate and cannot be undone')}</li>
              </ul>
            </div>

            <Button
              variant="destructive"
              onClick={() => setShowDialog(true)}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {au('Delete my account')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {au('Are you absolutely sure?')}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  {au('This will permanently delete your account and all your data. This action cannot be undone.')}
                </p>
                <div>
                  <Label htmlFor="confirm-delete">
                    {au('Type DELETE to confirm')}
                  </Label>
                  <Input
                    id="confirm-delete"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="mt-2"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {au('Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting || confirmText !== 'DELETE'}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {au('Deleting...')}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {au('Delete account')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
