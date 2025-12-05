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
  Zap,
  Apple,
  Crown
} from "lucide-react";
import screenshotDashboard from "@/assets/screenshot-dashboard.png";
import screenshotQR from "@/assets/screenshot-qr.png";
import screenshotHealth from "@/assets/screenshot-health.png";

const APP_STORE_URL = import.meta.env.VITE_APP_STORE_URL || '#';

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
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
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
              <Smartphone className="w-3 h-3 mr-1" />
              iOS App
            </Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Download PetLinkID
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get the PetLinkID iOS app for the best experience — including Pro upgrades, QR scanning, and instant lost pet alerts.
            </p>
          </div>
        </div>

        {/* Download Section */}
        <section className="mb-16">
          <Card className="bg-gradient-card border-0 shadow-medium max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <Apple className="w-16 h-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-4">
                PetLinkID for iPhone
              </h3>
              <p className="text-muted-foreground mb-6">
                The full PetLinkID experience is on iOS. Download to access all features including Pro plan upgrades via Apple In-App Purchases.
              </p>
              
              <div className="flex flex-col gap-4 max-w-sm mx-auto">
                <Button size="lg" className="h-14 text-lg" variant="hero" asChild>
                  <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
                    <Apple className="w-6 h-6 mr-2" />
                    Download on App Store
                  </a>
                </Button>
                <Button size="lg" className="h-12" variant="outline" asChild>
                  <Link to="/auth">
                    <Smartphone className="w-5 h-5 mr-2" />
                    Continue on Web
                  </Link>
                </Button>
              </div>
              
              <p className="text-muted-foreground text-sm mt-6">
                Free download • Pro features available via in-app purchase
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Why iOS App */}
        <section className="mb-16">
          <Card className="bg-primary/5 border-primary/20 max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Why use the iOS app?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-primary text-sm font-bold">1</span>
                  </div>
                  <div>
                    <strong>Upgrade to Pro</strong> — Plan upgrades are only available in the iOS app via secure Apple In-App Purchases.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-primary text-sm font-bold">2</span>
                  </div>
                  <div>
                    <strong>Push notifications</strong> — Get instant alerts for health reminders and lost pet updates.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-primary text-sm font-bold">3</span>
                  </div>
                  <div>
                    <strong>Native QR scanning</strong> — Scan QR tags quickly with the built-in camera integration.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-primary text-sm font-bold">4</span>
                  </div>
                  <div>
                    <strong>Offline access</strong> — View your pet's information even without an internet connection.
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* App Stats */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Trusted by Pet Owners Everywhere
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                  <div className="w-full h-64 bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    <img src={screenshotDashboard} alt="Pet Dashboard showing multiple pet profiles" className="h-full w-auto object-contain" />
                  </div>
                  <h4 className="font-semibold mb-2">Pet Dashboard</h4>
                  <p className="text-sm text-muted-foreground">View all your pets at a glance with health status and recent updates.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-full h-64 bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    <img src={screenshotQR} alt="QR code scanner interface" className="h-full w-auto object-contain" />
                  </div>
                  <h4 className="font-semibold mb-2">QR Scanner</h4>
                  <p className="text-sm text-muted-foreground">Instantly scan QR tags to access pet information and contact owners.</p>
                </div>
                
                <div className="text-center">
                  <div className="w-full h-64 bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    <img src={screenshotHealth} alt="Health tracking and vaccination reminders" className="h-full w-auto object-contain" />
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
          <Card className="bg-gradient-card border-0 shadow-medium max-w-xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="w-5 h-5 text-primary" />
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

      </main>
    </div>
  );
};

export default AppDownloads;
