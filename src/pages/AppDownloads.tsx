import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  ArrowLeft,
  Smartphone,
  Download,
  Star,
  Users,
  Shield,
  Zap
} from "lucide-react";

const AppDownloads = () => {
  const appFeatures = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Instant QR Scanning",
      description: "Quick access to pet profiles via QR code scanning"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Offline Access",
      description: "View pet information even without internet connection"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Family Sharing",
      description: "Share pet access with family members and caregivers"
    }
  ];

  const appStats = [
    { number: "4.9★", label: "App Store Rating" },
    { number: "50K+", label: "Downloads" },
    { number: "4.8★", label: "Google Play Rating" },
    { number: "99.9%", label: "Uptime" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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
              <Smartphone className="w-3 h-3 mr-1" />
              App Downloads
            </Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Download PetLinkID
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get the PetLinkID mobile app for the fastest access to your pet's information, QR scanning, and instant lost pet alerts.
            </p>
          </div>
        </div>

        {/* Download Buttons */}
        <section className="mb-16">
          <Card className="bg-gradient-card border-0 shadow-medium max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <Smartphone className="w-16 h-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Available on All Devices
              </h3>
              <p className="text-muted-foreground mb-8">
                Download PetLinkID for free on iOS, Android, or access via web browser.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <Button size="lg" className="h-12" variant="hero">
                  <Download className="w-5 h-5 mr-2" />
                  App Store
                </Button>
                <Button size="lg" className="h-12" variant="hero">
                  <Download className="w-5 h-5 mr-2" />
                  Google Play
                </Button>
                <Button size="lg" className="h-12" variant="outline">
                  <Smartphone className="w-5 h-5 mr-2" />
                  Web App
                </Button>
              </div>
              
              <p className="text-muted-foreground text-sm mt-4">
                Free download • No ads • Premium features available
              </p>
            </CardContent>
          </Card>
        </section>

        {/* App Stats */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Trusted by Pet Owners Everywhere
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {appStats.map((stat, index) => (
              <Card key={index} className="bg-gradient-card border-0 shadow-medium text-center">
                <CardContent className="py-8">
                  <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* App Features */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Mobile-First Features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {appFeatures.map((feature, index) => (
              <Card key={index} className="bg-gradient-card border-0 shadow-medium">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Screenshots Section */}
        <section className="mb-16">
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">See PetLinkID in Action</CardTitle>
              <p className="text-muted-foreground">
                Beautiful, intuitive design that makes managing your pet's life simple and secure.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-full h-64 bg-gradient-primary/10 rounded-lg mb-4 flex items-center justify-center">
                    <Smartphone className="w-16 h-16 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Pet Dashboard</h4>
                  <p className="text-sm text-muted-foreground">View all your pets at a glance with health status and recent updates.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-full h-64 bg-gradient-primary/10 rounded-lg mb-4 flex items-center justify-center">
                    <Smartphone className="w-16 h-16 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">QR Scanner</h4>
                  <p className="text-sm text-muted-foreground">Instantly scan QR tags to access pet information and contact owners.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-full h-64 bg-gradient-primary/10 rounded-lg mb-4 flex items-center justify-center">
                    <Smartphone className="w-16 h-16 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Health Tracking</h4>
                  <p className="text-sm text-muted-foreground">Track vaccinations, medications, and receive smart reminders.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* System Requirements */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-gradient-card border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  iOS Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground text-sm">
                <p>• iOS 14.0 or later</p>
                <p>• iPhone 8 or newer</p>
                <p>• 50MB available storage</p>
                <p>• Camera access for QR scanning</p>
                <p>• Location services (optional)</p>
                <p>• Push notification support</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  Android Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground text-sm">
                <p>• Android 8.0 (API level 26) or higher</p>
                <p>• 2GB RAM minimum</p>
                <p>• 50MB available storage</p>
                <p>• Camera access for QR scanning</p>
                <p>• Location services (optional)</p>
                <p>• Google Play Services</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="mb-16">
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">What Pet Owners Are Saying</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    "This app saved my dog Max when he got lost. The QR tag worked perfectly!"
                  </p>
                  <p className="text-xs text-muted-foreground">- Sarah M.</p>
                </div>
                
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    "Love the vaccination reminders. Never miss my cat's checkups anymore."
                  </p>
                  <p className="text-xs text-muted-foreground">- James T.</p>
                </div>
                
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    "Simple, clean interface. Everything I need for my pets in one place."
                  </p>
                  <p className="text-xs text-muted-foreground">- Emma K.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <Card className="bg-gradient-hero text-white border-0">
          <CardContent className="text-center py-12">
            <Download className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">
              Download PetLinkID Today
            </h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Join thousands of Australian pet owners who trust PetLinkID to keep their furry family members safe and healthy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg">
                <Download className="w-5 h-5 mr-2" />
                Download Free
              </Button>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link to="/auth">
                  Create Account
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AppDownloads;