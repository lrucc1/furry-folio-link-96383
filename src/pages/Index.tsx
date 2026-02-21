import { HeroSection } from "@/components/HeroSection";
import { FeatureGrid } from "@/components/FeatureGrid";
import { SectionNav } from "@/components/SectionNav";
import { Button } from "@/components/ui/button";
import { PetCard } from "@/components/PetCard";
import { HomePricingCards } from "@/components/PricingCards";
import { 
  ArrowRight, 
  Heart,
  Shield,
  PawPrint,
  Users,
  Smartphone,
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
    lastVaccination: "2025-12-15"
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
    lastVaccination: "2026-01-20"
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

        {/* Pricing Section - Modern Design */}
        <section id="pricing" className="py-12 sm:py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
                Simple plans for every pet family
              </h2>
              <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
                Start free in minutes. Upgrade anytime via the iOS app.
              </p>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                All prices in AUD • Secure Apple In-App Purchases
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <HomePricingCards />
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
              Start protecting your pets today with secure profiles, health tracking, and instant lost pet recovery.
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
                <PawPrint className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm text-white/80">Unlimited Pets (Pro)</p>
              </div>
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm text-white/80">Family Sharing</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm text-white/80">Privacy First</p>
              </div>
              <div className="text-center">
                <Smartphone className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm text-white/80">iOS & Web</p>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      
    </div>
  );
};

export default Index;
