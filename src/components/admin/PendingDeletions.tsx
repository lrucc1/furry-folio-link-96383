import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Trash2, RefreshCw, UserX } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface PendingDeletion {
  user_id: string;
  email: string;
  display_name: string | null;
  deleted_at: string;
  days_remaining: number;
  hard_delete_date: string;
}

export function PendingDeletions() {
  const [deletions, setDeletions] = useState<PendingDeletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<PendingDeletion | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PendingDeletion | null>(null);
  const [immediateDelete, setImmediateDelete] = useState(false);

  const fetchPendingDeletions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_pending_deletions');

      if (error) throw error;
      setDeletions(data || []);
    } catch (error) {
      console.error('Error fetching pending deletions:', error);
      toast.error('Failed to load pending deletions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDeletions();
  }, []);

  const handleRestore = async (deletion: PendingDeletion) => {
    try {
      setRestoring(deletion.user_id);
      
      const { data, error } = await supabase.functions.invoke('restore-account', {
        body: { user_id: deletion.user_id },
      });

      if (error) throw error;

      toast.success(`Account restored for ${deletion.email}`);
      setConfirmRestore(null);
      await fetchPendingDeletions();
    } catch (error) {
      console.error('Error restoring account:', error);
      toast.error('Failed to restore account');
    } finally {
      setRestoring(null);
    }
  };

  const handleDelete = async (deletion: PendingDeletion) => {
    try {
      setDeleting(deletion.user_id);
      
      const { data, error } = await supabase.functions.invoke('admin-delete-account', {
        body: {
          user_id: deletion.user_id,
          immediate: immediateDelete,
          reason: immediateDelete ? 'Admin requested immediate deletion' : 'Admin accelerated deletion',
        },
      });

      if (error) throw error;

      toast.success(
        immediateDelete
          ? `Account deleted immediately for ${deletion.email}`
          : `Deletion initiated for ${deletion.email}`
      );
      setConfirmDelete(null);
      setImmediateDelete(false);
      await fetchPendingDeletions();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setDeleting(null);
    }
  };

  const getDaysRemainingBadge = (days: number) => {
    if (days <= 3) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="w-3 h-3" />
          {days} days
        </Badge>
      );
    } else if (days <= 7) {
      return (
        <Badge variant="default" className="gap-1 bg-orange-500">
          <Clock className="w-3 h-3" />
          {days} days
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="w-3 h-3" />
        {days} days
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Pending Account Deletions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-destructive" />
          Pending Account Deletions
          {deletions.length > 0 && (
            <Badge variant="destructive">{deletions.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deletions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No accounts scheduled for deletion
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Deleted At</TableHead>
                <TableHead>Days Remaining</TableHead>
                <TableHead>Hard Delete Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deletions.map((deletion) => (
                <TableRow key={deletion.user_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {deletion.display_name || 'No name'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {deletion.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(deletion.deleted_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {getDaysRemainingBadge(deletion.days_remaining)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(deletion.hard_delete_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmRestore(deletion)}
                        disabled={restoring === deletion.user_id || deleting === deletion.user_id}
                      >
                        {restoring === deletion.user_id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Restore
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setConfirmDelete(deletion)}
                        disabled={restoring === deletion.user_id || deleting === deletion.user_id}
                      >
                        {deleting === deletion.user_id ? (
                          <UserX className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <UserX className="h-4 w-4 mr-2" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={!!confirmRestore} onOpenChange={(open) => !open && setConfirmRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore the account for{' '}
              <span className="font-semibold">{confirmRestore?.email}</span>?
              <br />
              <br />
              This will immediately restore full access to their account and cancel the deletion process.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmRestore && handleRestore(confirmRestore)}>
              Restore Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => {
        if (!open) {
          setConfirmDelete(null);
          setImmediateDelete(false);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div><strong>User:</strong> {confirmDelete.display_name || 'No name'}</div>
                    <div><strong>Email:</strong> {confirmDelete.email}</div>
                    <div><strong>Days remaining:</strong> {confirmDelete.days_remaining}</div>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted">
                    <Checkbox
                      id="immediate"
                      checked={immediateDelete}
                      onCheckedChange={(checked) => setImmediateDelete(checked === true)}
                    />
                    <Label htmlFor="immediate" className="cursor-pointer text-sm">
                      <div className="font-medium">Skip grace period (immediate deletion)</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        This will permanently delete all data immediately. This action cannot be undone.
                      </div>
                    </Label>
                  </div>

                  <div className="text-sm text-destructive font-medium">
                    {immediateDelete
                      ? '⚠️ Account will be deleted immediately and cannot be recovered.'
                      : 'Subscriptions will be canceled (Apple subscriptions may need manual cancellation). Account remains scheduled for deletion.'}
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {immediateDelete ? 'Delete Immediately' : 'Cancel Subscription'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
