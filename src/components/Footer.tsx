import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Logo />
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
                <Link to="/smart-tags" className="text-muted-foreground hover:text-foreground transition-colors">
                  Smart Tags
                </Link>
              </li>
              <li>
                <Link to="/app-downloads" className="text-muted-foreground hover:text-foreground transition-colors">
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
                <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                  Help Centre
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
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
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/subscription-terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Subscription Terms
                </Link>
              </li>
              <li>
                <Link to="/refunds" className="text-muted-foreground hover:text-foreground transition-colors">
                  Refunds & Guarantees
                </Link>
              </li>
              <li>
                <Link to="/data-handling" className="text-muted-foreground hover:text-foreground transition-colors">
                  Data Handling
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {currentYear} PetLinkID. All rights reserved.</p>
          <p className="mt-2">Made with ❤️ for pets and their families</p>
        </div>
      </div>
    </footer>
  );
};