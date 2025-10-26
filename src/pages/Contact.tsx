import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Send
} from "lucide-react";

const Contact = () => {
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
              Contact Us
            </Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions about PetLinkID? We're here to help you and your furry friends.
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardContent className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              
              <h2 className="text-2xl font-bold mb-4">Email Support</h2>
              
              <p className="text-muted-foreground mb-6">
                Have questions or need assistance? Send us an email and we'll get back to you as soon as possible.
              </p>
              
              <Button asChild size="lg" className="w-full sm:w-auto">
                <a href="mailto:support@petlinkid.io">
                  <Mail className="w-4 h-4 mr-2" />
                  support@petlinkid.io
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Contact;