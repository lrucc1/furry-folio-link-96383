import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  ArrowLeft,
  Heart,
  Users,
  Target,
  Award,
  MapPin,
  Calendar
} from "lucide-react";

const About = () => {
  const stats = [
    { number: "25,000+", label: "Pets Protected", icon: <Heart className="w-5 h-5" /> },
    { number: "10,000+", label: "Happy Families", icon: <Users className="w-5 h-5" /> },
    { number: "500+", label: "Pets Reunited", icon: <Target className="w-5 h-5" /> },
    { number: "4.9★", label: "App Rating", icon: <Award className="w-5 h-5" /> }
  ];

  const teamMembers = [
    {
      name: "Sarah Chen",
      role: "Founder & CEO",
      bio: "Former veterinary nurse with 15+ years experience in animal care and technology.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Dr. Michael Thompson",
      role: "Chief Veterinary Officer",
      bio: "Licensed veterinarian and pet health advocate with expertise in preventive care.",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Emma Rodriguez",
      role: "Head of Technology",
      bio: "Software engineer passionate about creating technology that keeps pets safe.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face"
    }
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
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <Heart className="w-3 h-3 mr-1" />
              About Us
            </Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Our Mission: Keeping Pets Safe
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're a passionate team of pet lovers, veterinarians, and technologists dedicated to creating the world's most comprehensive pet protection platform.
            </p>
          </div>
        </div>

        {/* Stats */}
        <section className="mb-16">
          <div className="grid md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-gradient-card border-0 shadow-medium text-center">
                <CardContent className="py-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mx-auto mb-4">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="mb-16">
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Our Story</CardTitle>
            </CardHeader>
            <CardContent className="max-w-3xl mx-auto">
              <div className="space-y-6 text-muted-foreground">
                <p>
                  PetLinkID was born from a personal experience that every pet owner dreads. When our founder Sarah's beloved rescue dog Max went missing for three terrifying days in 2022, she realized how fragmented and ineffective existing pet recovery systems were.
                </p>
                <p>
                  After Max was safely returned home (thanks to a kind stranger and a barely readable ID tag), Sarah knew there had to be a better way. She assembled a team of veterinarians, technologists, and pet industry experts to create a comprehensive solution that would give every pet the best chance of coming home safe.
                </p>
                <p>
                  Today, PetLinkID serves thousands of families worldwide from our base in Victoria, Australia, providing peace of mind through innovative QR technology, comprehensive health tracking, and a community committed to keeping pets safe and healthy.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Mission & Values */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="bg-gradient-card border-0 shadow-medium">
              <CardHeader className="text-center">
                <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  To revolutionize pet safety and health management through innovative technology, ensuring every pet has the best chance of living a long, healthy, and protected life.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-medium">
              <CardHeader className="text-center">
                <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Our Values</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Compassion, innovation, and reliability guide everything we do. We believe every pet deserves protection and every family deserves peace of mind.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-medium">
              <CardHeader className="text-center">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Our Community</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  We're building a global network of pet owners, veterinarians, shelters, and caring individuals all working together to keep pets safe worldwide.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Team */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The passionate people behind PetLinkID, dedicated to keeping your furry family members safe.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="bg-gradient-card border-0 shadow-medium">
                <CardContent className="text-center py-8">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="font-bold text-lg text-foreground mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Company Info */}
        <section className="mb-16">
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Headquarters</h4>
                      <p className="text-muted-foreground text-sm">
                        Melbourne, VIC 3000<br />
                        Australia
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Founded</h4>
                      <p className="text-muted-foreground text-sm">2022</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Certifications</h4>
                    <ul className="text-muted-foreground text-sm space-y-1">
                      <li>• ISO 27001 Security Certified</li>
                      <li>• Australian Privacy Principles Compliant</li>
                      <li>• Veterinary Industry Approved</li>
                      <li>• RSPCA Partnership Member</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <Card className="bg-gradient-hero text-white border-0">
          <CardContent className="text-center py-12">
            <Heart className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">
              Join Our Mission
            </h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Ready to give your pet the protection they deserve? Join thousands of families worldwide who trust PetLinkID.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" asChild>
                <Link to="/auth">
                  Get Started Free
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link to="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default About;
