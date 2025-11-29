import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, Crown, Sparkles, Smartphone, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanV2 } from '@/hooks/usePlanV2';
import { toast } from 'sonner';
import { PLANS, formatPrice, getYearlySavings } from '@/config/pricing';
import { isNativeApp, isIOSApp, isAppleIAPAvailable, purchasePro } from '@/lib/appleIap';

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plan, subscriptionStatus, isTrialActive, daysUntilTrialEnd, refresh } = usePlanV2();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [checkingOut, setCheckingOut] = useState(false);

  const isOnIOS = isNativeApp() && isIOSApp();
  const canUseAppleIAP = isAppleIAPAvailable();

  // Show trial button if user hasn't started trial yet (FREE with no subscription history)
  const canStartTrial = subscriptionStatus === 'none';
  // Show subscribe button if on trial or past trial
  const showSubscribe = subscriptionStatus === 'trialing' || subscriptionStatus === 'past_due' || subscriptionStatus === 'canceled';
  // Already subscribed
  const isActiveSubscriber = plan === 'PRO' && subscriptionStatus === 'active';

  const handlePurchase = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // iOS native app: use Apple IAP
    if (isOnIOS) {
      if (!canUseAppleIAP) {
        toast.error('In-app purchases are not configured. Please try again later.');
        return;
      }

      setCheckingOut(true);
      try {
        await purchasePro(billingPeriod);
        await refresh();
        toast.success('Welcome to Pro!');
        navigate('/billing-success');
      } catch (error: any) {
        // Error already handled in purchasePro
        console.error('Purchase error:', error);
      } finally {
        setCheckingOut(false);
      }
      return;
    }

    // Non-iOS: show message about iOS-only purchases
    toast.info('Upgrades are currently available via the iOS app through Apple In-App Purchases.');
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
              {isOnIOS 
                ? 'Start with a 7-day free trial of Pro via the App Store.'
                : 'Start with a 7-day free trial of Pro. Available via the iOS app.'
              }
            </p>
            
            {isTrialActive && (
              <Badge variant="secondary" className="mt-4">
                <Sparkles className="w-4 h-4 mr-1" />
                {daysUntilTrialEnd} {daysUntilTrialEnd === 1 ? 'day' : 'days'} left in your Pro trial
              </Badge>
            )}

            {/* iOS-only notice for web users */}
            {!isOnIOS && (
              <Alert className="mt-6 max-w-md mx-auto">
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  Subscriptions are available via the iOS app through Apple In-App Purchases.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Billing Period Toggle - Only show for iOS */}
          {isOnIOS && (
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
          )}

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
                    <span>QR Code Pet Profile</span>
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
                    <span>Store Vaccination Certificates & Medical Records</span>
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
                  isActiveSubscriber ? (
                    <Button 
                      onClick={() => navigate('/account')}
                      variant="outline"
                      size="lg"
                      className="w-full"
                      data-testid="manage-subscription-btn"
                    >
                      Manage Subscription
                    </Button>
                  ) : isOnIOS && (canStartTrial || showSubscribe) ? (
                    <Button 
                      onClick={handlePurchase}
                      disabled={checkingOut}
                      size="lg"
                      className="w-full"
                      data-testid="start-trial-cta"
                    >
                      {checkingOut ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : canStartTrial ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Start 7-Day Free Trial
                        </>
                      ) : (
                        'Subscribe Now'
                      )}
                    </Button>
                  ) : !isOnIOS ? (
                    <Button 
                      onClick={() => toast.info('Please use the iOS app to upgrade to Pro.')}
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Use iOS App to Upgrade
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => navigate('/account')}
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      View Account
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
                  {isOnIOS 
                    ? '7-day free trial • Cancel anytime in App Store'
                    : '7-day free trial • Available via iOS app'
                  }
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
