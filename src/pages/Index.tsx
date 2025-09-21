import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeatureGrid } from "@/components/FeatureGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PetCard } from "@/components/PetCard";
import { 
  Crown, 
  Check, 
  ArrowRight, 
  Heart,
  Shield,
  Zap,
  Users
} from "lucide-react";

// Mock data for demonstration
const mockPets = [
  {
    id: "1",
    name: "Max",
    species: "Dog",
    breed: "Golden Retriever",
    age: "3 years",
    photo: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
    isLost: false,
    microchipNumber: "123456789",
    lastVaccination: "2024-06-15"
  },
  {
    id: "2", 
    name: "Luna",
    species: "Cat",
    breed: "British Shorthair",
    age: "2 years",
    photo: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop",
    isLost: true,
    microchipNumber: "987654321",
    lastVaccination: "2024-07-20"
  }
];

const pricingPlans = [
  {
    name: "Free",
    price: "0",
    period: "forever",
    description: "Perfect for single pet households",
    features: [
      "1 Pet Profile",
      "Basic QR Recovery Tag", 
      "Vaccination Reminders",
      "Registry Links",
      "Lost Pet Alerts"
    ],
    cta: "Get Started Free",
    variant: "outline" as const
  },
  {
    name: "Premium",
    price: "4.99",
    period: "month",
    description: "Complete protection for all your pets",
    features: [
      "Unlimited Pet Profiles",
      "Advanced QR & NFC Tags",
      "Priority Recovery Alerts",
      "Family Sharing & Access",
      "Custom Lost Pet Posters",
      "Premium Support",
      "File Storage & Documents"
    ],
    cta: "Start Premium Trial",
    variant: "hero" as const,
    popular: true
  }
];

const Index = () => {
  const handleViewPetDetails = (pet: any) => {
    console.log("Viewing details for:", pet.name);
  };

  const handleToggleLost = (petId: string) => {
    console.log("Toggling lost status for pet:", petId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroSection />
        <FeatureGrid />
        
        {/* Demo Pet Dashboard */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                <Heart className="w-3 h-3 mr-1" />
                Live Demo
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Your Pet Dashboard
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See how easy it is to manage your pets with our intuitive interface.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {mockPets.map((pet) => (
                <PetCard 
                  key={pet.id}
                  pet={pet}
                  onViewDetails={handleViewPetDetails}
                  onToggleLost={handleToggleLost}
                />
              ))}
            </div>

            <div className="text-center mt-12">
              <Button variant="hero" size="lg" className="text-lg px-8 py-4">
                Create Your First Pet Profile
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="bg-accent/10 text-accent border-accent/20 mb-4">
                <Crown className="w-3 h-3 mr-1" />
                Simple Pricing
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
                Choose Your Plan
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Start free and upgrade when you need more features. No lock-in contracts, cancel anytime.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <Card key={index} className={`relative ${plan.popular ? 'bg-gradient-card border-primary/20 shadow-glow' : 'bg-gradient-card'} border-0 shadow-medium hover:shadow-strong transition-spring`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-accent text-accent-foreground shadow-medium">
                      <Crown className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-2xl font-bold text-foreground mb-2">
                      {plan.name}
                    </CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                    <p className="text-muted-foreground">
                      {plan.description}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-success flex-shrink-0" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      variant={plan.variant} 
                      size="lg"
                      className="w-full text-lg py-3"
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-hero text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Ready to Protect Your Pets?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of Australian pet owners who trust Pet Passport to keep their furry family members safe and healthy.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4 shadow-strong">
                <Heart className="w-5 h-5 mr-2" />
                Start Free Today
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white/30 text-white hover:bg-white/10">
                <Shield className="w-5 h-5 mr-2" />
                View Demo
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">10K+</div>
                <div className="text-white/80 text-sm">Happy Pet Owners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">25K+</div>
                <div className="text-white/80 text-sm">Pets Protected</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="text-white/80 text-sm">Pets Reunited</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">4.9★</div>
                <div className="text-white/80 text-sm">App Store Rating</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">Pet Passport</span>
              </div>
              <p className="text-white/70 text-sm">
                Your pet's digital companion for a safer, healthier, happier life.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>Pet Profiles</li>
                <li>QR Recovery Tags</li>
                <li>Health Reminders</li>
                <li>Registry Links</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>Help Centre</li>
                <li>Contact Us</li>
                <li>Lost Pet Guide</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>About Us</li>
                <li>Terms of Service</li>
                <li>Australian Privacy</li>
                <li>App Downloads</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p className="text-white/70 text-sm">
              © 2024 Pet Passport. Made with ❤️ in Australia. Protecting pets nationwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
