import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanV2 } from '@/hooks/usePlanV2';
import { toast } from 'sonner';
import { PLANS, formatPrice, getYearlySavings } from '@/config/pricing';
import { getPriceId, isCheckoutAvailable } from '@/lib/stripeConfig';

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plan, isTrialActive, daysUntilTrialEnd } = usePlanV2();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [checkingOut, setCheckingOut] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if checkout is available for this billing period
    if (!isCheckoutAvailable(billingPeriod)) {
      toast.error('Checkout is not configured. Please contact support or configure Stripe price IDs in project settings.');
      return;
    }

    setCheckingOut(true);
    
    try {
      const priceId = getPriceId('PRO', billingPeriod);

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout');
    } finally {
      setCheckingOut(false);
    }
  };

  const savings = getYearlySavings('PREMIUM');
  const price = billingPeriod === 'monthly' 
    ? PLANS.PREMIUM.price_monthly_aud 
    : PLANS.PREMIUM.price_yearly_aud;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-muted-foreground">
              Start with a 7-day free trial of Pro. No credit card required.
            </p>
            
            {isTrialActive && (
              <Badge variant="secondary" className="mt-4">
                <Sparkles className="w-4 h-4 mr-1" />
                {daysUntilTrialEnd} {daysUntilTrialEnd === 1 ? 'day' : 'days'} left in your Pro trial
              </Badge>
            )}
          </div>

          {/* Billing Period Toggle - Only show for Pro */}
          <div className="flex items-center justify-center gap-2 p-1 bg-muted rounded-lg max-w-xs mx-auto mb-8">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors relative ${
                billingPeriod === 'yearly'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                Save {savings}%
              </span>
            </button>
          </div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Free Plan */}
            <Card className={plan === 'FREE' ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Free</CardTitle>
                  {plan === 'FREE' && (
                    <Badge>Current Plan</Badge>
                  )}
                </div>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold">A$0</div>
                  <div className="text-muted-foreground">Forever free</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>1 pet profile</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>QR tag linking & lost/found contact</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>1 caregiver (view-only)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>2 active reminders</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{PLANS.FREE.entitlements.docs_storage_mb}MB document storage</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold">
                RECOMMENDED
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    Premium
                  </CardTitle>
                  {(plan === 'PREMIUM' || plan === 'FAMILY') && (
                    <Badge>Current Plan</Badge>
                  )}
                </div>
                <CardDescription>Full features for pet families</CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold">{formatPrice(price)}</div>
                  <div className="text-muted-foreground">
                    per {billingPeriod === 'monthly' ? 'month' : 'year'}
                  </div>
                  {billingPeriod === 'yearly' && (
                    <div className="text-sm text-primary mt-1">
                      Just {formatPrice(price / 12)}/month
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="font-semibold">Unlimited pet profiles</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="font-semibold">Full caregiver access (read & write)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="font-semibold">Unlimited health reminders</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Large document vault ({PLANS.PREMIUM.entitlements.docs_storage_mb}MB)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Data export</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Priority support</span>
                  </div>
                </div>

                {user ? (
                  plan === 'FREE' ? (
                    <Button 
                      onClick={handleSubscribe}
                      disabled={checkingOut || !isCheckoutAvailable(billingPeriod)}
                      size="lg"
                      className="w-full"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {checkingOut ? 'Processing...' : !isCheckoutAvailable(billingPeriod) ? 'Checkout Unavailable' : 'Start 7-Day Free Trial'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => navigate('/account')}
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      Manage Subscription
                    </Button>
                  )
                ) : (
                  <Button 
                    onClick={() => navigate('/auth')}
                    size="lg"
                    className="w-full"
                  >
                    Sign Up for Free Trial
                  </Button>
                )}

                <p className="text-xs text-center text-muted-foreground">
                  7-day free trial • No credit card required • Cancel anytime
                </p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ or Additional Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>All prices in Australian Dollars (AUD)</p>
            <p className="mt-2">Need help choosing? <a href="/contact" className="text-primary hover:underline">Contact us</a></p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
