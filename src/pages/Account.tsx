import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Crown, Users, FileText, Settings, Download, Trash2 } from 'lucide-react';

const SUBSCRIPTION_TIERS = {
  free: { name: 'Free', productId: null },
  premium: { name: 'Premium', productId: 'prod_TBUW3WogN0dEtQ' },
  family: { name: 'Family', productId: 'prod_TBUX7Ubgxwr3co' },
};

interface SubscriptionStatus {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
}

export default function Account() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [managingSubscription, setManagingSubscription] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    checkSubscription();
  }, [user, navigate]);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast.error('Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setManagingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open subscription management');
    } finally {
      setManagingSubscription(false);
    }
  };

  const getCurrentTier = () => {
    if (!subscription?.subscribed) return 'free';
    const tier = Object.entries(SUBSCRIPTION_TIERS).find(
      ([, value]) => value.productId === subscription.product_id
    );
    return tier ? tier[0] : 'free';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleExportData = async () => {
    setExportingData(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-data');
      if (error) throw error;
      
      // Create blob and download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'petlinkid-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setExportingData(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const { error } = await supabase.functions.invoke('delete-account');
      if (error) throw error;
      
      toast.success('Your account has been deleted');
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const currentTier = getCurrentTier();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

          <Tabs defaultValue="subscription" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="subscription">
                <Crown className="w-4 h-4 mr-2" />
                Subscription
              </TabsTrigger>
              <TabsTrigger value="profile">
                <Settings className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="subscription" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-2xl font-bold">
                      {SUBSCRIPTION_TIERS[currentTier as keyof typeof SUBSCRIPTION_TIERS].name}
                    </p>
                    {subscription?.subscription_end && (
                      <p className="text-sm text-muted-foreground">
                        Renews on {new Date(subscription.subscription_end).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {subscription?.subscribed && (
                    <Button
                      onClick={handleManageSubscription}
                      disabled={managingSubscription}
                    >
                      {managingSubscription ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Manage Subscription'
                      )}
                    </Button>
                  )}
                </div>
                {!subscription?.subscribed && (
                  <Button onClick={() => navigate('/pricing')} className="w-full">
                    Upgrade to Premium
                  </Button>
                )}
              </Card>

              {(currentTier === 'premium' || currentTier === 'family') && (
                <>
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Family Sharing
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Share access to your pets with family members
                    </p>
                    <Button variant="outline" onClick={() => navigate('/dashboard')}>
                      View My Pets
                    </Button>
                  </Card>

                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Document Storage
                    </h2>
                    <p className="text-muted-foreground">
                      Storage used: 0 MB / {currentTier === 'family' ? '200' : '50'} MB
                    </p>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                  <Button variant="destructive" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Data & Privacy</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Export Your Data</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Download a copy of all your data in JSON format
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleExportData}
                      disabled={exportingData}
                    >
                      {exportingData ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download My Data
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium mb-2 text-destructive">Delete Account</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={deletingAccount}>
                          {deletingAccount ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete My Account
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove all your data from our servers, including all pet profiles,
                            health records, and documents.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Yes, delete my account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
