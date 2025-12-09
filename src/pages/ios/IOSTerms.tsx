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
import { ChevronLeft, FileText, Scale, Shield, Mail } from 'lucide-react';

export default function IOSTerms() {
  const navigate = useNavigate();

  const headerLeft = (
    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-10 w-10 p-0">
      <ChevronLeft className="w-6 h-6" />
    </Button>
  );

  return (
    <IOSPageLayout title="Terms of Service" headerRight={headerLeft}>
      <div className="pb-8">
        {/* Header */}
        <div className="px-4 mb-6">
          <p className="text-sm text-muted-foreground text-center">
            Last updated: September 22, 2024
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
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs font-medium">Fair Use</p>
                <p className="text-[10px] text-muted-foreground">Use responsibly</p>
              </div>
              <div className="text-center p-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs font-medium">Your Data</p>
                <p className="text-[10px] text-muted-foreground">You own it</p>
              </div>
              <div className="text-center p-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Scale className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs font-medium">Aussie Law</p>
                <p className="text-[10px] text-muted-foreground">NSW jurisdiction</p>
              </div>
            </div>
          </MobileCard>
        </div>

        {/* About */}
        <div className="px-4 mb-6">
          <MobileCard>
            <p className="text-sm text-muted-foreground">
              PetLinkID is owned and operated by Betametrics Pty Ltd, headquartered in Sydney. These terms are governed by Australian law, though your local consumer protection laws may also apply.
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
              <AccordionItem value="acceptance" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  1. Acceptance of Terms
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p>
                    By accessing or using PetLinkID, you agree to be bound by these Terms of Service. If you disagree with any part, you may not access our service.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="service" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  2. Description of Service
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p className="mb-2">PetLinkID provides:</p>
                  <ul className="space-y-1">
                    <li>• Digital pet profiles and ID</li>
                    <li>• QR code and NFC tag recovery</li>
                    <li>• Health tracking and reminders</li>
                    <li>• Lost pet alert assistance</li>
                    <li>• Vet and registry integration</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="accounts" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  3. User Accounts
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p>
                    You must provide accurate, complete information when creating an account. You are responsible for safeguarding your password and for all activities under your account.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="acceptable" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  4. Acceptable Use
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p className="mb-2">You agree not to:</p>
                  <ul className="space-y-1">
                    <li>• Use our service for illegal activities</li>
                    <li>• Impersonate others or provide false info</li>
                    <li>• Upload malicious code or hack systems</li>
                    <li>• Spam or harass other users</li>
                    <li>• Violate any applicable laws</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="privacy" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  5. Pet Information & Privacy
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p>
                    You retain ownership of all content about your pets. By using our service, you grant us a license to use, modify, and display this information to provide our services.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="billing" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  6. Subscriptions & Billing
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p className="mb-2">
                    Subscription fees are billed in advance on a recurring basis. You may cancel anytime, taking effect at the end of the current period.
                  </p>
                  <p>
                    No refunds for partial periods, except as required by Australian Consumer Law.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="liability" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  7. Limitation of Liability
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p>
                    PetLinkID is provided "as is" without warranties. We cannot guarantee recovery of lost pets. Our liability is limited to the extent permitted by Australian Consumer Law.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="emergency" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  8. Emergency Services
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p>
                    PetLinkID is NOT an emergency service. In emergencies, contact your vet, local emergency services, or animal control immediately.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ip" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  9. Intellectual Property
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p>
                    The PetLinkID service and its original content are owned by Betametrics Pty Ltd and protected by international intellectual property laws.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="termination" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  10. Termination
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p>
                    We may terminate or suspend your account immediately for any breach of Terms. You may terminate your account at any time by contacting us.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="law">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  11. Governing Law
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p>
                    These Terms are governed by the laws of New South Wales, Australia. Disputes will be resolved in NSW courts. International users: your local consumer protection laws may also apply.
                  </p>
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
            <p className="text-sm text-muted-foreground mb-3">
              Contact us at legal@petlinkid.com
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate('/contact')}>
              Contact Legal Team
            </Button>
          </div>
        </MobileCard>
      </div>
    </IOSPageLayout>
  );
}
