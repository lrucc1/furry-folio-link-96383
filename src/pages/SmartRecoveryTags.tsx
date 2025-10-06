import React from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Smartphone, 
  QrCode, 
  Wifi, 
  Shield, 
  Zap, 
  Heart, 
  MapPin, 
  Bell,
  CheckCircle,
  ArrowRight,
  Star
} from "lucide-react";

export default function SmartRecoveryTags() {
  const tagTypes = [
    {
      id: "qr-basic",
      name: "QR Code Tag",
      price: "$15",
      description: "Simple QR code tag that links to your pet's profile",
      features: [
        "Waterproof QR code",
        "Durable metal construction",
        "Instant profile access",
        "Works with any smartphone"
      ],
      badge: "Popular",
      badgeColor: "bg-blue-500",
      icon: QrCode
    },
    {
      id: "nfc-smart",
      name: "NFC Smart Tag",
      price: "$25",
      description: "Advanced NFC technology with tap-to-access functionality",
      features: [
        "NFC + QR code backup",
        "No app required",
        "Premium metal finish",
        "GPS location logging"
      ],
      badge: "Recommended",
      badgeColor: "bg-green-500",
      icon: Wifi
    },
    {
      id: "gps-tracker",
      name: "GPS Recovery Tag",
      price: "$89",
      description: "Real-time GPS tracking with cellular connectivity",
      features: [
        "Live GPS tracking",
        "Geo-fence alerts",
        "7-day battery life",
        "Emergency SOS button"
      ],
      badge: "Premium",
      badgeColor: "bg-purple-500",
      icon: MapPin
    }
  ];

  const features = [
    {
      icon: Smartphone,
      title: "Universal Compatibility",
      description: "Works with any smartphone - iPhone or Android. No special app required for basic scanning."
    },
    {
      icon: Shield,
      title: "Privacy Protected",
      description: "Your contact information is never displayed publicly. Finders can only send messages through our secure platform."
    },
    {
      icon: Zap,
      title: "Instant Notifications",
      description: "Get immediately notified via SMS and email when someone scans your pet's tag."
    },
    {
      icon: Bell,
      title: "Location Alerts",
      description: "Know exactly where and when your pet was found with automatic GPS coordinates."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="pt-20 pb-12 bg-gradient-hero text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-white/20 text-white border-white/30 mb-6 backdrop-blur-sm">
              <Star className="w-3 h-3 mr-1" />
              Smart Recovery Technology
            </Badge>
            
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Smart Recovery Tags
              <span className="block text-xl lg:text-2xl font-normal text-white/80 mt-2">
                Get your lost pet home faster with intelligent ID tags
              </span>
            </h1>
            
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Our smart tags use QR codes, NFC, and GPS technology to ensure rapid pet recovery. 
              When someone finds your pet, they're instantly connected to you through our secure platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4" asChild>
                <Link to="/auth">
                  Order Smart Tags
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline-light" className="text-lg px-8 py-4" asChild>
                <Link to="/lost-pet-guide">
                  Lost Pet Guide
                  <QrCode className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Choose Your Smart Tag
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select the perfect recovery solution for your pet's lifestyle and your peace of mind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tagTypes.map((tag) => (
              <Card key={tag.id} className="relative overflow-hidden border-2 hover:shadow-strong transition-spring">
                {tag.badge && (
                  <div className="absolute top-4 right-4">
                    <Badge className={`${tag.badgeColor} text-white`}>
                      {tag.badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center">
                    <tag.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">{tag.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary mb-2">{tag.price}</div>
                  <CardDescription>{tag.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3">
                    {tag.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button className="w-full mt-6" asChild>
                    <Link to="/auth">Order Now</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How Smart Tags Work
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our intelligent recovery system connects finders with pet owners instantly and securely.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Ready to Protect Your Pet?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of pet owners who trust our smart recovery technology to keep their furry family members safe.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-4" asChild>
                <Link to="/auth">
                  <Heart className="w-5 h-5 mr-2" />
                  Create Pet Profile & Order Tags
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4" asChild>
                <Link to="/contact">
                  Questions? Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}