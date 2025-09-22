import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';

interface AdminStats {
  total_users: number;
  total_pets: number;
  lost_pets: number;
  total_vaccinations: number;
  premium_users: number;
  pets_by_species: Record<string, number>;
  registrations_this_month: number;
  pets_added_this_month: number;
}

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.rpc('get_admin_stats');
        
        if (error) {
          console.error('Error fetching admin stats:', error);
          setError('Failed to load statistics');
        } else {
          setStats(data as unknown as AdminStats);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleMakeAdmin = async () => {
    const userEmail = prompt('Enter your email to confirm admin access:');
    if (!userEmail) return;

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        alert('Not authenticated');
        return;
      }

      if (userData.user.email !== userEmail) {
        alert('Email does not match your account');
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert([
          {
            user_id: userData.user.id,
            role: 'admin'
          }
        ]);

      if (error && !error.message.includes('duplicate')) {
        console.error('Error making admin:', error);
        alert('Failed to grant admin access');
      } else {
        alert('Admin access granted! Please refresh the page.');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error in admin creation:', error);
      alert('Failed to grant admin access');
    }
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
              <h2 className="text-xl font-semibold mb-2">Access Required</h2>
              <p className="text-muted-foreground mb-4">
                {error || 'You need admin access to view this dashboard.'}
              </p>
              <Button onClick={handleMakeAdmin} variant="outline">
                Grant Admin Access
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
      title: 'Premium Users',
      value: stats.premium_users,
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

  const conversionRate = stats.total_users > 0 ? ((stats.premium_users / stats.total_users) * 100).toFixed(1) : '0';
  const averagePetsPerUser = stats.total_users > 0 ? (stats.total_pets / stats.total_users).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Platform analytics and management
              </p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Settings className="w-3 h-3 mr-1" />
              Super Admin
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Platform Health */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
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

        {/* Quick Actions */}
        <Card className="bg-gradient-card border-0 shadow-medium">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Common administrative tasks
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Stats
              </Button>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;