import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

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
    description: "Perfect for getting started with one pet",
    features: [
      "1 Pet Profile",
      "1 Read-only Caregiver",
      "2 Active Health Reminders",
      "50MB Document Storage",
      "Basic Support"
    ],
    cta: "Get Started Free",
    variant: "outline" as const
  },
  {
    name: "Pro",
    price: "2.99",
    period: "month",
    description: "Full features for pet families",
    features: [
      "Unlimited Pet Profiles",
      "Full Caregiver Access (read & write)",
      "Unlimited Health Reminders",
      "200MB Document Storage",
      "Data Export Capability",
      "Priority Support",
      "7-Day Free Trial"
    ],
    cta: "Start 7-Day Free Trial",
    variant: "hero" as const,
    popular: true
  }
];

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleStartProTrial = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setCheckingOut(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        navigate('/auth');
        return;
      }
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.url) {
        const topWindow = window.top ?? window;
        topWindow.location.href = data.url as string;
      }
    } catch (e) {
      console.error('Frontpage trial checkout error:', e);
      toast.error('Could not start trial. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

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
              <Button variant="hero" size="lg" className="text-lg px-8 py-4" asChild>
                <Link to="/auth">
                  Create Your First Pet Profile
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
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
                <Card 
                  key={index} 
                  className={`p-8 relative ${
                    plan.popular
                      ? 'border-primary shadow-lg scale-105'
                      : 'border-border'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Crown className="w-4 h-4" />
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">A${plan.price}</span>
                      <span className="text-muted-foreground">
                        {plan.price === '0' ? '' : `/${plan.period}`}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.name === 'Pro' ? (
                    <Button 
                      variant={plan.popular ? 'default' : 'outline'} 
                      className="w-full"
                      onClick={handleStartProTrial}
                      disabled={checkingOut}
                      data-testid="start-trial-cta"
                    >
                      {checkingOut ? 'Processing...' : plan.cta}
                    </Button>
                  ) : (
                    <Button 
                      variant={plan.popular ? 'default' : 'outline'} 
                      className="w-full"
                      asChild
                    >
                      <Link to="/auth">{plan.cta}</Link>
                    </Button>
                  )}
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
              Join thousands of Australian pet owners who trust PetLinkID to keep their furry family members safe and healthy.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4 shadow-strong" asChild>
                <Link to="/auth">
                  <Heart className="w-5 h-5 mr-2" />
                  Start Free Today
                </Link>
              </Button>
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4 bg-foreground text-background hover:bg-foreground/90" asChild>
                <Link to="/downloads">
                  <Shield className="w-5 h-5 mr-2" />
                  View Demo
                </Link>
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

      
      <Footer />
    </div>
  );
};

export default Index;
