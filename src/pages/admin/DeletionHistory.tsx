import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Trash2, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

interface DeletionAudit {
  id: number;
  actor_id: string;
  target_id: string;
  action: string;
  new_tier: string;
  note: string | null;
  created_at: string;
  actor_email?: string;
  target_email?: string;
  target_name?: string;
}

export default function DeletionHistory() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const [deletions, setDeletions] = useState<DeletionAudit[]>([]);
  const [filteredDeletions, setFilteredDeletions] = useState<DeletionAudit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchDeletionHistory();
    }
  }, [isAdmin]);

  useEffect(() => {
    const filtered = deletions.filter(
      (deletion) =>
        deletion.target_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deletion.target_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deletion.actor_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDeletions(filtered);
  }, [searchTerm, deletions]);

  const fetchDeletionHistory = async () => {
    try {
      setLoading(true);
      
      // Get deletion audit entries
      const { data: auditData, error: auditError } = await supabase
        .from('plan_audit')
        .select('*')
        .in('action', ['admin_delete', 'admin_hard_delete'])
        .order('created_at', { ascending: false })
        .limit(100);

      if (auditError) throw auditError;

      // Get profiles for actor and target info
      const actorIds = [...new Set(auditData?.map(d => d.actor_id) || [])];
      const targetIds = [...new Set(auditData?.map(d => d.target_id) || [])];
      
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .in('id', [...actorIds, ...targetIds]);

      if (profileError) throw profileError;

      // Create a map for quick lookup
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Enrich audit data with email and name
      const enrichedData = auditData?.map(audit => ({
        ...audit,
        actor_email: profileMap.get(audit.actor_id)?.email || 'Unknown',
        target_email: profileMap.get(audit.target_id)?.email || 'Deleted User',
        target_name: profileMap.get(audit.target_id)?.display_name || null,
      })) || [];

      setDeletions(enrichedData);
      setFilteredDeletions(enrichedData);
    } catch (error) {
      console.error('Error fetching deletion history:', error);
      toast.error('Failed to load deletion history');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    if (action === 'admin_hard_delete') {
      return <Badge variant="destructive">Immediate Delete</Badge>;
    }
    return <Badge variant="default">Soft Delete</Badge>;
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/ios-home" replace />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Account Deletion History</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Deletion Audit Log
            {deletions.length > 0 && (
              <Badge variant="secondary">{deletions.length} entries</Badge>
            )}
          </CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredDeletions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No results found' : 'No deletion history'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deleted User</TableHead>
                  <TableHead>Deletion Type</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeletions.map((deletion) => (
                  <TableRow key={deletion.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {deletion.target_name || 'No name'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {deletion.target_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getActionBadge(deletion.action)}</TableCell>
                    <TableCell>
                      <div className="text-sm">{deletion.actor_email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {deletion.note || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {new Date(deletion.created_at).toLocaleString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
