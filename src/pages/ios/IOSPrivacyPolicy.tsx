import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IOSPageLayout } from '@/components/ios/IOSPageLayout';
import { MobileCard } from '@/components/ios/MobileCard';
import { Button } from '@/components/ui/button';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ChevronLeft, Shield, Lock, Eye, FileText, Mail } from 'lucide-react';

export default function IOSPrivacyPolicy() {
  const navigate = useNavigate();

  const headerLeft = (
    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-10 w-10 p-0">
      <ChevronLeft className="w-6 h-6" />
    </Button>
  );

  return (
    <IOSPageLayout title="Privacy Policy" headerLeft={headerLeft}>
      <div className="pb-8">
        {/* Header */}
        <div className="px-4 mb-6">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Last updated: 14 October 2025
          </p>
          <MobileCard>
            <p className="text-sm text-muted-foreground text-center py-2">
              PetLinkID is owned and operated by <strong className="text-foreground">Betametrics Pty Ltd</strong>, headquartered in Victoria, Australia.
            </p>
          </MobileCard>
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
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs font-medium">Secure Data</p>
                <p className="text-[10px] text-muted-foreground">Encrypted & protected</p>
              </div>
              <div className="text-center p-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs font-medium">No Selling</p>
                <p className="text-[10px] text-muted-foreground">We never sell data</p>
              </div>
              <div className="text-center p-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs font-medium">Your Control</p>
                <p className="text-[10px] text-muted-foreground">You own your data</p>
              </div>
            </div>
          </MobileCard>
        </div>

        {/* Detailed Sections */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
            Full Policy
          </h3>
          <MobileCard className="p-0">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="collect" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  Information We Collect
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p className="mb-3">
                    <strong className="text-foreground">Personal Information:</strong> When you create an account, we collect your name, email address, phone number, and location.
                  </p>
                  <p className="mb-3">
                    <strong className="text-foreground">Pet Information:</strong> Details about your pets including name, species, breed, age, photos, medical information, and microchip details.
                  </p>
                  <p>
                    <strong className="text-foreground">Usage Data:</strong> Information about how you use our app, including pages visited and device information.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="use" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  How We Use Your Information
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li>• To provide pet management services</li>
                    <li>• To facilitate lost pet recovery</li>
                    <li>• To send vaccination and health reminders</li>
                    <li>• To communicate about your account</li>
                    <li>• To improve our app and features</li>
                    <li>• To comply with legal obligations</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="sharing" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  Information Sharing
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p className="mb-3">We do not sell your personal information. We may share your information:</p>
                  <ul className="space-y-2">
                    <li>• With vets and pet services you connect with</li>
                    <li>• With shelters when your pet is lost</li>
                    <li>• With law enforcement when required</li>
                    <li>• With service providers under confidentiality agreements</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="overseas" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  Data Location
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p className="mb-3">Some providers may store data outside Australia:</p>
                  <ul className="space-y-2">
                    <li>• Hosting & Database: Australia/Asia-Pacific</li>
                    <li>• Payments: Apple In-App Purchases</li>
                  </ul>
                  <p className="mt-3">We ensure providers comply with Australian Privacy Principles.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="retention" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  Retention & Deletion
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p>
                    We retain data while your account is active. Upon deletion, personal data is removed within 30 days and purged from backups within 90 days.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="rights" className="border-b border-border/50">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  Your Rights
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p className="mb-3">Under Australian privacy law, you can:</p>
                  <ul className="space-y-2">
                    <li>• Access and review your information</li>
                    <li>• Correct inaccurate information</li>
                    <li>• Request deletion of your data</li>
                    <li>• Opt-out of marketing communications</li>
                    <li>• Request a copy in portable format</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="security">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                  Data Security
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p>
                    We use industry-standard security including encryption, secure servers, and regular audits. However, no internet transmission is 100% secure.
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
            <p className="text-sm text-muted-foreground mb-2">
              Contact Betametrics Pty Ltd
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              support@petlinkid.io
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate('/contact')}>
              Contact Us
            </Button>
          </div>
        </MobileCard>
      </div>
    </IOSPageLayout>
  );
}
