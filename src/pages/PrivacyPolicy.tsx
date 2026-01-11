import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Eye, Lock, FileText } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          
          <div className="text-center mb-12">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <Shield className="w-3 h-3 mr-1" />
              Privacy Policy
            </Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your privacy matters to us. Learn how we collect, use, and protect your personal information.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: January 2026
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Quick Overview */}
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Privacy at a Glance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <Lock className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold">Secure Data</h4>
                  <p className="text-sm text-muted-foreground">Your information is encrypted and protected</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold">No Selling</h4>
                  <p className="text-sm text-muted-foreground">We never sell your personal data</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold">Your Rights</h4>
                  <p className="text-sm text-muted-foreground">You control your data and privacy</p>
                </div>
              </div>
          </CardContent>
          </Card>

          {/* Company Info */}
          <div className="bg-primary/5 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>About PetLinkID:</strong> PetLinkID is owned and operated by Betametrics Pty Ltd, headquartered in Victoria, Australia. We serve pet owners worldwide.
            </p>
          </div>

          {/* Main Content */}
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardContent className="prose prose-gray max-w-none p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
              
              <h3 className="text-lg font-semibold text-foreground mb-2">Personal Information</h3>
              <p className="text-muted-foreground mb-4">
                When you create an account, we collect information such as your name, email address, phone number, and location. This information helps us provide our services and contact you about your pets.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-2">Pet Information</h3>
              <p className="text-muted-foreground mb-4">
                We collect details about your pets including their name, species, breed, age, photos, medical information, and microchip details. This information is essential for pet identification and recovery services.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-2">Usage Data</h3>
              <p className="text-muted-foreground mb-6">
                We automatically collect information about how you use our app, including pages visited, features used, and device information. This helps us improve our services and user experience.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                <li>To provide and maintain our pet management services</li>
                <li>To facilitate lost pet recovery and reunification</li>
                <li>To send vaccination and health reminders</li>
                <li>To communicate with you about your account and services</li>
                <li>To improve our app and develop new features</li>
                <li>To comply with legal obligations</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">Overseas disclosures & data location</h2>
              <p className="text-muted-foreground mb-4">
                Some of our technology providers (for example, cloud hosting, analytics or payments) may store or process information outside Australia. Where this occurs, we take reasonable steps to ensure those providers handle your information in a way that is consistent with the Australian Privacy Principles (APPs). Our current core providers include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-4 ml-4">
                <li>Application hosting & database: Supabase (region: Australia/Asia-Pacific)</li>
                <li>Payments: Apple In-App Purchases (processed by Apple Inc.)</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                We will update this page if our providers materially change.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">Retention & deletion</h2>
              <p className="text-muted-foreground mb-4">
                We retain your account data while your account is active and for a reasonable period thereafter to comply with legal obligations or resolve disputes. Upon account deletion (which you can initiate at any time from your account settings), we remove your personal data within 30 days and purge it from backups within 90 days. Anonymized or aggregated data that cannot identify you may be retained for analytics purposes.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">Access, correction and deletion</h2>
              <p className="text-muted-foreground mb-4">
                You can request access to the personal information we hold about you, ask us to correct it if it is inaccurate, or request deletion of your account. To do so, please contact us using the details below. For security, we may need to verify your identity before actioning your request.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">Contact & complaints</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions or concerns about privacy, contact support at <a href="mailto:support@petlinkid.io" className="underline">support@petlinkid.io</a>. If you are not satisfied with our response, you may lodge a complaint with the Office of the Australian Information Commissioner (OAIC).
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">3. Information Sharing</h2>
              <p className="text-muted-foreground mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                <li>With veterinary clinics and pet services you choose to connect with</li>
                <li>With animal shelters and rescue organizations when your pet is lost</li>
                <li>With law enforcement when required by law</li>
                <li>With service providers who help us operate our platform (under strict confidentiality agreements)</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">4. Data Security</h2>
              <p className="text-muted-foreground mb-6">
                We implement industry-standard security measures to protect your information, including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">5. Your Rights</h2>
              <p className="text-muted-foreground mb-2">Under Australian privacy law, you have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                <li>Access and review your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your account and data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request a copy of your data in a portable format</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">6. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about this Privacy Policy or wish to exercise your rights, please{' '}
                <Link to="/contact" className="text-primary underline hover:text-primary/80">
                  contact us via our contact form
                </Link>
                .
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">7. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any significant changes by email or through our app. Your continued use of our services after such changes constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="bg-gradient-hero text-white border-0">
            <CardContent className="text-center py-8">
              <Shield className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">
                Questions About Privacy?
              </h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Our team is here to help you understand how we protect your information.
              </p>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/contact">
                  Contact Our Team
                </Link>
              </Button>
            </CardContent>
          </Card>
        {/* TODO: Add GDPR section for EU users, CCPA section for California users */}
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
