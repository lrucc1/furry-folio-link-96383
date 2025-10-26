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

  const handleStartTrial = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setCheckingOut(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          tier: 'PRO',
          billingPeriod: billingPeriod,
          withTrial: true
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      }
    } catch (error: any) {
      console.error('Trial checkout error:', error);
      toast.error(error.message || 'Failed to start trial checkout');
    } finally {
      setCheckingOut(false);
    }
  };

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
        body: { priceId }, // No trial
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

  const savings = getYearlySavings();
  const price = billingPeriod === 'monthly' 
    ? PLANS.PRO.price_monthly_aud 
    : PLANS.PRO.price_yearly_aud;

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
                    <span>1 Pet Profile</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>1 Read-only Caregiver</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>2 Active Health Reminders</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>50MB Document Storage</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Basic Support</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className={`relative ${plan === 'PRO' ? 'border-primary' : ''}`}>
              {plan !== 'PRO' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Crown className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}
              <CardHeader className="pt-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    Pro
                  </CardTitle>
                  {plan === 'PRO' && (
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
                    <span>Unlimited Pet Profiles</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Full Caregiver Access (read & write)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Unlimited Health Reminders</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>200MB Document Storage</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Data Export Capability</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Priority Support</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>7-Day Free Trial</span>
                  </div>
                </div>

                {user ? (
                  plan === 'FREE' ? (
                    <Button 
                      onClick={handleStartTrial}
                      disabled={checkingOut}
                      size="lg"
                      className="w-full"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {checkingOut ? 'Processing...' : 'Start 7-Day Free Trial'}
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
