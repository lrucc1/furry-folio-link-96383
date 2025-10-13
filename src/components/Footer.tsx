import { Link } from 'react-router-dom';
import { Heart, Mail, Shield, FileText, HelpCircle, Download } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">PetGuard</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Protecting your pets with smart recovery technology and comprehensive health tracking.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/smart-recovery-tags" className="text-muted-foreground hover:text-foreground transition-colors">
                  Smart Recovery Tags
                </Link>
              </li>
              <li>
                <Link to="/app-downloads" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Download className="w-3 h-3 inline mr-1" />
                  App Downloads
                </Link>
              </li>
              <li>
                <Link to="/lost-pet-guide" className="text-muted-foreground hover:text-foreground transition-colors">
                  Lost Pet Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="w-3 h-3 inline mr-1" />
                  Help Centre
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="w-3 h-3 inline mr-1" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  <FileText className="w-3 h-3 inline mr-1" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/australian-privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Australian Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {currentYear} PetGuard. All rights reserved.</p>
          <p className="mt-2">Made with ❤️ for pets and their families</p>
        </div>
      </div>
    </footer>
  );
};