import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  ArrowLeft,
  Search,
  Phone,
  Camera,
  Share,
  Clock,
  Heart,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const LostPetGuide = () => {
  const immediateSteps = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "Search Immediately",
      description: "Check your immediate area, hiding spots, and favourite locations. Call their name clearly."
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Contact Authorities",
      description: "Call local councils, shelters, veterinary clinics, and animal rescue groups in your area."
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Gather Photos",
      description: "Collect recent, clear photos showing distinctive markings, colours, and features."
    },
    {
      icon: <Share className="w-6 h-6" />,
      title: "Spread the Word",
      description: "Post on social media, community groups, and lost pet websites immediately. Use the lost pet poster tool on your pet's profile to create shareable alerts.",
      link: "/faq#lost-pet-recovery"
    }
  ];

  const searchTips = [
    "Search at dawn and dusk when pets are most active",
    "Leave familiar-smelling items outside (your worn clothes, their bedding)",
    "Check with neighbours, delivery drivers, and local businesses",
    "Look in quiet, dark spaces where scared pets might hide",
    "Use a torch at night and listen carefully for sounds",
    "Ask children - they often notice pets more than adults"
  ];

  const preventionTips = [
    "Ensure your pet always wears ID tags with current contact details",
    "Get your pet microchipped and keep registration details up to date",
    "Use GPS tracking collars for extra security",
    "Keep recent photos and videos of your pet",
    "Know your pet's favourite hiding spots and routes",
    "Train your pet to respond to their name and come when called"
  ];

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
            <Badge className="bg-accent/10 text-accent border-accent/20 mb-4">
              <Search className="w-3 h-3 mr-1" />
              Lost Pet Guide
            </Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Lost Pet Recovery Guide
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every minute counts when your pet goes missing. Follow this comprehensive guide to maximize your chances of a happy reunion.
            </p>
          </div>
        </div>

        {/* Emergency Alert */}
        <Card className="bg-destructive/10 border-destructive/20 mb-8">
          <CardContent className="py-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-destructive mt-0.5" />
              <div>
                <h3 className="font-bold text-destructive mb-2">Pet Missing Right Now?</h3>
                <p className="text-foreground mb-4">
                  If your pet has just gone missing, act immediately. Time is critical for a successful recovery.
                </p>
                <Button variant="destructive" size="sm" asChild>
                  <Link to="/dashboard">
                    Report Lost Pet Now
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Immediate Steps */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            First 24 Hours - Critical Actions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {immediateSteps.map((step, index) => (
              <Card key={index} className="bg-gradient-card border-0 shadow-medium">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      {step.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <p className="text-muted-foreground text-sm mt-1">
                        {step.description}
                      </p>
                      {step.link && (
                        <Button variant="link" size="sm" className="px-0 h-auto mt-2" asChild>
                          <Link to={step.link}>Learn more →</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Search Tips */}
        <section className="mb-12">
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-gradient-card border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Effective Search Strategies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {searchTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Prevention is Key
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {preventionTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-12">
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Recovery Timeline</CardTitle>
              <p className="text-muted-foreground text-center">
                What to do and when during the search process
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center text-white text-sm font-bold">
                    0h
                  </div>
                  <div>
                    <h4 className="font-semibold">Immediate Response</h4>
                    <p className="text-muted-foreground text-sm">Search immediate area, call authorities, gather photos</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    2h
                  </div>
                  <div>
                    <h4 className="font-semibold">Expand Search</h4>
                    <p className="text-muted-foreground text-sm">Post on social media, contact neighbours, create flyers</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold">
                    6h
                  </div>
                  <div>
                    <h4 className="font-semibold">Community Mobilization</h4>
                    <p className="text-muted-foreground text-sm">Distribute flyers, contact media, organize search parties</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-white text-sm font-bold">
                    24h
                  </div>
                  <div>
                    <h4 className="font-semibold">Extended Network</h4>
                    <p className="text-muted-foreground text-sm">Contact rescue groups nationwide, check online databases</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <Card className="bg-gradient-hero text-white border-0">
          <CardContent className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">
              Ready to Protect Your Pet?
            </h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Don't wait for an emergency. Set up your pet's profile now with QR recovery tags and be prepared.
            </p>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/auth">
                Create Pet Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LostPetGuide;
