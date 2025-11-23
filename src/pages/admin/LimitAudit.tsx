import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface UserAudit {
  user_id: string;
  email: string;
  plan: string;
  pets_count: number;
  pets_limit: number;
  reminders_count: number;
  reminders_limit: number;
  storage_mb: number;
  storage_limit: number;
  caregivers_count: number;
  caregivers_limit: number;
  violations: string[];
}

export default function LimitAudit() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserAudit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, adminLoading, navigate]);

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-audit-limits');
      
      if (error) throw error;
      
      setUsers(data.users || []);
      toast.success('Audit completed');
    } catch (error) {
      console.error('Error fetching audit:', error);
      toast.error('Failed to fetch audit data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAudit();
    }
  }, [isAdmin]);

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin
        </Button>
        <Button variant="outline" onClick={fetchAudit}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <CardTitle>FREE Plan Limit Violations</CardTitle>
          </div>
          <CardDescription>
            Users currently exceeding their FREE plan limits (legacy data from before enforcement)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No violations found. All FREE users are within their limits.
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Found {users.length} user{users.length !== 1 ? 's' : ''} with limit violations
              </div>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-center">Pets</TableHead>
                      <TableHead className="text-center">Reminders</TableHead>
                      <TableHead className="text-center">Storage</TableHead>
                      <TableHead className="text-center">Caregivers</TableHead>
                      <TableHead>Violations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell className="text-center">
                          <span className={user.pets_count > user.pets_limit ? 'text-destructive font-semibold' : ''}>
                            {user.pets_count}/{user.pets_limit}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={user.reminders_count > user.reminders_limit ? 'text-destructive font-semibold' : ''}>
                            {user.reminders_count}/{user.reminders_limit}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={user.storage_mb > user.storage_limit ? 'text-destructive font-semibold' : ''}>
                            {user.storage_mb.toFixed(1)}/{user.storage_limit}MB
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={user.caregivers_count > user.caregivers_limit ? 'text-destructive font-semibold' : ''}>
                            {user.caregivers_count}/{user.caregivers_limit}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.violations.map((violation, idx) => (
                              <Badge key={idx} variant="destructive" className="text-xs">
                                {violation}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
