import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  ArrowLeft,
  Search,
  MessageCircle,
  BookOpen,
  Shield,
  Heart,
  Phone,
  Mail,
  Clock
} from "lucide-react";

const HelpCentre = () => {
  const faqCategories = [
    {
      title: "Getting Started",
      icon: <BookOpen className="w-5 h-5" />,
      articles: [
        "How to create your first pet profile",
        "Setting up QR recovery tags",
        "Understanding vaccination reminders",
        "Linking to pet registries"
      ]
    },
    {
      title: "Lost Pet Recovery",
      icon: <Search className="w-5 h-5" />,
      articles: [
        "What to do if your pet goes missing",
        "How QR tags help find lost pets", 
        "Creating effective lost pet alerts",
        "Working with local shelters"
      ]
    },
    {
      title: "Account & Billing",
      icon: <Shield className="w-5 h-5" />,
      articles: [
        "Upgrading to Pro",
        "Managing your subscription",
        "Billing and payment options",
        "Cancelling your account"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          
          <div className="text-center mb-12">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <MessageCircle className="w-3 h-3 mr-1" />
              Help Centre
            </Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              How can we help you?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions or get in touch with our support team.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader className="text-center">
              <Phone className="w-8 h-8 text-primary mx-auto mb-2" />
              <CardTitle>Emergency Support</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Pet emergency? Get immediate help.
              </p>
              <Button variant="hero" className="w-full">
                Call Now: 1800 PET SOS
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader className="text-center">
              <Mail className="w-8 h-8 text-primary mx-auto mb-2" />
              <CardTitle>Email Support</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Get help within 24 hours.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/contact">Send Message</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader className="text-center">
              <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
              <CardTitle>Live Chat</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Chat with us right now.
              </p>
              <Button variant="outline" className="w-full">
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {faqCategories.map((category, index) => (
              <Card key={index} className="bg-gradient-card border-0 shadow-medium">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {category.icon}
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.articles.map((article, articleIndex) => (
                      <li key={articleIndex}>
                        <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                          {article}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <Card className="bg-gradient-hero text-white border-0">
          <CardContent className="text-center py-12">
            <Heart className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">
              Still need help?
            </h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Our support team is here to help you and your pets. Get personalized assistance from our pet care experts.
            </p>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/contact">
                Contact Support
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HelpCentre;