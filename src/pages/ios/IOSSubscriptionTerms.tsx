import { useNavigate } from 'react-router-dom';
import { IOSPageLayout } from '@/components/ios/IOSPageLayout';
import { MobileCard } from '@/components/ios/MobileCard';
import { Button } from '@/components/ui/button';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ChevronLeft, Apple, Crown, Scale, Mail, ExternalLink } from 'lucide-react';

export default function IOSSubscriptionTerms() {
  const navigate = useNavigate();

  const headerLeft = (
    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-10 w-10 p-0">
      <ChevronLeft className="w-6 h-6" />
    </Button>
  );

  return (
    <IOSPageLayout title="Subscription Terms" headerLeft={headerLeft}>
      <div className="pb-8">
        {/* Header */}
        <div className="px-4 mb-6">
          <p className="text-sm text-muted-foreground text-center">
            Last updated: February 2026
          </p>
        </div>

        {/* Quick Overview */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
            At a Glance
          </h3>
          <MobileCard>
            <div className="grid grid-cols-3 gap-3 py-2">
              <div className="text-center p-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Apple className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs font-medium">iOS Only</p>
                <p className="text-[10px] text-muted-foreground">Apple In-App Purchase</p>
              </div>
              <div className="text-center p-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs font-medium">Auto-Renew</p>
                <p className="text-[10px] text-muted-foreground">Cancel anytime</p>
              </div>
              <div className="text-center p-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Scale className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs font-medium">Aussie Law</p>
                <p className="text-[10px] text-muted-foreground">VIC jurisdiction</p>
              </div>
            </div>
          </MobileCard>
        </div>

        {/* About */}
        <div className="px-4 mb-6">
          <MobileCard>
            <p className="text-sm text-muted-foreground">
              PetLinkID is owned and operated by Betametrics Pty Ltd, headquartered in Victoria, Australia. These subscription terms are governed by the laws of Victoria, Australia.
            </p>
          </MobileCard>
        </div>

        {/* Detailed Sections */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
            Full Terms
          </h3>
          <MobileCard className="p-0">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="plans" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  1. Subscription Plans
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p className="mb-2">PetLinkID offers a free tier and a Pro subscription:</p>
                  <ul className="space-y-1">
                    <li>• <strong>Free:</strong> 1 pet profile, basic features</li>
                    <li>• <strong>Pro Monthly:</strong> A$3.99/month</li>
                    <li>• <strong>Pro Yearly:</strong> A$39.99/year (save 17%)</li>
                  </ul>
                  <p className="mt-2">Pro includes unlimited pets, document storage, family sharing, and lost pet mode.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="billing" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  2. Billing & Renewal
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p className="mb-2">
                    <strong>Payment will be charged to your Apple ID account at the confirmation of purchase.</strong> Pro subscriptions are available exclusively through the iOS app.
                  </p>
                  <p>
                    Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current billing period. Your Apple ID account will be charged for renewal within 24 hours prior to the end of the current period.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="trial" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  3. Free Trial
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p>
                    New subscribers may be eligible for a <strong>7-day free trial</strong>. If you don't cancel before the trial ends, you'll be charged the subscription price. Any unused portion of a free trial will be forfeited when you purchase a subscription.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="cancellation" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  4. Cancellation
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p className="mb-2">
                    You may cancel your subscription at any time through your iPhone's Settings → Apple ID → Subscriptions. You can also cancel directly from the App Store.
                  </p>
                  <p>
                    Cancellation takes effect at the end of your current billing period. You'll continue to have Pro access until then. No partial refunds are provided, except as required by Australian Consumer Law.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="plan-changes" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  5. Plan Changes
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p>
                    You can upgrade or downgrade your subscription through the iOS app. Apple handles all billing adjustments, including prorated credits when switching between monthly and yearly plans.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment-failures" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  6. Payment Failures
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p>
                    If a payment fails, Apple will attempt to process it again. You may receive notifications from Apple about payment issues. Please ensure your Apple ID payment method is up to date. Your subscription access may be suspended until payment is resolved.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="price-changes" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  7. Price Changes
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p>
                    We may change subscription prices. Apple will notify you of any price increases before they take effect. Your continued use after price changes constitutes acceptance. You can cancel if you don't agree with the new pricing.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ios-only" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  8. iOS-Only Subscriptions
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p className="mb-2">
                    Pro subscriptions are only available through the iOS app. Web users can sign in with their account to access Pro features after subscribing via iOS.
                  </p>
                  <p className="mb-2">
                    Your subscription is tied to your PetLinkID account, not your device. Sign in on any device to access your Pro features.
                  </p>
                  <p>
                    You can restore previous purchases at any time from the Plans screen in the app.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="apple-terms">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  9. Apple's Terms
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p className="mb-2">
                    Your subscription is also subject to Apple's terms and conditions for in-app purchases. For issues with billing, payment methods, or refund requests, please contact Apple Support.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.open('https://support.apple.com/en-au/HT204084', '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    Apple Subscription Help
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </MobileCard>
        </div>

        {/* Contact */}
        <MobileCard className="mx-4">
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Questions?</h3>
            <p className="text-xs text-muted-foreground mb-1">
              Betametrics Pty Ltd
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Email: support@petlinkid.io
            </p>
            <div className="space-y-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/contact')} className="w-full">
                Contact Support
              </Button>
              <p className="text-[10px] text-muted-foreground">
                For billing issues, please contact Apple Support
              </p>
            </div>
          </div>
        </MobileCard>
      </div>
    </IOSPageLayout>
  );
}
