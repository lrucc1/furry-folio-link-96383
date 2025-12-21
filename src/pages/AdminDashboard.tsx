import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  Heart, 
  AlertTriangle, 
  Syringe,
  Crown,
  TrendingUp,
  Calendar,
  PawPrint,
  BarChart3,
  Settings,
  Database,
  Activity,
  UserCog,
  Shield,
  RefreshCw,
  Search,
  Download,
  Edit,
  Mail,
  Filter,
  X,
  Trash2,
  History,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PendingDeletions } from '@/components/admin/PendingDeletions';
import { computeEffectiveTier } from '@/lib/plan/effectivePlan';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
import { invokeWithAuth } from '@/lib/invokeWithAuth';

interface AdminStats {
  total_users: number;
  total_pets: number;
  lost_pets: number;
  total_vaccinations: number;
  fire_users?: number;
  pro_users?: number;
  premium_users?: number;
  pets_by_species: Record<string, number>;
  registrations_this_month: number;
  pets_added_this_month: number;
}

interface UserDetails {
  user_id: string;
  email: string;
  created_at: string;
  display_name: string | null;
  plan_tier: string;
  plan_v2?: string | null;
  subscription_status?: string | null;
  manual_override?: boolean | null;
  plan_source?: string | null;
  plan_expires_at?: string | null;
  plan_updated_at?: string | null;
  next_billing_at?: string | null;
  billing_interval?: string | null;
  deleted_at?: string | null;
  deletion_scheduled?: boolean;
  pet_count: number;
  roles: string[];
}

interface GrowthStats {
  daily_signups: Array<{ date: string; count: number }>;
  total_users: number;
  active_this_week: number;
  active_this_month: number;
}

interface SystemActivity {
  pets_activity: {
    added_today: number;
    added_this_week: number;
    updated_today: number;
  };
  health_activity: {
    reminders_created_today: number;
    reminders_completed_today: number;
    vaccinations_added_today: number;
  };
  lost_pets_trend: Array<{ date: string; lost_count: number }>;
}

interface DatabaseStats {
  tables: Record<string, number>;
  storage_stats: {
    total_documents: number;
    total_size_mb: number;
  };
}

interface SubscriptionTier {
  id: string;
  name: string;
  price_monthly: number;
}

const AdminDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [growthStats, setGrowthStats] = useState<GrowthStats | null>(null);
  const [systemActivity, setSystemActivity] = useState<SystemActivity | null>(null);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [allUsers, setAllUsers] = useState<UserDetails[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingUser, setEditingUser] = useState<UserDetails | null>(null);
  const [newTier, setNewTier] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [availableTiers, setAvailableTiers] = useState<SubscriptionTier[]>([]);
  
  // New filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [deletionFilter, setDeletionFilter] = useState<string>('active');
  
  // Bulk actions
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkImmediateDelete, setBulkImmediateDelete] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserDetails | null>(null);
  const [immediateDelete, setImmediateDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    // Apply search and filters
    const filtered = allUsers.filter((user) => {
      // Search filter
      const query = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery.trim() || 
        user.email?.toLowerCase().includes(query) ||
        user.display_name?.toLowerCase().includes(query) ||
        user.user_id?.toLowerCase().includes(query);
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || (
        (statusFilter === 'active' && user.subscription_status === 'active') ||
        (statusFilter === 'trialing' && user.subscription_status === 'trialing') ||
        (statusFilter === 'canceled' && user.subscription_status === 'canceled') ||
        (statusFilter === 'past_due' && user.subscription_status === 'past_due')
      );

      // Tier filter
      const effectiveTier = computeEffectiveTier({
        plan_tier: user.plan_tier as any,
        plan_v2: user.plan_v2 as any,
        subscription_status: user.subscription_status as any,
        manual_override: user.manual_override,
        plan_source: user.plan_source as any,
      });
      const matchesTier = tierFilter === 'all' || 
        (tierFilter === 'pro' && effectiveTier === 'pro') ||
        (tierFilter === 'free' && effectiveTier === 'free');

      // Source filter
      const matchesSource = sourceFilter === 'all' || user.plan_source === sourceFilter;

      // Deletion filter
      const matchesDeletion = 
        (deletionFilter === 'active' && !user.deleted_at && !user.deletion_scheduled) ||
        (deletionFilter === 'scheduled' && user.deletion_scheduled) ||
        (deletionFilter === 'deleted' && user.deleted_at);

      return matchesSearch && matchesStatus && matchesTier && matchesSource && matchesDeletion;
    });
    
    setFilteredUsers(filtered);
  }, [searchQuery, allUsers, statusFilter, tierFilter, sourceFilter, deletionFilter]);

  // Refresh subscription tiers when opening the edit-tier dialog
  useEffect(() => {
    const loadTiers = async () => {
      const { data } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('price_monthly', { ascending: true });
      if (data) setAvailableTiers(data as SubscriptionTier[]);
    };
    if (editingUser) loadTiers();
  }, [editingUser]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all stats in parallel
      const [
        statsRes,
        growthRes,
        activityRes,
        dbStatsRes,
        usersRes,
        tiersRes
      ] = await Promise.all([
        supabase.rpc('get_admin_stats'),
        supabase.rpc('get_user_growth_stats'),
        supabase.rpc('get_system_activity_stats'),
        supabase.rpc('get_database_stats'),
        supabase.rpc('get_all_users_admin'),
        supabase.from('subscription_tiers').select('*').order('price_monthly', { ascending: true })
      ]);

      if (statsRes.error) {
        console.error('Error fetching admin stats:', statsRes.error);
        setError('Failed to load statistics');
      } else {
        setStats(statsRes.data as unknown as AdminStats);
      }

      if (!growthRes.error && growthRes.data) {
        setGrowthStats(growthRes.data as unknown as GrowthStats);
      }

      if (!activityRes.error && activityRes.data) {
        setSystemActivity(activityRes.data as unknown as SystemActivity);
      }

      if (!dbStatsRes.error && dbStatsRes.data) {
        setDbStats(dbStatsRes.data as unknown as DatabaseStats);
      }

      if (!usersRes.error && usersRes.data) {
        const users = usersRes.data as UserDetails[];
        
        // Fetch v2 plan fields for all users
        if (users.length > 0) {
          const userIds = users.map(u => u.user_id);
          const { data: profileRows } = await supabase
            .from('profiles')
            .select('id, plan_tier, plan_v2, subscription_status, manual_override, plan_source, plan_expires_at, plan_updated_at, next_billing_at, billing_interval, deleted_at, deletion_scheduled')
            .in('id', userIds);
          
          if (profileRows) {
            // Create a map for quick lookup
            const profileMap = new Map(profileRows.map(p => [p.id, p]));
            
            // Merge v2 fields into user data
            users.forEach(user => {
              const profile = profileMap.get(user.user_id);
              if (profile) {
                user.plan_v2 = profile.plan_v2;
                user.subscription_status = profile.subscription_status;
                user.manual_override = profile.manual_override;
                user.plan_source = profile.plan_source;
                user.plan_expires_at = profile.plan_expires_at;
                user.plan_updated_at = profile.plan_updated_at;
                user.next_billing_at = profile.next_billing_at;
                user.billing_interval = profile.billing_interval;
                user.deleted_at = profile.deleted_at;
                user.deletion_scheduled = profile.deletion_scheduled;
              }
            });
          }
        }
        
        setAllUsers(users);
        setFilteredUsers(users);
      }

      if (!tiersRes.error && tiersRes.data) {
        setAvailableTiers(tiersRes.data as SubscriptionTier[]);
      }

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAllData();
  };

  const exportUsers = () => {
    const csv = [
      ['Email', 'Name', 'Tier', 'Pets', 'Roles', 'Created'],
      ...filteredUsers.map((u) => {
        const effectiveTier = computeEffectiveTier({
          plan_tier: u.plan_tier as any,
          plan_v2: u.plan_v2 as any,
          subscription_status: u.subscription_status as any,
          manual_override: u.manual_override,
          plan_source: u.plan_source as any,
        });
        return [
          u.email,
          u.display_name || 'N/A',
          effectiveTier === 'pro' ? 'Pro' : 'Free',
          u.pet_count,
          u.roles.join(', '),
          new Date(u.created_at).toLocaleDateString(),
        ];
      }),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString()}.csv`;
    a.click();
  };

  const handleEditTier = (user: UserDetails) => {
    setEditingUser(user);
    setNewTier(user.plan_tier);
  };

  const handleTierChange = (value: string) => {
    setNewTier(value);
    setShowConfirmDialog(true);
  };

  const confirmTierChange = async () => {
    if (!editingUser || !newTier) return;

    try {
      // Update the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ plan_tier: newTier })
        .eq('id', editingUser.user_id);

      if (profileError) throw profileError;

      // Also update or create user_subscriptions record for consistency
      const { data: existingSub } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', editingUser.user_id)
        .maybeSingle();

      if (existingSub) {
        // Update existing subscription
        const { error: subError } = await supabase
          .from('user_subscriptions')
          .update({ 
            tier_name: newTier,
            status: 'active'
          })
          .eq('user_id', editingUser.user_id);

        if (subError) throw subError;
      } else {
        // Create new subscription record
        const { error: insertError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: editingUser.user_id,
            tier_name: newTier,
            status: 'active'
          });

        if (insertError) throw insertError;
      }

      toast.success('Tier updated successfully! User will see changes within 60 seconds or on page refresh.');
      setShowConfirmDialog(false);
      setEditingUser(null);
      setNewTier('');
      fetchAllData(); // Refresh the data
    } catch (error) {
      console.error('Error updating tier:', error);
      toast.error('Failed to update tier');
    }
  };

  const cancelTierChange = () => {
    setShowConfirmDialog(false);
    setNewTier(editingUser?.plan_tier || '');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (tierFilter !== 'all') count++;
    if (sourceFilter !== 'all') count++;
    if (deletionFilter !== 'active') count++;
    return count;
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setTierFilter('all');
    setSourceFilter('all');
    setDeletionFilter('active');
  };

  const getExpiryDisplay = (user: UserDetails) => {
    const hasActiveSubscription = user.subscription_status === 'active';
    
    if (hasActiveSubscription) {
      const renewalDate = user.next_billing_at;
      if (renewalDate) {
        const cycle = user.billing_interval === 'year' ? 'Yearly' : user.billing_interval === 'month' ? 'Monthly' : '';
        return {
          date: new Date(renewalDate).toLocaleDateString(),
          label: cycle ? `Renews • ${cycle}` : 'Renews',
          variant: 'default' as const
        };
      }
    }
    
    if (user.plan_expires_at) {
      return {
        date: new Date(user.plan_expires_at).toLocaleDateString(),
        label: 'Expires',
        variant: 'secondary' as const
      };
    }
    
    return { date: '-', label: '', variant: 'secondary' as const };
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

  const handleDeleteUser = async (user: UserDetails) => {
    setDeleteTarget(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      setDeleting(true);
      const result = await invokeWithAuth<{ success: boolean; message: string }>('admin-delete-account', {
        body: {
          user_id: deleteTarget.user_id,
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
        fetchAllData();
        setShowDeleteDialog(false);
        setImmediateDelete(false);
        setDeleteTarget(null);
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

      fetchAllData();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Error</h2>
              <p className="text-muted-foreground mb-4">
                {error || 'Failed to load admin dashboard.'}
              </p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: Users,
      description: 'Registered users',
      color: 'text-blue-600'
    },
    {
      title: 'Total Pets',
      value: stats.total_pets,
      icon: Heart,
      description: 'Protected pets',
      color: 'text-green-600'
    },
    {
      title: 'Lost Pets',
      value: stats.lost_pets,
      icon: AlertTriangle,
      description: 'Currently missing',
      color: 'text-red-600'
    },
    {
      title: 'Vaccinations',
      value: stats.total_vaccinations,
      icon: Syringe,
      description: 'Total recorded',
      color: 'text-purple-600'
    },
    {
      title: 'Pro Users',
      value: stats.pro_users ?? stats.premium_users ?? 0,
      icon: Crown,
      description: 'Paying customers',
      color: 'text-yellow-600'
    },
    {
      title: 'New Users',
      value: stats.registrations_this_month,
      icon: TrendingUp,
      description: 'This month',
      color: 'text-indigo-600'
    },
    {
      title: 'New Pets',
      value: stats.pets_added_this_month,
      icon: Calendar,
      description: 'Added this month',
      color: 'text-pink-600'
    }
  ];

  const paidUserCount = stats.pro_users ?? stats.premium_users ?? 0;
  const conversionRate = stats.total_users > 0 ? ((paidUserCount / stats.total_users) * 100).toFixed(1) : '0';
  const averagePetsPerUser = stats.total_users > 0 ? (stats.total_pets / stats.total_users).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-background">
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Shield className="w-8 h-8 text-primary" />
                System Admin Control Center
              </h1>
              <p className="text-muted-foreground mt-1">
                Complete platform analytics and management
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => navigate('/admin/deletion-history')} variant="outline" size="sm">
                <History className="w-4 h-4 mr-2" />
                Deletion History
              </Button>
              <Button onClick={() => navigate('/admin/email-preview')} variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Email Templates
              </Button>
              <Button onClick={() => navigate('/admin/limit-audit')} variant="outline" size="sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Limit Audit
              </Button>
              <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-2">
                <Crown className="w-3 h-3 mr-1" />
                Super Admin
              </Badge>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <UserCog className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="database">
              <Database className="w-4 h-4 mr-2" />
              Database
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <Card key={index} className="bg-gradient-card border-0 shadow-medium hover:shadow-strong transition-spring">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-foreground">
                      {stat.value.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Platform Health & Species */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gradient-card border-0 shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Platform Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Conversion Rate</span>
                    <Badge variant="secondary">{conversionRate}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg Pets per User</span>
                    <Badge variant="secondary">{averagePetsPerUser}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Lost Pet Rate</span>
                    <Badge variant="secondary">
                      {stats.total_pets > 0 ? ((stats.lost_pets / stats.total_pets) * 100).toFixed(1) : '0'}%
                    </Badge>
                  </div>
                  {growthStats && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Active This Week</span>
                        <Badge variant="secondary">{growthStats.active_this_week}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Active This Month</span>
                        <Badge variant="secondary">{growthStats.active_this_month}</Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PawPrint className="w-5 h-5" />
                    Pet Species Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.pets_by_species && Object.entries(stats.pets_by_species).map(([species, count]) => (
                      <div key={species} className="flex justify-between items-center">
                        <span className="text-sm capitalize text-foreground">{species}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary rounded-full h-2 transition-all duration-300"
                              style={{ 
                                width: `${(count / stats.total_pets) * 100}%` 
                              }}
                            />
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {count}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Pending Account Deletions */}
            <PendingDeletions />

            <Card className="bg-gradient-card border-0 shadow-medium">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      User Management ({filteredUsers.length} users)
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      View and manage all registered users
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedUsers.size > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowBulkDeleteDialog(true)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected ({selectedUsers.size})
                      </Button>
                    )}
                    <Button onClick={exportUsers} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="space-y-4 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by email, name, or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Filter Row */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Filters:</span>
                    </div>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="trialing">Trialing</SelectItem>
                        <SelectItem value="canceled">Canceled</SelectItem>
                        <SelectItem value="past_due">Past Due</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={tierFilter} onValueChange={setTierFilter}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="ios">iOS</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={deletionFilter} onValueChange={setDeletionFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="deleted">Deleted</SelectItem>
                      </SelectContent>
                    </Select>

                    {getActiveFilterCount() > 0 && (
                      <>
                        <Badge variant="secondary" className="ml-2">
                          {getActiveFilterCount()} active
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="h-8 px-2"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Clear
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Users Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">
                          <Checkbox
                            checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Renewal / Expiry</TableHead>
                        <TableHead>Pets</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => {
                          const effectiveTier = computeEffectiveTier({
                            plan_tier: user.plan_tier as any,
                            plan_v2: user.plan_v2 as any,
                            subscription_status: user.subscription_status as any,
                            manual_override: user.manual_override,
                            plan_source: user.plan_source as any,
                          });
                          const expiryInfo = getExpiryDisplay(user);
                          
                          return (
                            <TableRow key={user.user_id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedUsers.has(user.user_id)}
                                  onCheckedChange={() => toggleUserSelection(user.user_id)}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{user.email}</TableCell>
                              <TableCell>{user.display_name || '-'}</TableCell>
                              <TableCell>
                                <Badge variant={effectiveTier === 'pro' ? 'secondary' : 'outline'}>
                                  {effectiveTier === 'pro' ? (
                                    <span className="flex items-center gap-1">
                                      <Crown className="w-3 h-3" />
                                      Pro
                                    </span>
                                  ) : (
                                    'Free'
                                  )}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-sm">{expiryInfo.date}</span>
                                  {expiryInfo.label && (
                                    <Badge variant={expiryInfo.variant} className="text-xs w-fit">
                                      {expiryInfo.label}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{user.pet_count}</TableCell>
                              <TableCell>
                                {user.roles.length > 0 ? (
                                  user.roles.map((role) => (
                                    <Badge key={role} variant="secondary" className="mr-1">
                                      {role}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(user.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-1 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditTier(user)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            {dbStats && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(dbStats.tables).map(([table, count]) => (
                    <Card key={table} className="bg-gradient-card border-0 shadow-medium">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground capitalize">
                          {table.replace(/_/g, ' ')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-2xl font-bold text-foreground">{count}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-gradient-card border-0 shadow-medium">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Storage Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Documents</span>
                      <Badge variant="secondary">{dbStats.storage_stats.total_documents}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Storage Used</span>
                      <Badge variant="secondary">{dbStats.storage_stats.total_size_mb.toFixed(2)} MB</Badge>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            {systemActivity && (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-card border-0 shadow-medium">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PawPrint className="w-5 h-5" />
                        Pet Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Added Today</span>
                        <Badge variant="secondary">{systemActivity.pets_activity.added_today}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Added This Week</span>
                        <Badge variant="secondary">{systemActivity.pets_activity.added_this_week}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Updated Today</span>
                        <Badge variant="secondary">{systemActivity.pets_activity.updated_today}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-card border-0 shadow-medium">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        Health Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Reminders Created Today</span>
                        <Badge variant="secondary">{systemActivity.health_activity.reminders_created_today}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Reminders Completed Today</span>
                        <Badge variant="secondary">{systemActivity.health_activity.reminders_completed_today}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Vaccinations Added Today</span>
                        <Badge variant="secondary">{systemActivity.health_activity.vaccinations_added_today}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {growthStats?.daily_signups && (
                  <Card className="bg-gradient-card border-0 shadow-medium">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        User Growth (Last 30 Days)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {growthStats.daily_signups.slice(0, 7).map((day) => (
                          <div key={day.date} className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              {new Date(day.date).toLocaleDateString()}
                            </span>
                            <Badge variant="outline">{day.count} signups</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Tier Dialog */}
      <Dialog open={!!editingUser && !showConfirmDialog} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Tier</DialogTitle>
            <DialogDescription>
              Change the subscription tier for {editingUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Tier</label>
              <p className="text-sm text-muted-foreground">
                {editingUser && computeEffectiveTier({
                  plan_tier: editingUser.plan_tier as any,
                  plan_v2: editingUser.plan_v2 as any,
                  subscription_status: editingUser.subscription_status as any,
                  manual_override: editingUser.manual_override,
                  plan_source: editingUser.plan_source as any,
                }) === 'pro' ? 'Pro' : 'Free'}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Tier</label>
              <Select value={newTier} onValueChange={handleTierChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  {availableTiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.name.toLowerCase()}>
                      {tier.name} - ${tier.price_monthly}/month
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Tier Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change {editingUser?.email}'s tier from{' '}
              <span className="font-semibold">{editingUser?.plan_tier}</span> to{' '}
              <span className="font-semibold">{newTier}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelTierChange}>
              Cancel
            </Button>
            <Button onClick={confirmTierChange}>
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteTarget?.email}?
              <div className="mt-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="immediate-delete"
                    checked={immediateDelete}
                    onCheckedChange={(checked) => setImmediateDelete(checked as boolean)}
                  />
                  <Label htmlFor="immediate-delete" className="text-sm font-normal cursor-pointer">
                    <span className="font-medium text-destructive">Immediate deletion</span>
                    <p className="text-muted-foreground">
                      Delete immediately (default: 30-day grace period)
                    </p>
                  </Label>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setImmediateDelete(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : immediateDelete ? 'Delete Immediately' : 'Schedule Deletion'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bulk Delete Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUsers.size} selected user(s)?
              <div className="mt-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="bulk-immediate-delete"
                    checked={bulkImmediateDelete}
                    onCheckedChange={(checked) => setBulkImmediateDelete(checked as boolean)}
                  />
                  <Label htmlFor="bulk-immediate-delete" className="text-sm font-normal cursor-pointer">
                    <span className="font-medium text-destructive">Immediate deletion</span>
                    <p className="text-muted-foreground">
                      Delete immediately (default: 30-day grace period)
                    </p>
                  </Label>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBulkImmediateDelete(false)}>Cancel</AlertDialogCancel>
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
};

export default AdminDashboard;
