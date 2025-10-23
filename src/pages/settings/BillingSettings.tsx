import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Calendar, AlertCircle, ExternalLink, ArrowLeft, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanV2 } from "@/hooks/usePlanV2";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { formatPrice } from "@/config/pricing";

export default function BillingSettings() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { plan, planConfig, subscriptionStatus, trialEndAt, nextBillingAt, daysUntilTrialEnd, isTrialActive } = usePlanV2();

  const handleManageBilling = async () => {
    if (!user) {
      toast.error("Please sign in to manage billing");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Open in new tab
        window.open(data.url, '_blank');
        toast.success("Opening billing portal...");
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (error: any) {
      console.error("Portal error:", error);
      toast.error(error.message || "Failed to open billing portal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasActiveSubscription = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
  const isPastDue = subscriptionStatus === 'past_due';

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
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
                Your payment is past due. Please update your payment method to continue using premium features.
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
                ) : plan === 'TRIAL' ? (
                  <Button asChild>
                    <Link to="/pricing">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Subscribe Now
                    </Link>
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

              {plan === 'PRO' && (
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
                <Button asChild className="w-full">
                  <Link to="/pricing">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start 7-Day Free Trial
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
