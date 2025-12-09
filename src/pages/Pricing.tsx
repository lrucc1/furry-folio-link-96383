import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Smartphone, Loader2, Apple } from 'lucide-react';
import { IOSPageLayout } from '@/components/ios/IOSPageLayout';
import { FreePlanCard, ProPlanCard, BillingToggle } from '@/components/PricingCards';
import { useIsNativeApp } from '@/hooks/useIsNativeApp';
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
  const isNative = useIsNativeApp();

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

  // Shared pricing content
  const PricingContent = () => (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Simple plans for every pet family</h1>
        <p className="text-lg text-muted-foreground mb-2">
          Start free in minutes. Upgrade anytime via the iOS app.
        </p>
        {!isNative && (
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            All prices in AUD • Secure Apple In-App Purchases
          </p>
        )}
        
        {isTrialActive && (
          <Badge variant="secondary" className="mt-4">
            <Sparkles className="w-4 h-4 mr-1" />
            {daysUntilTrialEnd} {daysUntilTrialEnd === 1 ? 'day' : 'days'} left in your Pro trial
          </Badge>
        )}

        {/* iOS-only notice for web users */}
        {!isOnIOS && !isNative && (
          <Alert className="mt-6 max-w-lg mx-auto bg-muted/50 border-border/50">
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              Subscriptions are available via the iOS app through Apple In-App Purchases.
              <Button variant="link" className="h-auto p-0 ml-1" onClick={scrollToHowToUpgrade}>
                Learn how →
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Billing Period Toggle - Only show for iOS */}
      {isOnIOS && (
        <div className="mb-8">
          <BillingToggle 
            billingPeriod={billingPeriod} 
            onToggle={setBillingPeriod} 
          />
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-12">
        <FreePlanCard 
          isCurrentPlan={plan === 'FREE'}
          showButton={true}
          onAction={!user ? undefined : undefined}
        />
        
        <ProPlanCard 
          isCurrentPlan={plan === 'PRO' && isActiveSubscriber}
          showButton={true}
          isOnIOS={isOnIOS}
          billingPeriod={billingPeriod}
          onAction={isOnIOS ? handlePurchase : scrollToHowToUpgrade}
          checkingOut={checkingOut}
          canStartTrial={canStartTrial}
          showSubscribe={showSubscribe}
          isLoggedIn={!!user}
        />
      </div>


      {/* How to Upgrade Section - for web users */}
      {!isOnIOS && !isNative && (
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
  );

  // iOS Layout
  if (isNative) {
    return (
      <IOSPageLayout title="Plans">
        <div className="px-4 py-6">
          <PricingContent />
        </div>
      </IOSPageLayout>
    );
  }

  // Web Layout - use same PricingContent component for consistency
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-12">
        <PricingContent />
      </main>
    </div>
  );
}
