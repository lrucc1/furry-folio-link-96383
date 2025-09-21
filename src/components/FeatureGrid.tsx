import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  QrCode, 
  Shield, 
  Calendar, 
  Users, 
  FileText, 
  MapPin, 
  Smartphone,
  Crown
} from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Pet Profiles",
    description: "Store complete pet information, photos, and medical records in one secure place.",
    badge: "Free",
    color: "text-primary"
  },
  {
    icon: QrCode,
    title: "Smart Recovery Tags",
    description: "Generate QR codes for instant pet identification and safe return when lost.",
    badge: "Free",
    color: "text-accent"
  },
  {
    icon: Shield,
    title: "Privacy Protected",
    description: "Your contact details stay private with our secure relay messaging system.",
    badge: "Secure",
    color: "text-success"
  },
  {
    icon: Calendar,
    title: "Health Reminders",
    description: "Never miss vaccinations, medications, or vet appointments with smart notifications.",
    badge: "Premium",
    color: "text-warning"
  },
  {
    icon: Users,
    title: "Family Sharing",
    description: "Share pet access with family members, pet sitters, and emergency contacts.",
    badge: "Premium",
    color: "text-primary"
  },
  {
    icon: FileText,
    title: "Registry Links",
    description: "Quick access to official microchip registries for easy updates and verification.",
    badge: "Helper",
    color: "text-muted-foreground"
  },
  {
    icon: MapPin,
    title: "Lost Pet Network",
    description: "Instantly create shareable lost pet alerts with location and contact information.",
    badge: "Free",
    color: "text-destructive"
  },
  {
    icon: Smartphone,
    title: "Cross Platform",
    description: "Access your pet's information anywhere - iOS, Android, or web browser.",
    badge: "Universal",
    color: "text-primary"
  }
];

export const FeatureGrid = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
            <Crown className="w-3 h-3 mr-1" />
            Complete Pet Care Solution
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Everything Your Pet Needs
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From daily care tracking to emergency recovery, Pet Passport has all the tools to keep your furry family members safe and healthy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gradient-card border-0 shadow-medium hover:shadow-strong transition-spring group">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-primary/10 flex items-center justify-center group-hover:scale-110 transition-spring ${feature.color}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <Badge 
                    variant={feature.badge === "Premium" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};