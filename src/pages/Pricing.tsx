import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, Crown, Sparkles, Smartphone, Loader2, Apple, ExternalLink } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanV2 } from '@/hooks/usePlanV2';
import { toast } from 'sonner';
import { PLANS, formatPrice, getYearlySavings } from '@/config/pricing';
import { isNativeApp, isIOSApp, isAppleIAPAvailable, purchasePro } from '@/lib/appleIap';

const APP_STORE_URL = import.meta.env.VITE_APP_STORE_URL || '#';

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

  const scrollToHowToUpgrade = () => {
    document.getElementById('how-to-upgrade')?.scrollIntoView({ behavior: 'smooth' });
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
            <h1 className="text-4xl font-bold mb-4">Simple plans for every pet family</h1>
            <p className="text-xl text-muted-foreground mb-4">
              Start free in minutes. Upgrade any time from the PetLinkID iOS app using secure Apple in-app purchases.
            </p>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              PetLinkID is designed to be iOS-first, with a simple web experience to support QR tag scans and quick access to your pet's profile.
              All plan upgrades and billing are handled safely through the App Store on your iPhone.
            </p>
            
            {isTrialActive && (
              <Badge variant="secondary" className="mt-4">
                <Sparkles className="w-4 h-4 mr-1" />
                {daysUntilTrialEnd} {daysUntilTrialEnd === 1 ? 'day' : 'days'} left in your Pro trial
              </Badge>
            )}

            {/* iOS-only notice for web users */}
            {!isOnIOS && (
              <Alert className="mt-6 max-w-lg mx-auto">
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  Subscriptions are available via the iOS app through Apple In-App Purchases.
                  <Button variant="link" className="h-auto p-0 ml-1" onClick={scrollToHowToUpgrade}>
                    Learn how to upgrade →
                  </Button>
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
                <CardDescription>Perfect for trying PetLinkID with your first pet.</CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold">Always free</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Create your PetLinkID account</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Add 1 pet profile</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Link QR tags to your pet</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Lost & found profile page when someone scans the tag</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Basic contact details and notes</span>
                  </div>
                </div>

                {!user ? (
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/auth">Get started free</Link>
                  </Button>
                ) : plan === 'FREE' ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : null}
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
                    PetLinkID Pro
                  </CardTitle>
                  {plan === 'PRO' && (
                    <Badge>Current Plan</Badge>
                  )}
                </div>
                <CardDescription>Full features for pet families</CardDescription>
                <div className="mt-4">
                  {isOnIOS ? (
                    <>
                      <div className="text-4xl font-bold">{formatPrice(price)}</div>
                      <div className="text-muted-foreground">
                        per {billingPeriod === 'monthly' ? 'month' : 'year'}
                      </div>
                      {billingPeriod === 'yearly' && (
                        <div className="text-sm text-primary mt-1">
                          Just {formatPrice(price / 12)}/month
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-bold">Pricing shown in the iOS app</div>
                      <div className="text-muted-foreground text-sm mt-1">
                        Monthly and yearly options available
                      </div>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm font-medium">🔓 Unlock extra capacity and features:</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>More pets and QR tags</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Extra contact options for emergencies</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Richer notes and attachments (vet, behaviour, medications, etc.)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Priority support for lost-pet incidents</span>
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
                      onClick={scrollToHowToUpgrade}
                      variant="default"
                      size="lg"
                      className="w-full"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Upgrade in the iOS app
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
                    Sign Up to Get Started
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

          {/* How to Upgrade Section - for web users */}
          {!isOnIOS && (
            <Card id="how-to-upgrade" className="mb-12 scroll-mt-8 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  How to upgrade to Pro
                </CardTitle>
                <CardDescription>
                  All payments are processed securely by Apple. You can manage or cancel your subscription any time from your iPhone's Settings → Subscriptions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">1</span>
                    <span>Download the PetLinkID app on your iPhone from the App Store.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">2</span>
                    <span>Sign in or create your account using the same email.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">3</span>
                    <span>Go to <strong>Settings → Plan & billing</strong>, then choose a Pro plan.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">4</span>
                    <span>Confirm your subscription using your Apple ID.</span>
                  </li>
                </ol>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">
                    Don't have the app yet?
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="/downloads">
                      <Apple className="w-4 h-4 mr-2" />
                      Download from App Store
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* FAQ or Additional Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>All prices are charged in AUD (Australian Dollars).</p>
            <p className="mt-1">Your card provider may convert this to your local currency.</p>
            <p className="mt-2">Need help choosing? <a href="/contact" className="text-primary hover:underline">Contact us</a></p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}