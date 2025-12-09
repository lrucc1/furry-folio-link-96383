import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Smartphone, Scale } from "lucide-react";
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
          <p className="text-sm text-muted-foreground mt-2">
            PetLinkID is owned and operated by Betametrics Pty Ltd, headquartered in Victoria, Australia. 
            These subscription terms are governed by the laws of Victoria, Australia.
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
                  PetLinkID offers Free and Pro subscription plans. Each plan provides different features and pet limits as described on our pricing page. Prices are displayed in AUD (A$3.99/month or A$39.99/year for Pro).
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Billing and Renewal</h3>
                <p className="text-muted-foreground">
                  Pro subscriptions are available exclusively through the iOS app. Payment is processed securely through Apple In-App Purchase using your Apple ID. Subscriptions are billed monthly or annually depending on your selected plan and will automatically renew at the end of each billing period unless you cancel.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Free Trial</h3>
                <p className="text-muted-foreground">
                  If offered, free trials allow you to test Pro features. You won't be charged until the trial period ends. You can cancel anytime during the trial without being charged through your iPhone's Settings.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4. Cancellation</h3>
                <p className="text-muted-foreground">
                  You may cancel your subscription at any time through your iPhone's Settings → Apple ID → Subscriptions. You can also cancel directly from the App Store. Upon cancellation, you'll continue to have access to paid features until the end of your current billing period. No refunds are provided for partial billing periods unless required by law.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">5. Plan Changes</h3>
                <p className="text-muted-foreground">
                  You can upgrade or downgrade your plan through the iOS app. Apple handles all billing adjustments, including prorated charges for upgrades and timing of downgrades. Changes are processed according to Apple's subscription management policies.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">6. Payment Failures</h3>
                <p className="text-muted-foreground">
                  If a payment fails, Apple will attempt to process it again. You may receive notifications from Apple about payment issues. Please ensure your Apple ID payment method is up to date to avoid service interruption.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">7. Price Changes</h3>
                <p className="text-muted-foreground">
                  We reserve the right to modify subscription prices. Apple will notify you of any price changes and you will have the opportunity to accept or decline the new pricing. Price changes will be communicated according to Apple's policies.
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
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                iOS-Only Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Pro subscriptions are currently only available through the PetLinkID iOS app via Apple In-App Purchase. Web users can sign in with their account to access Pro features after subscribing via iOS.
              </p>
              <p className="text-muted-foreground">
                All subscription management, including cancellation, renewal, and payment updates, is handled through your Apple ID settings on your iPhone or iPad.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Apple's Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Subscriptions purchased through the App Store are also subject to Apple's terms and conditions, including their{" "}
                <a 
                  href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Licensed Application End User License Agreement
                </a>{" "}
                and App Store policies.
              </p>
              <p className="text-muted-foreground">
                For detailed information about managing your App Store subscriptions, visit{" "}
                <a 
                  href="https://support.apple.com/en-au/HT202039" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Apple's subscription management guide
                </a>.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold">Betametrics Pty Ltd</p>
                <p className="text-muted-foreground">Victoria, Australia</p>
              </div>
              <p className="text-muted-foreground">
                Questions about subscriptions? Contact our support team.
              </p>
              <p className="text-muted-foreground">
                Privacy Officer: <a href="mailto:privacy@petlinkid.com" className="text-primary hover:underline">privacy@petlinkid.com</a>
              </p>
              <p className="text-muted-foreground text-sm">
                For billing issues with Apple In-App Purchase, please contact{" "}
                <a 
                  href="https://support.apple.com/contact" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Apple Support
                </a>{" "}
                directly through the App Store.
              </p>
              <Button asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                These terms are governed by the laws of Victoria, Australia.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
