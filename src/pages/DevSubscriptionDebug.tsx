import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";

export default function DevSubscriptionDebug() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [webhookEvents, setWebhookEvents] = useState<any[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);

  const loadProfile = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Profile load error:', error);
      toast.error('Failed to load profile');
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const loadWebhookEvents = async () => {
    const { data } = await supabase
      .from('stripe_webhook_events')
      .select('*')
      .order('received_at', { ascending: false })
      .limit(10);
    
    setWebhookEvents(data || []);
  };

  useEffect(() => {
    loadProfile();
    loadWebhookEvents();
    
    // Subscribe to profile changes
    const channel = supabase
      .channel(`profile-debug-${user?.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user?.id}`
        },
        () => {
          console.log('Profile updated via realtime!');
          loadProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleStartCheckout = async () => {
    setCheckingOut(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No auth session');
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      
      if (error) throw error;
      
      if (data?.url) {
        const topWindow = window.top ?? window;
        topWindow.location.href = data.url as string;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout');
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const envStatus = {
    supabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Debug Panel</h1>
          <p className="text-muted-foreground">Development testing for Stripe integration</p>
        </div>
        <Button onClick={() => { loadProfile(); loadWebhookEvents(); }} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh All
        </Button>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current User</CardTitle>
          <CardDescription>Authenticated user information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">User ID</div>
              <div className="font-mono text-sm">{user?.id}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Email</div>
              <div className="font-mono text-sm">{user?.email}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Status */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Status</CardTitle>
          <CardDescription>Check if required environment variables are present</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            {envStatus.supabaseUrl ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
            <span className="text-sm">VITE_SUPABASE_URL</span>
          </div>
          <div className="flex items-center gap-2">
            {envStatus.supabaseKey ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
            <span className="text-sm">VITE_SUPABASE_PUBLISHABLE_KEY</span>
          </div>
          <div className="bg-muted p-3 rounded-md mt-4">
            <p className="text-xs text-muted-foreground">
              Note: Stripe keys are server-side only and won't show here. Check edge function logs if checkout fails.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Data */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Data</CardTitle>
          <CardDescription>Current subscription state in database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Plan V2</div>
              <Badge variant={profile?.plan_v2 === 'PRO' ? 'default' : 'secondary'}>
                {profile?.plan_v2 || 'FREE'}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Subscription Status</div>
              <Badge variant={profile?.subscription_status === 'active' ? 'default' : 'secondary'}>
                {profile?.subscription_status || 'none'}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Stripe Status</div>
              <div className="text-sm">{profile?.stripe_status || 'none'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Stripe Customer ID</div>
              <div className="font-mono text-xs">{profile?.stripe_customer_id || 'none'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Subscription ID</div>
              <div className="font-mono text-xs">{profile?.stripe_subscription_id || 'none'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Next Billing</div>
              <div className="text-xs">{profile?.next_billing_at ? new Date(profile.next_billing_at).toLocaleDateString() : 'none'}</div>
            </div>
          </div>
          
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium mb-2">Raw Profile JSON</summary>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>

      {/* Checkout Test */}
      <Card>
        <CardHeader>
          <CardTitle>Test Checkout Flow</CardTitle>
          <CardDescription>Start a test payment to verify the integration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleStartCheckout} 
            disabled={checkingOut}
            size="lg"
            className="w-full"
          >
            {checkingOut ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Opening Stripe Checkout...
              </>
            ) : (
              'Start Test Checkout'
            )}
          </Button>
          <div className="bg-muted p-4 rounded-md space-y-2">
            <p className="text-sm font-medium">Test Card Details:</p>
            <p className="text-xs text-muted-foreground">Card: 4242 4242 4242 4242</p>
            <p className="text-xs text-muted-foreground">Expiry: Any future date</p>
            <p className="text-xs text-muted-foreground">CVC: Any 3 digits</p>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Webhook Events</CardTitle>
          <CardDescription>Last 10 events received from Stripe</CardDescription>
        </CardHeader>
        <CardContent>
          {webhookEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No webhook events yet. Complete a test checkout to see events.
            </div>
          ) : (
            <div className="space-y-2">
              {webhookEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant={event.processed ? 'default' : 'secondary'}>
                      {event.event_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.received_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    Event ID: {event.event_id}
                  </div>
                  {event.processed && (
                    <div className="text-xs text-green-600">
                      ✓ Processed at {new Date(event.processed_at).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="text-yellow-900 dark:text-yellow-100">⚠️ Webhook Setup Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
          <p><strong>This page will work fully once you configure the Stripe webhook:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Go to Stripe Dashboard → Developers → Webhooks</li>
            <li>Click "Add endpoint"</li>
            <li>URL: <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">https://yyuvupjbvjpbouxuzdye.supabase.co/functions/v1/stripe-webhook</code></li>
            <li>Events: Select "checkout.session.completed", "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"</li>
            <li>The webhook secret (whsec_...) is already configured in this project</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
