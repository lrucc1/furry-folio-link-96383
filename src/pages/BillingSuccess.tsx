import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { usePlanV2 } from '@/hooks/usePlanV2';
import { supabase } from '@/integrations/supabase/client';
import { isNativeApp, returnToIOSApp, isReturningFromWebCheckout } from '@/lib/iosPaymentFlow';

export default function BillingSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refresh } = usePlanV2();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      navigate('/pricing');
      return;
    }

    // Refresh plan data to get updated subscription status
    const verifySubscription = async () => {
      setVerifying(true);
      try {
        // Force a server-side sync from Stripe as a fallback in case webhooks aren't configured
        await supabase.functions.invoke('sync-subscription');
      } catch (e) {
        console.warn('sync-subscription failed (will still refresh profile):', e);
      }
      // Refresh local plan data
      await refresh();
      setVerifying(false);
    };

    verifySubscription();
  }, [searchParams, navigate, refresh]);

  // Handle iOS app deep link redirect after payment
  useEffect(() => {
    if (!verifying && isNativeApp() && isReturningFromWebCheckout()) {
      // Redirect back to iOS app after showing success message
      returnToIOSApp('/dashboard');
    }
  }, [verifying]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-primary">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {verifying ? (
                  <Loader2 className="w-16 h-16 text-primary animate-spin" />
                ) : (
                  <CheckCircle className="w-16 h-16 text-primary" />
                )}
              </div>
              <CardTitle className="text-3xl">
                {verifying ? 'Verifying Payment...' : 'Welcome to Pro!'}
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                {verifying 
                  ? 'Please wait while we confirm your subscription'
                  : isNativeApp() 
                    ? 'Your subscription has been activated. Returning to app...'
                    : 'Your subscription has been activated successfully'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!verifying && (
                <>
                  <div className="bg-muted rounded-lg p-6 space-y-3">
                    <h3 className="font-semibold">What's included in your Pro plan:</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>Unlimited pet profiles</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>Full caregiver access with read & write permissions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>Unlimited health reminders</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>200MB document storage</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>Priority support</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={() => navigate('/dashboard')}
                      className="flex-1"
                    >
                      Go to Dashboard
                    </Button>
                    <Button 
                      onClick={() => navigate('/account')}
                      variant="outline"
                      className="flex-1"
                    >
                      Manage Subscription
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
