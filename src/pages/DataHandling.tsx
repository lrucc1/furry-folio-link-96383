import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Database, FileText, Lock } from "lucide-react";

const DataHandling = () => {
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
          
          {/* TODO: Add GDPR compliance section for EU users, CCPA section for California users */}
          <div className="text-center mb-12">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <Shield className="w-3 h-3 mr-1" />
              Privacy & Data Handling
            </Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Data Handling & Security
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              How we handle, protect, and manage your data. PetLinkID is an Australian company committed to privacy standards that meet or exceed Australian and international requirements.
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
                <Database className="w-5 h-5 text-primary" />
                Data Handling at a Glance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold">APPs Compliant</h4>
                  <p className="text-sm text-muted-foreground">Australian Privacy Principles aligned</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <Database className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold">Daily Backups</h4>
                  <p className="text-sm text-muted-foreground">Automated secure backups</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <Lock className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold">Encrypted</h4>
                  <p className="text-sm text-muted-foreground">Data encrypted at rest & in transit</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold">30-Day Deletion</h4>
                  <p className="text-sm text-muted-foreground">Account data removed on request</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardContent className="prose prose-gray max-w-none p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Data Storage & Location</h2>
              <p className="text-muted-foreground mb-4">
                All primary data is stored on secure Australian cloud infrastructure (AWS Sydney region or equivalent) to ensure fast access and compliance with local data sovereignty requirements.
              </p>
              <p className="text-muted-foreground mb-6">
                Certain service providers (payment processing, analytics) may process data outside Australia. In such cases, we ensure they meet Australian Privacy Principles standards through contractual safeguards and security certifications.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">Backup & Recovery</h2>
              <p className="text-muted-foreground mb-4">
                <strong>Automated Backups:</strong> Daily automated backups of all user data, stored in secure, geographically redundant locations.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>Retention Period:</strong> Backups are retained for 90 days and then securely purged.
              </p>
              <p className="text-muted-foreground mb-6">
                <strong>Disaster Recovery:</strong> We maintain comprehensive disaster recovery procedures with a target recovery time of less than 24 hours for critical services.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">Data Retention Policy</h2>
              <div className="text-muted-foreground mb-6">
                <p className="mb-2"><strong>Active Accounts:</strong></p>
                <ul className="list-disc list-inside mb-4 ml-4">
                  <li>Data retained for the duration of account activity</li>
                  <li>Regular updates processed in real-time</li>
                  <li>Access available 24/7 through your account</li>
                </ul>

                <p className="mb-2"><strong>Inactive Accounts:</strong></p>
                <ul className="list-disc list-inside mb-4 ml-4">
                  <li>Accounts with no login for 3+ years may be flagged for review</li>
                  <li>90-day notice provided before any data deletion</li>
                  <li>Option to reactivate and retain data</li>
                </ul>

                <p className="mb-2"><strong>Deleted Accounts:</strong></p>
                <ul className="list-disc list-inside mb-4 ml-4">
                  <li>Personal data removed within 30 days of deletion request</li>
                  <li>Purged from backups within 90 days</li>
                  <li>Anonymised transaction records may be retained for compliance (7 years)</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-4">Security Measures</h2>
              <div className="text-muted-foreground mb-6">
                <p className="mb-2"><strong>Technical Safeguards:</strong></p>
                <ul className="list-disc list-inside mb-4 ml-4">
                  <li>AES-256 encryption for data at rest</li>
                  <li>TLS 1.3+ encryption for data in transit</li>
                  <li>Multi-factor authentication available for all accounts</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Automated threat detection and monitoring</li>
                </ul>

                <p className="mb-2"><strong>Access Controls:</strong></p>
                <ul className="list-disc list-inside mb-4 ml-4">
                  <li>Role-based access control (RBAC) for staff</li>
                  <li>Principle of least privilege enforced</li>
                  <li>Comprehensive audit logging of all access</li>
                  <li>Regular access reviews and recertification</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-4">Data Breach Response</h2>
              <p className="text-muted-foreground mb-4">
                In the unlikely event of a data breach that is likely to result in serious harm, we will:
              </p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-2 mb-6 ml-4">
                <li>Contain and assess the breach within 24 hours</li>
                <li>Notify the Office of the Australian Information Commissioner (OAIC) within 72 hours if required</li>
                <li>Notify affected users as soon as practicable with clear information about:
                  <ul className="list-disc list-inside ml-6 mt-2">
                    <li>What data was involved</li>
                    <li>What steps we're taking</li>
                    <li>What steps you should take</li>
                    <li>How to contact us for support</li>
                  </ul>
                </li>
                <li>Provide ongoing updates as the situation evolves</li>
                <li>Conduct a full post-incident review and implement preventative measures</li>
              </ol>

              <h2 className="text-2xl font-bold text-foreground mb-4">Third-Party Service Providers</h2>
              <p className="text-muted-foreground mb-4">
                We carefully vet all service providers and require them to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6 ml-4">
                <li>Comply with Australian Privacy Principles where applicable</li>
                <li>Maintain security standards equivalent to or exceeding ours</li>
                <li>Process data only for specified purposes</li>
                <li>Delete data when no longer needed</li>
                <li>Undergo regular security audits</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">Your Data Rights</h2>
              <p className="text-muted-foreground mb-2">Under Australian privacy law, you have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal data (provided within 30 days)</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your account and personal data</li>
                <li><strong>Portability:</strong> Export your data in machine-readable format (JSON)</li>
                <li><strong>Object:</strong> Object to certain types of data processing</li>
                <li><strong>Complaint:</strong> Lodge a complaint with us or the OAIC</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">Data Export & Portability</h2>
              <p className="text-muted-foreground mb-4">
                You can export your data at any time from your Account Settings:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6 ml-4">
                <li>Format: JSON (machine-readable, portable)</li>
                <li>Includes: Pet profiles, health records, documents, vaccination history</li>
                <li>Processing time: Instant download for most accounts</li>
                <li>Frequency: Unlimited exports available</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">Contact & Complaints</h2>
              <p className="text-muted-foreground mb-4">
                For questions, concerns, or to exercise your data rights, contact us:
              </p>
              <ul className="text-muted-foreground space-y-1 mb-4 ml-4">
                <li><strong>Email:</strong> <a href="mailto:support@petlinkid.io" className="underline">support@petlinkid.io</a></li>
                <li><strong>Mail:</strong> PetLinkID, Betametrics Pty Ltd, Melbourne, VIC 3000</li>
                <li><strong>Response time:</strong> Within 5 business days for acknowledgment; 30 days for resolution</li>
              </ul>
              <p className="text-muted-foreground mb-6">
                If you're not satisfied with our response, you can lodge a complaint with the Office of the Australian Information Commissioner (OAIC) at <a href="https://www.oaic.gov.au" className="underline" target="_blank" rel="noopener noreferrer">www.oaic.gov.au</a>
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">Regular Reviews & Updates</h2>
              <p className="text-muted-foreground">
                We review our data handling practices annually and update this page as needed. Material changes will be communicated to active users via email. Your continued use of our services constitutes acceptance of updated practices.
              </p>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="bg-gradient-hero text-white border-0">
            <CardContent className="text-center py-8">
              <Shield className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">
                Questions About Data Handling?
              </h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Our privacy team is here to answer questions about how we protect and manage your data.
              </p>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/contact">
                  Contact Privacy Team
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DataHandling;
