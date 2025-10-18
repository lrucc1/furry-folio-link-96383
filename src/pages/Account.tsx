import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/lib/plan/PlanContext';
import { TierFeatures } from '@/config/tierFeatures';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Crown, Users, FileText, Settings, Download, Trash2, Star, Calendar, CreditCard, Receipt, ExternalLink, Phone } from 'lucide-react';
import { au } from '@/lib/auEnglish';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { z } from 'zod';

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

interface Invoice {
  id: string;
  number: string | null;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: string;
  created: number;
  period_start: number;
  period_end: number;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
}

const phoneSchema = z.string().trim().regex(/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number').min(8, 'Phone number too short').max(20, 'Phone number too long').optional().or(z.literal(''));

export default function Account() {
  const { user, signOut } = useAuth();
  const { tier, loading: planLoading } = usePlan();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [storageUsedMB, setStorageUsedMB] = useState<number>(0);
  const [loadingStorage, setLoadingStorage] = useState(false);
  const [managingSubscription, setManagingSubscription] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [profileData, setProfileData] = useState({ full_name: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    checkSubscription();
    calculateStorageUsage();
    fetchProfile();
  }, [user, navigate]);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      console.log('Subscription data:', data);
      setSubscription(data);
      
      // Fetch invoices if user has a subscription
      if (data?.subscribed) {
        console.log('Fetching invoices...');
        await fetchInvoices();
      } else {
        console.log('No active subscription, skipping invoice fetch');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast.error('Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      console.log('Calling get-invoices function...');
      const { data, error } = await supabase.functions.invoke('get-invoices');
      console.log('Invoice response:', { data, error });
      if (error) throw error;
      setInvoices(data?.invoices || []);
      console.log('Invoices set:', data?.invoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoice history');
    } finally {
      setLoadingInvoices(false);
    }
  };

  const calculateStorageUsage = async () => {
    setLoadingStorage(true);
    try {
      // Get total file size from pet_documents
      const { data: documents, error } = await supabase
        .from('pet_documents')
        .select('file_size')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      const totalBytes = documents?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0;
      const totalMB = totalBytes / (1024 * 1024);
      
      setStorageUsedMB(parseFloat(totalMB.toFixed(2)));
    } catch (error) {
      console.error('Error calculating storage:', error);
    } finally {
      setLoadingStorage(false);
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

  const getTierName = (tierKey: string) => {
    return tierKey === 'family' ? au('Family') : tierKey === 'premium' ? au('Premium') : au('Free');
  };

  const getTierPrice = (tierKey: string) => {
    if (tierKey === 'free') return '$0';
    if (tierKey === 'premium') return '$7.99';
    if (tierKey === 'family') return '$12.99';
    return '$0';
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

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          phone: data.phone || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    // Validate phone number
    try {
      phoneSchema.parse(profileData.phone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name.trim(),
          phone: profileData.phone.trim()
        })
        .eq('id', user?.id);
      
      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading || planLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const maxPets = TierFeatures[tier].maxPets as number;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{au('Account Settings')}</h1>

          <Tabs defaultValue="subscription" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="subscription">
                <Crown className="w-4 h-4 mr-2" />
                {au('Subscription')}
              </TabsTrigger>
              <TabsTrigger value="profile">
                <Settings className="w-4 h-4 mr-2" />
                {au('Profile')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="subscription" className="space-y-6">
              {/* Current Plan Card */}
              <Card className={`p-6 ${
                tier === 'family' 
                  ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800' 
                  : tier === 'premium' 
                  ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800' 
                  : ''
              }`}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">{getTierName(tier)}</h2>
                      <Badge className={
                        tier === 'family' 
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-0' 
                          : tier === 'premium' 
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0' 
                          : 'bg-muted text-muted-foreground'
                      }>
                        {tier === 'family' && <Crown className="w-3 h-3 mr-1" />}
                        {tier === 'premium' && <Star className="w-3 h-3 mr-1" />}
                        {au('Current Plan')}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      {maxPets === -1 ? au('Unlimited pets') : au(`Up to ${maxPets} ${maxPets === 1 ? 'pet' : 'pets'}`)}
                    </p>
                  </div>
                </div>

                {/* Subscription Details */}
                {subscription?.subscribed && subscription?.subscription_end && (
                  <div className="grid md:grid-cols-2 gap-4 p-4 bg-background/50 rounded-lg mb-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{au('Next Payment')}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(subscription.subscription_end).toLocaleDateString('en-AU', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{au('Amount')}</p>
                        <p className="text-sm text-muted-foreground">
                          {getTierPrice(tier)} AUD / {au('month')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {subscription?.subscribed ? (
                    <Button
                      onClick={handleManageSubscription}
                      disabled={managingSubscription}
                      variant="outline"
                      className="flex-1"
                    >
                      {managingSubscription ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {au('Loading...')}
                        </>
                      ) : (
                        au('Manage Subscription')
                      )}
                    </Button>
                  ) : (
                    <Button onClick={() => navigate('/pricing')} className="flex-1">
                      <Crown className="w-4 h-4 mr-2" />
                      {au('Upgrade to Premium')}
                    </Button>
                  )}
                </div>
              </Card>

              {/* Invoice History */}
              {subscription?.subscribed && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Receipt className="w-5 h-5" />
                      {au('Invoice History')}
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchInvoices}
                      disabled={loadingInvoices}
                    >
                      {loadingInvoices ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        au('Refresh')
                      )}
                    </Button>
                  </div>
                  
                  {loadingInvoices ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : invoices.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{au('Date')}</TableHead>
                            <TableHead>{au('Invoice #')}</TableHead>
                            <TableHead>{au('Amount')}</TableHead>
                            <TableHead>{au('Status')}</TableHead>
                            <TableHead className="text-right">{au('Actions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell>
                                {new Date(invoice.created * 1000).toLocaleDateString('en-AU', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </TableCell>
                              <TableCell className="font-medium">
                                {invoice.number || invoice.id.slice(0, 8)}
                              </TableCell>
                              <TableCell>
                                ${(invoice.amount_paid / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                                  className={invoice.status === 'paid' ? 'bg-green-500' : ''}
                                >
                                  {invoice.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {invoice.hosted_invoice_url && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(invoice.hosted_invoice_url!, '_blank')}
                                  >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    {au('View')}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      {au('No invoices found')}
                    </p>
                  )}
                </Card>
              )}

              {(tier === 'premium' || tier === 'family') && (
                <>
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {au('Family Sharing')}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      {au('Share access to your pets with family members')}
                    </p>
                    <Button variant="outline" onClick={() => navigate('/dashboard')}>
                      {au('View My Pets')}
                    </Button>
                  </Card>

                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {au('Document Storage')}
                    </h2>
                    <p className="text-muted-foreground">
                      {au('Storage used')}: {loadingStorage ? (
                        <Loader2 className="w-4 h-4 inline animate-spin ml-2" />
                      ) : (
                        `${storageUsedMB} MB / ${tier === 'family' ? '200' : '50'} MB`
                      )}
                    </p>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">{au('Profile Information')}</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">{au('Email')}</Label>
                    <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="full_name">{au('Full Name')}</Label>
                    <Input
                      id="full_name"
                      type="text"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      placeholder="Enter your full name"
                      maxLength={100}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This will be shown to people who find your lost pet
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {au('Phone Number')}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+61 4XX XXX XXX"
                      maxLength={20}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This will be displayed when your pet is marked as lost
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={savingProfile}
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {au('Saving...')}
                        </>
                      ) : (
                        au('Save Profile')
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">{au('Account Actions')}</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">{au('Sign Out')}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {au('Sign out of your account on this device')}
                    </p>
                    <Button variant="outline" onClick={handleSignOut}>
                      {au('Sign Out')}
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">{au('Data & Privacy')}</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">{au('Export Your Data')}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {au('Download a copy of all your data in JSON format')}
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleExportData}
                      disabled={exportingData}
                    >
                      {exportingData ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {au('Exporting...')}
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          {au('Download My Data')}
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium mb-2 text-destructive">{au('Delete Account')}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {au('Permanently delete your account and all associated data. This action cannot be undone.')}
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={deletingAccount}>
                          {deletingAccount ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {au('Deleting...')}
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              {au('Delete My Account')}
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{au('Are you absolutely sure?')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {au('This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including all pet profiles, health records, and documents.')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{au('Cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {au('Yes, delete my account')}
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
