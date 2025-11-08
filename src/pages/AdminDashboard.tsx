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
  Mail
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PendingDeletions } from '@/components/admin/PendingDeletions';
import { Header } from '@/components/Header';
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
  stripe_price_id: string | null;
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

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(allUsers);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        allUsers.filter(
          (u) =>
            u.email?.toLowerCase().includes(query) ||
            u.display_name?.toLowerCase().includes(query) ||
            u.user_id?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, allUsers]);

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
        setAllUsers(usersRes.data as UserDetails[]);
        setFilteredUsers(usersRes.data as UserDetails[]);
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
      ...filteredUsers.map((u) => [
        u.email,
        u.display_name || 'N/A',
        u.plan_tier,
        u.pet_count,
        u.roles.join(', '),
        new Date(u.created_at).toLocaleDateString(),
      ]),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
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
        <Header />
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
      <Header />
      
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
              <Button onClick={() => navigate('/admin/email-preview')} variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Email Templates
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
                  <Button onClick={exportUsers} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by email, name, or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Pets</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.user_id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>{user.display_name || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={user.plan_tier === 'free' ? 'outline' : 'secondary'}>
                                {user.plan_tier}
                              </Badge>
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTier(user)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
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
              <p className="text-sm text-muted-foreground">{editingUser?.plan_tier}</p>
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
    </div>
  );
};

export default AdminDashboard;