import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Scale, Shield } from "lucide-react";

const Terms = () => {
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
              <FileText className="w-3 h-3 mr-1" />
              Terms of Service
            </Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Please read these terms carefully before using PetLinkID. By using our services, you agree to these terms.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: September 22, 2024
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Quick Summary */}
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                Terms Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold">Fair Use</h4>
                  <p className="text-sm text-muted-foreground">Use our service responsibly and legally</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold">Your Data</h4>
                  <p className="text-sm text-muted-foreground">You own your pet data, we protect it</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <Scale className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold">Victorian Law</h4>
                  <p className="text-sm text-muted-foreground">Governed by the laws of Victoria</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardContent className="prose prose-gray max-w-none p-8">
              {/* TODO: Add GDPR compliance section for EU users, CCPA section for California users */}
              <div className="bg-primary/5 p-4 rounded-lg mb-6">
                <p className="text-sm text-muted-foreground">
                  <strong>About PetLinkID:</strong> PetLinkID is owned and operated by Betametrics Pty Ltd, headquartered in Victoria, Australia. We serve pet owners worldwide. These terms are governed by the laws of Victoria, Australia, though your local consumer protection laws may also apply.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-6">
                By accessing or using PetLinkID ("we", "our", "us"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our service. These terms apply to all visitors, users, and others who access or use our service.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground mb-4">
                PetLinkID is a comprehensive pet management platform that provides:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                <li>Digital pet profiles and identification services</li>
                <li>QR code and NFC tag recovery systems</li>
                <li>Health tracking and vaccination reminders</li>
                <li>Lost pet alert and recovery assistance</li>
                <li>Integration with veterinary services and pet registries</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for maintaining the security of your account. You agree not to disclose your password to any third party and to take sole responsibility for activities that occur under your account.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">4. Acceptable Use</h2>
              <p className="text-muted-foreground mb-2">You agree not to use PetLinkID for any unlawful purpose or any purpose prohibited under this clause. You agree not to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
                <li>Use our service for any illegal activities</li>
                <li>Impersonate another person or provide false information</li>
                <li>Upload malicious code or attempt to hack our systems</li>
                <li>Spam or harass other users</li>
                <li>Violate any applicable local, state, national, or international law</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">5. Pet Information and Privacy</h2>
              <p className="text-muted-foreground mb-6">
                You retain ownership of all content and information you post about your pets. By using our service, you grant us a license to use, modify, and display this information to provide our services. We are committed to protecting your privacy in accordance with our Privacy Policy and Australian Privacy Principles.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">6. Subscriptions and Billing</h2>
              <p className="text-muted-foreground mb-4">
                Some parts of our service are offered on a subscription basis. Subscription fees are billed in advance on a recurring basis. We use secure third-party payment processors and do not store your payment information on our servers.
              </p>
              <p className="text-muted-foreground mb-6">
                You may cancel your subscription at any time. Cancellation will take effect at the end of the current billing period. No refunds are provided for partial subscription periods, except as required by Australian Consumer Law.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-6">
                While we strive to provide accurate and reliable services, PetLinkID is provided "as is" without warranties of any kind. We cannot guarantee that our service will help recover lost pets or prevent pet-related incidents. Our liability is limited to the extent permitted by Australian Consumer Law.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">8. Emergency Services</h2>
              <p className="text-muted-foreground mb-6">
                PetLinkID is not an emergency service. In case of pet emergencies, contact your veterinarian, local emergency services, or animal control authorities immediately. Do not rely solely on our platform for emergency situations.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">9. Intellectual Property</h2>
              <p className="text-muted-foreground mb-6">
                The PetLinkID service and its original content, features, and functionality are owned by Betametrics Pty Ltd and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">10. Termination</h2>
              <p className="text-muted-foreground mb-6">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the service will cease immediately. You may terminate your account at any time by contacting us.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">11. Governing Law</h2>
              <p className="text-muted-foreground mb-6">
                These Terms shall be interpreted and governed by the laws of Victoria, Australia, without regard to its conflict of law provisions. Any disputes will be resolved in the courts of Victoria, Australia. International users: Your local consumer protection laws may also apply in addition to these terms.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">12. Changes to Terms</h2>
              <p className="text-muted-foreground mb-6">
                We reserve the right to update or change our Terms of Service at any time. We will notify you of any changes by posting the new Terms of Service on this page and updating the "last updated" date. Your continued use of the service after we post any modifications constitutes acceptance of those changes.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">13. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <ul className="text-muted-foreground space-y-1">
                <li>Email: support@petlinkid.io</li>
                <li>Mail: Betametrics Pty Ltd, Melbourne, VIC 3000</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="bg-gradient-hero text-white border-0">
            <CardContent className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">
                Questions About These Terms?
              </h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Our legal team is available to clarify any aspects of our terms of service.
              </p>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/contact">
                  Contact Legal Team
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Terms;
