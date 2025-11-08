import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
