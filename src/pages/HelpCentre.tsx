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
import { useIsNativeApp } from "@/hooks/useIsNativeApp";
import { IOSPageLayout } from "@/components/ios/IOSPageLayout";
import { MobileCard } from "@/components/ios/MobileCard";

const HelpCentre = () => {
  const isNative = useIsNativeApp();

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

  // iOS Native Layout
  if (isNative) {
    return (
      <IOSPageLayout title="Help Centre">
        <div className="pb-8">
          {/* Quick Actions */}
          <div className="space-y-3 mb-6">
            <MobileCard className="bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Emergency Support</h3>
                  <p className="text-sm text-muted-foreground">Pet emergency? Get immediate help.</p>
                </div>
              </div>
              <Button variant="default" className="w-full mt-4 rounded-xl">
                Call: 1800 PET SOS
              </Button>
            </MobileCard>

            <div className="grid grid-cols-2 gap-3">
              <MobileCard>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm">Email Us</h3>
                  <p className="text-xs text-muted-foreground">24hr response</p>
                </div>
              </MobileCard>

              <MobileCard>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm">Live Chat</h3>
                  <p className="text-xs text-muted-foreground">Chat now</p>
                </div>
              </MobileCard>
            </div>
          </div>

          {/* FAQ Categories */}
          <h2 className="text-lg font-semibold mb-4 px-1">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqCategories.map((category) => (
              <MobileCard key={category.title}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    {category.icon}
                  </div>
                  <h3 className="font-semibold">{category.title}</h3>
                </div>
                <ul className="space-y-2">
                  {category.articles.map((article) => (
                    <li key={`${category.title}-${article}`}>
                      <button className="text-muted-foreground hover:text-primary text-sm text-left w-full py-1">
                        {article}
                      </button>
                    </li>
                  ))}
                </ul>
              </MobileCard>
            ))}
          </div>

          {/* Contact Section */}
          <MobileCard className="mt-6 bg-gradient-to-br from-primary to-primary/80 text-white border-0">
            <div className="text-center py-4">
              <Heart className="w-10 h-10 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Still need help?</h3>
              <p className="text-white/90 text-sm mb-4">
                Get personalized assistance from our pet care experts.
              </p>
              <Button variant="secondary" size="lg" className="rounded-xl" asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
            </div>
          </MobileCard>
        </div>
      </IOSPageLayout>
    );
  }

  // Web Layout
  return (
    <div className="min-h-screen bg-background">
      
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
          <Card className="bg-gradient-card border-0 shadow-medium rounded-3xl">
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

          <Card className="bg-gradient-card border-0 shadow-medium rounded-3xl">
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

          <Card className="bg-gradient-card border-0 shadow-medium rounded-3xl">
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
              <Card key={index} className="bg-gradient-card border-0 shadow-medium rounded-3xl">
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
        <Card className="bg-gradient-hero text-white border-0 rounded-3xl">
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
