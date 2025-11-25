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
import { Users, Crown, TrendingUp, DollarSign, Search, Edit, Mail, Trash2, History } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { invokeWithAuth } from '@/lib/invokeWithAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { normalizeTier, computeEffectiveTier } from '@/lib/plan/effectivePlan';
import { PendingDeletions } from '@/components/admin/PendingDeletions';
import { useNavigate } from 'react-router-dom';

interface UserData {
  user_id: string;
  email: string;
  display_name: string | null;
  plan_tier?: string;
  plan_v2?: string;
  subscription_status?: string;
  stripe_status?: string;
  stripe_tier?: string;
  manual_override?: boolean;
  plan_source?: string;
  plan_expires_at?: string | null;
  plan_updated_at?: string | null;
  next_billing_at?: string | null;
  stripe_current_period_end?: string | null;
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
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedUserAudit, setSelectedUserAudit] = useState<PlanAudit[]>([]);
  const [showChangeTierModal, setShowChangeTierModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [immediateDelete, setImmediateDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkImmediateDelete, setBulkImmediateDelete] = useState(false);

  // KPI states
  const [totalUsers, setTotalUsers] = useState(0);
  const [proUsers, setProUsers] = useState(0);
  const [proPercentage, setProPercentage] = useState(0);
  const [estimatedMRR, setEstimatedMRR] = useState(0);

  const getTierDisplay = (user: UserData) => {
    // Compute effective tier using the same logic as frontend
    const effectiveTier = computeEffectiveTier({
      plan_tier: user.plan_tier as any,
      plan_v2: user.plan_v2 as any,
      subscription_status: user.subscription_status as any,
      stripe_status: user.stripe_status,
      stripe_tier: user.stripe_tier as any,
      manual_override: user.manual_override,
      plan_source: user.plan_source as any,
    });

    if (effectiveTier === 'pro') {
      return { label: 'Pro', variant: 'default' as const, Icon: Crown };
    }

    return { label: 'Free', variant: 'secondary' as const, Icon: null };
  };

  const getExpiryDisplay = (user: UserData) => {
    // Check if user has active Stripe subscription
    const hasActiveSubscription = user.stripe_status === 'active' || user.subscription_status === 'active';
    
    if (hasActiveSubscription) {
      // Show renewal date for subscription users
      const renewalDate = user.next_billing_at || user.stripe_current_period_end;
      if (renewalDate) {
        return {
          date: new Date(renewalDate).toLocaleDateString(),
          label: 'Renews',
          variant: 'default' as const
        };
      }
    }
    
    // Show expiry date for trial/manual users
    if (user.plan_expires_at) {
      return {
        date: new Date(user.plan_expires_at).toLocaleDateString(),
        label: 'Expires',
        variant: 'secondary' as const
      };
    }
    
    return { date: '-', label: '', variant: 'secondary' as const };
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
        .select('id, email, display_name, plan_tier, plan_v2, subscription_status, stripe_status, stripe_tier, manual_override, plan_source, plan_expires_at, plan_updated_at, created_at, next_billing_at, stripe_current_period_end')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userData: UserData[] =
        data?.map((profile) => ({
          user_id: profile.id,
          email: profile.email || 'No email',
          display_name: profile.display_name,
          plan_tier: profile.plan_tier || 'free',
          plan_v2: profile.plan_v2,
          subscription_status: profile.subscription_status,
          stripe_status: profile.stripe_status,
          stripe_tier: profile.stripe_tier,
          manual_override: profile.manual_override,
          plan_source: profile.plan_source || 'stripe',
          plan_expires_at: profile.plan_expires_at,
          plan_updated_at: profile.plan_updated_at,
          next_billing_at: profile.next_billing_at,
          stripe_current_period_end: profile.stripe_current_period_end,
          created_at: profile.created_at,
        })) || [];

      setUsers(userData);
      setFilteredUsers(userData);

      // Calculate KPIs
      setTotalUsers(userData.length);
      const pro = userData.filter((u) => {
        const effectiveTier = computeEffectiveTier({
          plan_tier: u.plan_tier as any,
          plan_v2: u.plan_v2 as any,
          subscription_status: u.subscription_status as any,
          stripe_status: u.stripe_status,
          stripe_tier: u.stripe_tier as any,
          manual_override: u.manual_override,
          plan_source: u.plan_source as any,
        });
        return effectiveTier === 'pro';
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

  const handleDeleteUser = async (user: UserData) => {
    try {
      setDeleting(true);
      const result = await invokeWithAuth<{ success: boolean; message: string }>('admin-delete-account', {
        body: {
          user_id: user.user_id,
          immediate: immediateDelete,
          reason: immediateDelete
            ? 'Admin requested immediate deletion from user management'
            : 'Admin initiated soft deletion from user management',
        },
      });

      if (result.success) {
        toast.success(
          immediateDelete
            ? 'User account deleted immediately'
            : 'User account scheduled for deletion'
        );
        fetchUsers();
        setShowDeleteDialog(false);
        setImmediateDelete(false);
        setSelectedUser(null);
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setBulkDeleting(true);
      const userIds = Array.from(selectedUsers);
      let successCount = 0;
      let failCount = 0;

      // Delete users one by one
      for (const userId of userIds) {
        try {
          const result = await invokeWithAuth<{ success: boolean }>('admin-delete-account', {
            body: {
              user_id: userId,
              immediate: bulkImmediateDelete,
              reason: bulkImmediateDelete
                ? 'Admin bulk immediate deletion'
                : 'Admin bulk soft deletion',
            },
          });

          if (result.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error(`Error deleting user ${userId}:`, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} user(s)`);
      }
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} user(s)`);
      }

      fetchUsers();
      setShowBulkDeleteDialog(false);
      setBulkImmediateDelete(false);
      setSelectedUsers(new Set());
    } catch (error: any) {
      console.error('Error bulk deleting users:', error);
      toast.error('Failed to delete users');
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.user_id)));
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/admin/deletion-history')} variant="outline">
            <History className="mr-2 h-4 w-4" />
            Deletion History
          </Button>
          <Button onClick={() => navigate('/admin/email-preview')} variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Email Templates
          </Button>
          <Button onClick={() => navigate('/admin/limit-audit')} variant="outline">
            <TrendingUp className="mr-2 h-4 w-4" />
            Limit Audit
          </Button>
        </div>
      </div>

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

      {/* Pending Deletions */}
      <PendingDeletions />

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Management</CardTitle>
            {selectedUsers.size > 0 && (
              <Button
                variant="destructive"
                onClick={() => setShowBulkDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedUsers.size})
              </Button>
            )}
          </div>
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
            <div className={selectedUser 
              ? "grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-300" 
              : "w-full"}>
              <div className={selectedUser ? "lg:col-span-2" : "w-full"}>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="min-w-[250px]">User</TableHead>
                        <TableHead className="w-28">Tier</TableHead>
                        <TableHead className="w-28">Source</TableHead>
                        <TableHead className="w-36">Expires/Renewal</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow
                        key={user.user_id}
                        className={selectedUser?.user_id === user.user_id ? 'bg-muted' : ''}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedUsers.has(user.user_id)}
                            onCheckedChange={() => toggleUserSelection(user.user_id)}
                          />
                        </TableCell>
                        <TableCell onClick={() => handleSelectUser(user)}>
                          <div>
                            <div className="font-medium">{user.display_name || 'No name'}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell onClick={() => handleSelectUser(user)}>
                          {(() => {
                            const { label, variant, Icon } = getTierDisplay(user);
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
                        <TableCell onClick={() => handleSelectUser(user)}>
                          <Badge variant="outline">{user.plan_source || 'stripe'}</Badge>
                        </TableCell>
                        <TableCell className="text-sm" onClick={() => handleSelectUser(user)}>
                          {(() => {
                            const { date, label, variant } = getExpiryDisplay(user);
                            return (
                              <div className="flex flex-col">
                                <span className="font-medium">{date}</span>
                                {label && (
                                  <span className={`text-xs ${variant === 'default' ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {label}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
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
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(user);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
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

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => {
        setShowDeleteDialog(open);
        if (!open) {
          setImmediateDelete(false);
          setSelectedUser(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div><strong>User:</strong> {selectedUser.display_name || 'No name'}</div>
                    <div><strong>Email:</strong> {selectedUser.email}</div>
                    <div><strong>Current Tier:</strong> {getTierDisplay(selectedUser).label}</div>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted">
                    <Checkbox
                      id="immediate-delete"
                      checked={immediateDelete}
                      onCheckedChange={(checked) => setImmediateDelete(checked === true)}
                    />
                    <Label htmlFor="immediate-delete" className="cursor-pointer">
                      <div className="font-medium">Immediate deletion (skip 30-day grace period)</div>
                      <div className="text-xs text-muted-foreground">
                        Permanently delete all data now. This cannot be undone.
                      </div>
                    </Label>
                  </div>

                  <div className="text-sm text-destructive font-medium">
                    {immediateDelete
                      ? '⚠️ All user data will be permanently deleted immediately.'
                      : 'User will have 30 days to restore their account. Stripe subscriptions will be canceled.'}
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && handleDeleteUser(selectedUser)}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : immediateDelete ? 'Delete Immediately' : 'Schedule Deletion'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={(open) => {
        setShowBulkDeleteDialog(open);
        if (!open) setBulkImmediateDelete(false);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bulk Delete Accounts</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <div className="text-sm">
                  You are about to delete <strong>{selectedUsers.size}</strong> user account(s).
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted">
                  <Checkbox
                    id="bulk-immediate-delete"
                    checked={bulkImmediateDelete}
                    onCheckedChange={(checked) => setBulkImmediateDelete(checked === true)}
                  />
                  <Label htmlFor="bulk-immediate-delete" className="cursor-pointer">
                    <div className="font-medium">Immediate deletion (skip 30-day grace period)</div>
                    <div className="text-xs text-muted-foreground">
                      Permanently delete all data now. This cannot be undone.
                    </div>
                  </Label>
                </div>

                <div className="text-sm text-destructive font-medium">
                  {bulkImmediateDelete
                    ? '⚠️ All selected user data will be permanently deleted immediately.'
                    : 'Selected users will have 30 days to restore their accounts. Stripe subscriptions will be canceled.'}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkDeleting ? 'Deleting...' : bulkImmediateDelete ? 'Delete Immediately' : 'Schedule Deletion'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
