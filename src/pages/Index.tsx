import { HeroSection } from "@/components/HeroSection";
import { FeatureGrid } from "@/components/FeatureGrid";
import { SectionNav } from "@/components/SectionNav";
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
  Smartphone,
  Apple
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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

const APP_STORE_URL = import.meta.env.VITE_APP_STORE_URL || '#';

const Index = () => {
  const handleViewPetDetails = (pet: any) => {
    // Demo only - no action needed
  };

  const handleToggleLost = (petId: string) => {
    // Demo only - no action needed
  };

  return (
    <div className="min-h-screen bg-background">
      <SectionNav />
      
      <main>
        <HeroSection />
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <FeatureGrid />
        </motion.div>
        
        {/* Demo Pet Dashboard */}
        <section id="demo" className="py-12 sm:py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                <Heart className="w-3 h-3 mr-1" />
                Live Demo
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Your Pet Dashboard
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                See how easy it is to manage your pets with our intuitive interface.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
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

        {/* Pricing Section - iOS First */}
        <section id="pricing" className="py-12 sm:py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="bg-accent/10 text-accent border-accent/20 mb-4">
                <Crown className="w-3 h-3 mr-1" />
                Simple Pricing
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
                Simple plans for every pet family
              </h2>
              <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
                Start free in minutes. Upgrade any time from the PetLinkID iOS app using secure Apple in-app purchases.
              </p>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                PetLinkID is designed to be iOS-first, with a simple web experience to support QR tag scans and quick access to your pet's profile.
                All plan upgrades and billing are handled safely through the App Store on your iPhone.
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Free Plan Card */}
              <Card className="p-4 sm:p-6 md:p-8 border-border">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Free</h2>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">Always free</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Perfect for trying PetLinkID with your first pet.
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Create your PetLinkID account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Add 1 pet profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Link QR tags to your pet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Lost & found profile page when someone scans the tag</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Basic contact details and notes</span>
                  </li>
                </ul>

                <Button variant="outline" className="w-full" asChild>
                  <Link to="/auth">Get started free</Link>
                </Button>
              </Card>

              {/* Pro Plan Card */}
              <Card className="p-4 sm:p-6 md:p-8 relative border-primary shadow-lg scale-105">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Crown className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
                
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">PetLinkID Pro</h2>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">Pricing in iOS app</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Full features for pet families
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <p className="text-sm font-medium">🔓 Unlock extra capacity and features:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">More pets and QR tags</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Extra contact options for emergencies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Richer notes and attachments (vet, behaviour, medications, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Priority support for lost-pet incidents</span>
                    </li>
                  </ul>
                </div>

                <Button className="w-full" asChild>
                  <Link to="/pricing">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Learn how to upgrade
                  </Link>
                </Button>
                
                <p className="text-xs text-center text-muted-foreground mt-3">
                  Upgrades available via the iOS app
                </p>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section id="cta" className="py-12 sm:py-16 md:py-20 bg-gradient-hero text-white">
          <motion.div 
            className="container mx-auto px-4 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Ready to Protect Your Pets?
            </h2>
            <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Join thousands of pet owners worldwide who trust PetLinkID to keep their furry family members safe and healthy.
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
                  Get the iOS App
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
          </motion.div>
        </section>
      </main>

      
    </div>
  );
};

export default Index;
