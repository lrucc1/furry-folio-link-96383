import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Calendar, AlertCircle, ArrowLeft, Sparkles, Download, RotateCcw, Smartphone, Apple } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanV2 } from "@/hooks/usePlanV2";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { IOSPageLayout } from "@/components/ios/IOSPageLayout";
import { useIsNativeApp } from "@/hooks/useIsNativeApp";
import { isNativeApp, isIOSApp, restorePurchases } from "@/lib/appleIap";
import { toast } from "sonner";

export default function BillingSettings() {
  const [restoring, setRestoring] = useState(false);
  const { user } = useAuth();
  const { plan, planConfig, subscriptionStatus, trialEndAt, nextBillingAt, daysUntilTrialEnd, isTrialActive, usage, refresh } = usePlanV2();
  const isNative = useIsNativeApp();
  
  const isPro = plan === 'PRO';
  const hasMultiplePets = usage.pets_count > 1;
  const isOnIOS = isNativeApp() && isIOSApp();

  const handleManageAppleSubscription = () => {
    toast.info("To manage your subscription, go to Settings → Apple ID → Subscriptions on your device.");
  };

  const handleRestorePurchases = async () => {
    setRestoring(true);
    try {
      const success = await restorePurchases();
      if (success) {
        await refresh();
      }
    } finally {
      setRestoring(false);
    }
  };

  const hasActiveSubscription = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
  const isPastDue = subscriptionStatus === 'past_due';

  // Shared billing content
  const BillingContent = () => (
    <div className="space-y-6">
      {/* Web User Banner - Free Plan */}
      {!isOnIOS && plan === 'FREE' && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Plan & billing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              You're currently on <strong>PetLinkID Free</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              To upgrade to PetLinkID Pro, open the <strong>PetLinkID app on your iPhone</strong> and go to:
            </p>
            <p className="text-sm font-medium">
              Settings → Plan & billing → Upgrade to Pro
            </p>
            <p className="text-sm text-muted-foreground">
              All payments are handled securely through Apple's in-app purchase system. Once upgraded, your Pro features will also be available when you sign in on the web.
            </p>
            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-2">Don't have the app yet?</p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/downloads">
                  <Apple className="w-4 h-4 mr-2" />
                  Download from App Store
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Web User Banner - Pro Plan */}
      {!isOnIOS && plan === 'PRO' && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              Plan & billing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              You're on <strong>PetLinkID Pro</strong>. Thank you for supporting us!
            </p>
            <p className="text-sm text-muted-foreground">
              Your subscription is managed via the App Store on your iPhone. To view or change your subscription:
            </p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open <strong>Settings</strong> on your iPhone</li>
              <li>Tap your <strong>Apple ID</strong> at the top</li>
              <li>Tap <strong>Subscriptions</strong></li>
              <li>Find and tap <strong>PetLinkID</strong></li>
            </ol>
            <p className="text-xs text-muted-foreground pt-2">
              Changes may take a moment to reflect here after you update your subscription in iOS.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Trial Status Alert */}
      {isTrialActive && daysUntilTrialEnd && daysUntilTrialEnd <= 2 && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            Your Pro trial ends in {daysUntilTrialEnd} {daysUntilTrialEnd === 1 ? 'day' : 'days'}. 
            Upgrade now to keep unlimited pets, reminders, and all Pro features.
          </AlertDescription>
        </Alert>
      )}

      {isPastDue && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your payment is past due. Please update your payment method via your Apple ID settings.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Your subscription details and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-lg font-semibold">{planConfig?.name}</p>
                {isTrialActive && (
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Trial
                  </Badge>
                )}
                {hasActiveSubscription && !isTrialActive && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                )}
                {isPastDue && (
                  <Badge variant="destructive">Past Due</Badge>
                )}
              </div>
            </div>

            {plan === 'FREE' ? (
              isOnIOS ? (
                <Button asChild>
                  <Link to="/pricing">
                    Upgrade Plan
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" asChild>
                  <Link to="/pricing">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Learn to Upgrade
                  </Link>
                </Button>
              )
            ) : (
              <Button 
                onClick={handleManageAppleSubscription}
                variant="outline"
              >
                <Smartphone className="mr-2 h-4 w-4" />
                Manage via Apple
              </Button>
            )}
          </div>

          {/* Trial Info */}
          {isTrialActive && trialEndAt && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Trial ends on{' '}
                  <span className="font-medium text-foreground">
                    {trialEndAt.toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  {' '}({daysUntilTrialEnd} {daysUntilTrialEnd === 1 ? 'day' : 'days'} remaining)
                </span>
              </div>
            </div>
          )}

          {/* Billing Date */}
          {nextBillingAt && plan === 'PRO' && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  {subscriptionStatus === 'active' ? 'Renews' : 'Expires'} on{' '}
                  {nextBillingAt.toLocaleDateString('en-AU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Downgrade Warning */}
          {isPro && hasMultiplePets && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">Cannot downgrade with {usage.pets_count} pets</p>
                <p className="text-sm mb-3">
                  The Free plan allows only 1 pet. Before canceling your Pro subscription:
                </p>
                <ol className="text-sm space-y-1 list-decimal list-inside mb-3">
                  <li>Download your pet data to keep a backup</li>
                  <li>Delete {usage.pets_count - 1} pet(s) to get within the Free plan limit</li>
                  <li>Then you can cancel your subscription</li>
                </ol>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/settings/export-data">
                    <Download className="w-4 h-4 mr-2" />
                    Download Pet Data First
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* iOS Restore Purchases */}
          {isOnIOS && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Restore Purchases</h4>
              <p className="text-sm text-muted-foreground mb-3">
                If you've previously purchased a subscription on another device or reinstalled the app, 
                you can restore your purchase here.
              </p>
              <Button
                onClick={handleRestorePurchases}
                disabled={restoring}
                variant="outline"
                className="w-full"
              >
                {restoring ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore Purchases
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Apple Billing Info - Only for iOS Pro users */}
          {plan === 'PRO' && isOnIOS && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Manage Apple Subscription</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Your subscription is managed through Apple. To make changes:
              </p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Open Settings on your iPhone</li>
                <li>Tap your Apple ID at the top</li>
                <li>Tap Subscriptions</li>
                <li>Find and tap PetLinkID</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>

      {plan === 'FREE' && isOnIOS && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Upgrade to Pro</CardTitle>
            <CardDescription>
              Unlock unlimited pets, health tracking, and more
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/pricing">
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade via App Store
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // iOS Layout
  if (isNative) {
    return (
      <IOSPageLayout title="Billing" onRefresh={refresh}>
        <div className="px-4 py-6 max-w-3xl mx-auto">
          <BillingContent />
        </div>
      </IOSPageLayout>
    );
  }

  // Web Layout
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/account">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Account
              </Link>
            </Button>
            <h2 className="text-2xl font-bold">Plan & Billing</h2>
            <p className="text-muted-foreground">Manage your subscription and payment methods</p>
          </div>

          <BillingContent />
        </div>
      </main>
    </div>
  );
}
