import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function RefundsPolicy() {
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
            <h1 className="text-4xl font-bold">Refunds & Consumer Guarantees</h1>
            <Badge variant="outline">Legal</Badge>
          </div>
          <p className="text-lg text-muted-foreground">
            Our refund policy and Australian Consumer Law guarantees
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: January 2026
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-muted bg-muted/20">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">
                <strong>About PetLinkID:</strong> PetLinkID is based in Australia and serves customers worldwide. Australian Consumer Law guarantees apply to Australian customers. International customers may have additional rights under their local consumer protection laws.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Australian Consumer Law
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                As an Australian business, PetLinkID complies with the Australian Consumer Law (ACL), which provides automatic consumer guarantees for services. These guarantees apply to Australian customers and cannot be excluded.
              </p>
              <div>
                <h3 className="font-semibold mb-2">Your Rights Under ACL</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Services must be provided with acceptable care and skill</li>
                  <li>Services must be fit for the purpose you told us about</li>
                  <li>Services must be delivered within a reasonable time</li>
                  <li>You're entitled to a remedy if these guarantees aren't met</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>PetLinkID Refund Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Free Tier</h3>
                <p className="text-muted-foreground">
                  Our free tier is provided at no cost and no refunds apply. You may discontinue use at any time.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Paid Subscriptions</h3>
                <p className="text-muted-foreground">
                  <strong>Standard Policy:</strong> Subscriptions are non-refundable once the billing period has begun. If you cancel, you'll retain access until the end of your current billing period, but no refund will be provided for unused time.
                </p>
                <p className="text-muted-foreground mt-2">
                  <strong>Exceptional Circumstances:</strong> We may provide refunds on a case-by-case basis for:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                  <li>Technical issues preventing service use for an extended period</li>
                  <li>Billing errors or duplicate charges</li>
                  <li>Service failures due to our error</li>
                  <li>Other circumstances where required by Australian Consumer Law</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Free Trial Refunds</h3>
                <p className="text-muted-foreground">
                  If you cancel during a free trial period, you will not be charged. No refund is necessary as no payment has been collected.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4. How to Request a Refund</h3>
                <p className="text-muted-foreground">
                  To request a refund, please contact our support team through the contact page. Include:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                  <li>Your account email address</li>
                  <li>Reason for the refund request</li>
                  <li>Details of the issue (if applicable)</li>
                  <li>Preferred resolution</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  We'll review your request within 5 business days and respond via email.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">5. Refund Processing</h3>
                <p className="text-muted-foreground">
                  Approved refunds are processed to the original payment method within 5-10 business days. Processing times may vary depending on your financial institution.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">6. Chargebacks</h3>
                <p className="text-muted-foreground">
                  Please contact us before initiating a chargeback. Chargebacks may result in immediate account suspension and we reserve the right to dispute fraudulent claims.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consumer Guarantees</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Major Failures</h3>
                <p className="text-muted-foreground">
                  If our service has a major failure (e.g., doesn't work as advertised, is unsafe, or cannot be fixed within a reasonable time), you may:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                  <li>Cancel your subscription and receive a refund for unused services</li>
                  <li>Receive compensation for any losses resulting from the failure</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Minor Issues</h3>
                <p className="text-muted-foreground">
                  For minor issues, we'll work to resolve them within a reasonable time. If we can't fix the issue, you may be entitled to a partial refund.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Claiming Guarantees</h3>
                <p className="text-muted-foreground">
                  To make a claim under consumer guarantees, contact us through our support channels. We'll assess your claim and respond within a reasonable timeframe.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Have questions about refunds or need to make a claim? Our support team is here to help.
              </p>
              <div className="flex gap-3">
                <Button asChild>
                  <Link to="/contact">Contact Support</Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://www.accc.gov.au/consumers/consumer-rights-guarantees" target="_blank" rel="noopener noreferrer">
                    Learn More About ACL
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
