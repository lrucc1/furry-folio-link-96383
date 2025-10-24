import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function SubscriptionTerms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-bold">Subscription Terms</h1>
            <Badge variant="outline">Legal</Badge>
          </div>
          <p className="text-lg text-muted-foreground">
            Terms and conditions for PetLinkID subscription services
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: January 2025
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Subscription Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Subscription Plans</h3>
                <p className="text-muted-foreground">
                  PetLinkID offers Free and Pro subscription plans. Each plan provides different features and pet limits as described on our pricing page. Prices are displayed in AUD and may vary by region.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Billing and Renewal</h3>
                <p className="text-muted-foreground">
                  Subscriptions are billed monthly or annually depending on your selected plan. Your subscription will automatically renew at the end of each billing period unless you cancel. Payment is processed through Stripe, our secure payment provider.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Free Trial</h3>
                <p className="text-muted-foreground">
                  If offered, free trials allow you to test Pro features. You won't be charged until the trial period ends. You can cancel anytime during the trial without being charged.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4. Cancellation</h3>
                <p className="text-muted-foreground">
                  You may cancel your subscription at any time through your account settings or the Stripe Customer Portal. Upon cancellation, you'll continue to have access to paid features until the end of your current billing period. No refunds are provided for partial billing periods unless required by law.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">5. Plan Changes</h3>
                <p className="text-muted-foreground">
                  You can upgrade or downgrade your plan at any time. Upgrades take effect immediately with prorated billing. Downgrades take effect at the start of your next billing cycle.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">6. Payment Failures</h3>
                <p className="text-muted-foreground">
                  If a payment fails, we'll attempt to process it again. If payment continues to fail, your subscription may be suspended or canceled. We'll notify you via email before taking any action.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">7. Price Changes</h3>
                <p className="text-muted-foreground">
                  We reserve the right to modify subscription prices. We'll provide at least 30 days notice before any price increase affects your subscription. Continued use of the service after a price change constitutes acceptance of the new price.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">8. Feature Availability</h3>
                <p className="text-muted-foreground">
                  We may add, modify, or remove features from any subscription tier. We'll make reasonable efforts to maintain feature parity within each tier and notify users of significant changes.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Questions about subscriptions or billing? Contact our support team.
              </p>
              <Button asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
