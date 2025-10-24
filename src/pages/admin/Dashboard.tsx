import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChangeTierModal } from '@/components/admin/ChangeTierModal';
import { toast } from 'sonner';
import { Users, Crown, TrendingUp, DollarSign, Search, Edit } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { normalizeTier } from '@/lib/plan/effectivePlan';

interface UserData {
  user_id: string;
  email: string;
  display_name: string | null;
  plan_tier?: string;
  plan_source?: string;
  plan_expires_at?: string | null;
  plan_updated_at?: string | null;
  created_at: string;
}

interface PlanAudit {
  id: number;
  actor_id: string;
  target_id: string;
  action: string;
  new_tier: string;
  note: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedUserAudit, setSelectedUserAudit] = useState<PlanAudit[]>([]);
  const [showChangeTierModal, setShowChangeTierModal] = useState(false);

  // KPI states
  const [totalUsers, setTotalUsers] = useState(0);
  const [proUsers, setProUsers] = useState(0);
  const [proPercentage, setProPercentage] = useState(0);
  const [estimatedMRR, setEstimatedMRR] = useState(0);

  const getTierDisplay = (tier?: string) => {
    const normalized = (tier || 'free').toLowerCase();

    if (['pro', 'family', 'fire', 'premium', 'trial'].includes(normalized)) {
      return { label: 'Pro', variant: 'default' as const, Icon: Crown };
    }

    return { label: 'Free', variant: 'secondary' as const, Icon: null };
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, plan_tier, plan_source, plan_expires_at, plan_updated_at, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userData: UserData[] =
        data?.map((profile) => ({
          user_id: profile.id,
          email: profile.email || 'No email',
          display_name: profile.display_name,
          plan_tier: profile.plan_tier || 'free',
          plan_source: profile.plan_source || 'stripe',
          plan_expires_at: profile.plan_expires_at,
          plan_updated_at: profile.plan_updated_at,
          created_at: profile.created_at,
        })) || [];

      setUsers(userData);
      setFilteredUsers(userData);

      // Calculate KPIs
      setTotalUsers(userData.length);
      const pro = userData.filter((u) => {
        const normalized = (u.plan_tier || 'free').toLowerCase();
        return ['pro', 'family', 'fire', 'premium', 'trial'].includes(normalized);
      }).length;
      setProUsers(pro);
      setProPercentage(userData.length > 0 ? (pro / userData.length) * 100 : 0);
      setEstimatedMRR(pro * 7.99);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLog = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('plan_audit')
        .select('*')
        .eq('target_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSelectedUserAudit(data || []);
    } catch (error) {
      console.error('Error fetching audit log:', error);
    }
  };

  const handleSelectUser = (user: UserData) => {
    setSelectedUser(user);
    fetchAuditLog(user.user_id);
  };

  const handleChangeTier = () => {
    setShowChangeTierModal(true);
  };

  const handleTierSaved = () => {
    fetchUsers();
    if (selectedUser) {
      fetchAuditLog(selectedUser.user_id);
    }
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pro Users</CardTitle>
            <Crown className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pro %</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proPercentage.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${estimatedMRR.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
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
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow
                        key={user.user_id}
                        className={selectedUser?.user_id === user.user_id ? 'bg-muted' : ''}
                        onClick={() => handleSelectUser(user)}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.display_name || 'No name'}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const { label, variant, Icon } = getTierDisplay(user.plan_tier);
                            return (
                              <Badge variant={variant}>
                                {Icon ? (
                                  <>
                                    <Icon className="w-3 h-3 mr-1" />
                                    {label}
                                  </>
                                ) : (
                                  label
                                )}
                              </Badge>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.plan_source || 'stripe'}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.plan_expires_at
                            ? new Date(user.plan_expires_at).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectUser(user);
                              handleChangeTier();
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Audit Log Panel */}
              {selectedUser && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Plan Audit Log</h3>
                  <div className="space-y-3">
                    {selectedUserAudit.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No audit entries</p>
                    ) : (
                      selectedUserAudit.map((audit) => (
                        <div key={audit.id} className="border-l-2 border-primary pl-3 py-2">
                          <div className="text-sm font-medium">{audit.action}</div>
                          <div className="text-xs text-muted-foreground">
                            Tier: {audit.new_tier}
                          </div>
                          {audit.note && (
                            <div className="text-xs text-muted-foreground mt-1">{audit.note}</div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(audit.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Tier Modal */}
      {showChangeTierModal && selectedUser && (
        <ChangeTierModal
          userId={selectedUser.user_id}
          currentTier={normalizeTier((selectedUser.plan_tier as string | undefined) || 'free')}
          userName={selectedUser.display_name || selectedUser.email}
          onClose={() => setShowChangeTierModal(false)}
          onSaved={handleTierSaved}
        />
      )}
    </div>
  );
}
