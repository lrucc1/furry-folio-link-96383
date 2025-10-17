import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Shield, QrCode, Smartphone, Star } from "lucide-react";
import heroImage from "@/assets/hero-pets-realistic.jpg";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero text-white">
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="bg-white/20 text-white border-white/30 mb-6 backdrop-blur-sm">
              <Star className="w-3 h-3 mr-1" />
              Trusted by 10,000+ pet owners across Australia
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Your Pet's
              <span className="block bg-gradient-to-r from-white to-primary-glow bg-clip-text text-transparent">
                Digital Passport
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-lg">
              Store pet profiles, manage vaccinations, and never lose your furry family member again with smart QR tags and instant recovery tools.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4 shadow-strong" asChild>
                <Link to="/pricing">
                  <Heart className="w-5 h-5 mr-2" />
                  Choose Your Plan
                </Link>
              </Button>
              <Button size="lg" variant="outline-light" className="text-lg px-8 py-4" asChild>
                <Link to="/lost-pet-guide">
                  <QrCode className="w-5 h-5 mr-2" />
                  Lost Pet Recovery
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-primary-glow" />
                <p className="text-sm text-white/80">Secure</p>
                <p className="text-xs text-white/60">Privacy Protected</p>
              </div>
              <div className="text-center">
                <QrCode className="w-8 h-8 mx-auto mb-2 text-primary-glow" />
                <p className="text-sm text-white/80">Smart Tags</p>
                <p className="text-xs text-white/60">QR & NFC Ready</p>
              </div>
              <div className="text-center">
                <Smartphone className="w-8 h-8 mx-auto mb-2 text-primary-glow" />
                <p className="text-sm text-white/80">Cross-Platform</p>
                <p className="text-xs text-white/60">iOS, Android & Web</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-3xl transform rotate-6 scale-105 will-change-transform" />
            <img 
              src={heroImage} 
              alt="Three happy pets wearing ID tags - golden retriever, tabby cat, and pug with smart collar tags"
              className="relative rounded-3xl shadow-strong w-full h-auto object-cover max-w-lg mx-auto transform hover:scale-105 transition-spring will-change-transform backface-hidden"
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-strong transform rotate-3 hover:rotate-0 transition-spring will-change-transform">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">3 Pets Safe</p>
                  <p className="text-xs text-muted-foreground">Protected & Tagged</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};