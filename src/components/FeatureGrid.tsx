import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
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
    color: "text-primary",
    faqId: "pet-profiles"
  },
  {
    icon: QrCode,
    title: "Smart Tags",
    description: "Generate QR codes for instant pet identification and safe return when lost.",
    badge: "Coming Soon",
    color: "text-accent",
    faqId: "smart-tags-qr-codes"
  },
  {
    icon: Shield,
    title: "VetShare",
    description: "Share medical records with vets via QR code for seamless healthcare coordination.",
    badge: "Pro",
    color: "text-green-500",
    faqId: "vetshare"
  },
  {
    icon: Calendar,
    title: "Health Reminders",
    description: "Never miss vaccinations, medications, or vet appointments with smart notifications.",
    badge: "Pro",
    color: "text-warning",
    faqId: "health-reminders"
  },
  {
    icon: Users,
    title: "Family Sharing",
    description: "Share all-in-one access to pet profiles, documents, health reminders, and vet records with family members, caregivers, babysitters, and emergency contacts.",
    badge: "Pro",
    color: "text-accent",
    faqId: "family-sharing"
  },
  {
    icon: FileText,
    title: "Registry Links",
    description: "Quick access to official microchip registries for easy updates and verification.",
    badge: "Helper",
    color: "text-muted-foreground",
    faqId: "registry-links"
  },
  {
    icon: MapPin,
    title: "Lost Pet",
    description: "Instantly create shareable lost pet alerts and posters using your pet's digital ID and QR code with location and contact information.",
    badge: "Free",
    color: "text-destructive",
    faqId: "lost-pet-recovery"
  },
  {
    icon: Smartphone,
    title: "Cross Platform",
    description: "Access your pet's information anywhere - iOS or web browser.",
    badge: "Universal",
    color: "text-primary",
    faqId: "cross-platform-access"
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
            From daily care tracking to emergency recovery, PetLinkID has all the tools to keep your furry family members safe and healthy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Link key={index} to={`/faq#${feature.faqId}`} className="block">
              <Card className="bg-gradient-card border-0 shadow-medium hover:shadow-strong transition-spring group cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-primary/10 flex items-center justify-center group-hover:scale-110 transition-spring ${feature.color}`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <Badge 
                      variant={feature.badge === "Pro" ? "default" : "secondary"}
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
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};