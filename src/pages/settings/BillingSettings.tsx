import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Calendar, AlertCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePlan } from "@/lib/plan/PlanContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";

export default function BillingSettings() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { tier, profile } = usePlan();

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

  const hasActiveSubscription = profile?.stripe_status === 'active' || profile?.stripe_status === 'trialing';
  const isPastDue = profile?.stripe_status === 'past_due';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Billing & Subscriptions</h2>
        <p className="text-muted-foreground">Manage your subscription and payment methods</p>
      </div>

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
                <p className="text-lg font-semibold capitalize">{tier}</p>
                {hasActiveSubscription && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                )}
                {isPastDue && (
                  <Badge variant="destructive">Past Due</Badge>
                )}
              </div>
            </div>

            {tier === 'free' ? (
              <Button asChild>
                <Link to="/pricing">
                  Upgrade Plan
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

          {profile?.stripe_current_period_end && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  {profile.stripe_status === 'active' ? 'Renews' : 'Expires'} on{' '}
                  {new Date(profile.stripe_current_period_end).toLocaleDateString('en-AU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          )}

          {tier !== 'free' && (
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

      {tier === 'free' && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Upgrade to Premium</CardTitle>
            <CardDescription>
              Unlock unlimited pets, health tracking, and more
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/pricing">
                View Plans
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
