import { Button } from "@/components/ui/button";
import { Heart, Shield, Users, QrCode, Smartphone, Link2 } from "lucide-react";
import heroImage from "@/assets/hero-pets-realistic.jpg";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

export const HeroSection = () => {
  const { scrollY } = useScroll();
  
  // Parallax transforms - image moves slower than scroll
  const imageY = useTransform(scrollY, [0, 500], [0, 100]);
  const bgY = useTransform(scrollY, [0, 500], [0, 50]);
  const contentY = useTransform(scrollY, [0, 500], [0, 30]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-hero text-white">
      {/* Parallax background layer */}
      <motion.div 
        className="absolute inset-0 bg-gradient-hero"
        style={{ y: bgY }}
      />
      
      <div className="container relative mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ y: contentY, opacity }}
          >
            <p className="text-sm text-white/70 uppercase tracking-widest mb-6 font-medium">
              Now available on iOS & Web
            </p>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Your Pet's
              <span className="block bg-gradient-to-r from-white via-primary-glow to-white bg-clip-text text-transparent">
                Digital License
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-lg">
              Store pet profiles, track vaccinations, and instantly share essential pet information with family and caregivers — so your furry family is always cared for.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4 shadow-strong" asChild>
                <a href="#pricing">
                  <Heart className="w-5 h-5 mr-2" />
                  Choose Your Plan
                </a>
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
              <Users className="w-8 h-8 mx-auto mb-2 text-primary-glow" />
              <p className="text-sm text-white/80">Family Sharing</p>
              <p className="text-xs text-white/60">Share with Caregivers</p>
            </div>
              <div className="text-center">
                <Smartphone className="w-8 h-8 mx-auto mb-2 text-primary-glow" />
                <p className="text-sm text-white/80">Cross-Platform</p>
                <p className="text-xs text-white/60">iOS & Web</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-3xl transform rotate-6 scale-105" />
            <motion.img 
              src={heroImage} 
              alt="Three happy pets wearing ID tags - golden retriever, tabby cat, and pug with smart collar tags"
              className="relative rounded-3xl shadow-strong w-full h-auto object-cover max-w-lg mx-auto backface-hidden"
              style={{ y: imageY, imageRendering: '-webkit-optimize-contrast' }}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            {/* PetLinkID License Card preview */}
            <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 shadow-strong transform rotate-3 border border-white/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center relative overflow-hidden">
                  {/* Holographic shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  <Link2 className="w-6 h-6 text-white rotate-45 relative z-10" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">3 Pets Licensed</p>
                  <p className="text-xs text-muted-foreground">PetLinkID Protected</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
