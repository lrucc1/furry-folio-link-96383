import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Calendar, AlertCircle, ExternalLink, ArrowLeft, Sparkles, Download, RotateCcw, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanV2 } from "@/hooks/usePlanV2";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { isNativeApp, isIOSApp, restorePurchases } from "@/lib/appleIap";

export default function BillingSettings() {
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const { user } = useAuth();
  const { plan, planConfig, subscriptionStatus, trialEndAt, nextBillingAt, daysUntilTrialEnd, isTrialActive, usage, refresh } = usePlanV2();
  
  const isPro = plan === 'PRO';
  const hasMultiplePets = usage.pets_count > 1;
  const isOnIOS = isNativeApp() && isIOSApp();

  const handleManageBilling = async () => {
    if (!user) {
      toast.error("Please sign in to manage billing");
      return;
    }

    // For iOS users with Apple IAP subscriptions
    if (isOnIOS) {
      toast.info("To manage your subscription, go to Settings → Apple ID → Subscriptions on your device.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        console.error("Portal error:", error);
        toast.error("Failed to open billing portal. Please try again.");
        return;
      }

      if (data?.error) {
        console.error("Portal error:", data.error);
        toast.error(data.error);
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success("Opening billing portal...");
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (error: any) {
      console.error("Portal error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
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
            <h2 className="text-2xl font-bold">Billing & Subscriptions</h2>
            <p className="text-muted-foreground">Manage your subscription and payment methods</p>
          </div>

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
                Your payment is past due. Please update your payment method to continue using paid features.
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
                  <Button asChild>
                    <Link to="/pricing">
                      Upgrade Plan
                    </Link>
                  </Button>
                ) : plan === 'PRO' ? (
                  isOnIOS ? (
                    <Button 
                      onClick={handleManageBilling}
                      variant="outline"
                    >
                      <Smartphone className="mr-2 h-4 w-4" />
                      Manage via Apple
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleManageBilling} 
                      disabled={loading}
                      variant="outline"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Opening...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Manage Billing
                        </>
                      )}
                    </Button>
                  )
                ) : (
                  <Button 
                    onClick={handleManageBilling} 
                    disabled={loading}
                    variant="outline"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Opening...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Manage Billing
                      </>
                    )}
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

              {/* Billing Portal Info - Only for non-iOS */}
              {plan === 'PRO' && !isOnIOS && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Billing Portal</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use the Stripe Customer Portal to:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Update payment method</li>
                    <li>View billing history and invoices</li>
                    <li>Upgrade or downgrade your plan</li>
                    <li>Cancel your subscription</li>
                  </ul>
                </div>
              )}

              {/* Apple Billing Info - Only for iOS */}
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

          {plan === 'FREE' && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>Upgrade to Pro</CardTitle>
                <CardDescription>
                  Unlock unlimited pets, health tracking, and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isOnIOS ? (
                  <Button asChild className="w-full">
                    <Link to="/pricing">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Upgrade via App Store
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild className="w-full">
                      <Link to="/pricing">
                        <Sparkles className="w-4 h-4 mr-2" />
                        View Upgrade Options
                      </Link>
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Upgrades are currently available via the iOS app
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
