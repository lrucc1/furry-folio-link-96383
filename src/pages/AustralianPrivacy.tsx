import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Flag, FileText, CheckCircle } from "lucide-react";

const AustralianPrivacy = () => {
  const principles = [
    {
      number: "1",
      title: "Open and transparent management of personal information",
      description: "We clearly explain how we collect, use, and protect your pet's information."
    },
    {
      number: "2", 
      title: "Anonymity and pseudonymity",
      description: "You can interact with our service anonymously where practicable."
    },
    {
      number: "3",
      title: "Collection of solicited personal information", 
      description: "We only collect information that's necessary for our pet services."
    },
    {
      number: "4",
      title: "Dealing with unsolicited personal information",
      description: "We promptly delete any information we receive that we shouldn't have."
    },
    {
      number: "5",
      title: "Notification of the collection of personal information",
      description: "We tell you when we're collecting your information and why."
    }
  ];

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
              <Flag className="w-3 h-3 mr-1" />
              Australian Privacy
            </Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Australian Privacy Compliance
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              PetLinkID is committed to protecting your privacy in accordance with Australian Privacy Principles (APPs) under the Privacy Act 1988.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: September 22, 2024
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Compliance Overview */}
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Our Commitment to Australian Privacy Laws
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                As an Australian company, PetLinkID is bound by the Privacy Act 1988 and the Australian Privacy Principles (APPs). We take our obligations seriously and have implemented comprehensive privacy protections that go above and beyond legal requirements.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                  <h4 className="font-semibold">Fully Compliant</h4>
                  <p className="text-sm text-muted-foreground">All 13 Australian Privacy Principles</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <Flag className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold">Australian Owned</h4>
                  <p className="text-sm text-muted-foreground">Data processed within Australia</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold">Regular Audits</h4>
                  <p className="text-sm text-muted-foreground">Independent privacy assessments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Principles */}
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader>
              <CardTitle>Key Australian Privacy Principles We Follow</CardTitle>
              <p className="text-muted-foreground">
                Here's how we comply with the most relevant Australian Privacy Principles for our pet service:
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {principles.map((principle) => (
                  <div key={principle.number} className="flex gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0">
                      {principle.number}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{principle.title}</h4>
                      <p className="text-muted-foreground text-sm">{principle.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader>
              <CardTitle>Your Rights Under Australian Law</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Access Your Information</h4>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Request a copy of all personal information we hold</li>
                      <li>• Understand how your information is being used</li>
                      <li>• Receive information in a readable format</li>
                      <li>• No charge for reasonable requests</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Correct Your Information</h4>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Update incorrect personal details</li>
                      <li>• Correct pet information and medical records</li>
                      <li>• Add missing information to your profile</li>
                      <li>• Free correction service</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Complain About Privacy</h4>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Lodge complaints with our Privacy Officer</li>
                      <li>• Escalate to the Privacy Commissioner</li>
                      <li>• Independent dispute resolution</li>
                      <li>• No cost complaint process</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Control Your Data</h4>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• Opt-out of marketing communications</li>
                      <li>• Request deletion of your account</li>
                      <li>• Control who can access pet information</li>
                      <li>• Export your data to other services</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Processing */}
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader>
              <CardTitle>Australian Data Processing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Local Processing</h4>
                  <p className="text-muted-foreground text-sm mb-3">
                    All personal information is processed and stored within Australia using local data centers and cloud providers.
                  </p>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• AWS Australia (Sydney) region</li>
                    <li>• Australian-based support team</li>
                    <li>• Local backup and disaster recovery</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-3">International Transfers</h4>
                  <p className="text-muted-foreground text-sm mb-3">
                    We minimally transfer data overseas and only when necessary for our service with appropriate safeguards.
                  </p>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• Payment processing (encrypted)</li>
                    <li>• Emergency veterinary networks</li>
                    <li>• International pet recovery services</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader>
              <CardTitle>Privacy Officer Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you have questions about your privacy rights or wish to make a complaint, contact our Privacy Officer:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Privacy Officer</h4>
                  <div className="space-y-1 text-muted-foreground text-sm">
                    <p>Sarah Chen, Chief Privacy Officer</p>
                    <p>PetLinkID Pty Ltd</p>
                    <p>123 Pet Street</p>
                    <p>Sydney, NSW 2000</p>
                    <p>Australia</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Contact Details</h4>
                  <div className="space-y-1 text-muted-foreground text-sm">
                    <p>Email: privacy@petpassport.com.au</p>
                    <p>Phone: 1800 PRIVACY (1800 774 8229)</p>
                    <p>Response Time: 30 days maximum</p>
                    <p>Emergency: 24-48 hours</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* External Resources */}
          <Card className="bg-gradient-hero text-white border-0">
            <CardContent className="text-center py-8">
              <Flag className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">
                Learn More About Your Privacy Rights
              </h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                For more information about privacy rights in Australia, visit the Office of the Australian Information Commissioner.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="lg">
                  <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">
                    Visit OAIC Website
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10" asChild>
                  <Link to="/contact">
                    Contact Privacy Officer
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AustralianPrivacy;
