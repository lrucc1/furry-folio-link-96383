import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import log from '@/lib/log';
import { 
  QrCode, 
  Wifi, 
  MapPin, 
  Shield, 
  Zap, 
  Heart,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export default function SmartRecoveryTags() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    likelihood: 3,
    features: [] as string[],
    comments: ''
  });

  const featureOptions = [
    { id: 'qr', label: 'QR code' },
    { id: 'nfc', label: 'NFC' },
    { id: 'gps', label: 'GPS tracking' },
    { id: 'metal', label: 'Metal finish' },
    { id: 'sos', label: 'SOS button' }
  ];

  const handleFeatureToggle = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await (supabase as any)
        .from('smart_tag_interest')
        .insert({
          email: formData.email,
          name: formData.name || null,
          likelihood: formData.likelihood,
          features: formData.features.length > 0 ? formData.features : null,
          comments: formData.comments || null
        });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Thanks for your interest!",
        description: "We'll be in touch soon with updates about Smart Tags."
      });
    } catch (error) {
      log.error('Error submitting interest:', error);
      toast({
        title: 'Submission failed',
        description: 'Please try again or contact us directly.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      email: '',
      name: '',
      likelihood: 3,
      features: [],
      comments: ''
    });
  };

  const features = [
    {
      icon: QrCode,
      title: 'QR Code Technology',
      description: 'Instant access to your pet\'s profile with a quick scan from any smartphone.'
    },
    {
      icon: Wifi,
      title: 'NFC Smart Tags',
      description: 'Tap-to-access functionality with no app required. Pro metal finish included.'
    },
    {
      icon: MapPin,
      title: 'GPS Tracking',
      description: 'Real-time location tracking with geo-fence alerts and emergency SOS features.'
    },
    {
      icon: Shield,
      title: 'Privacy Protected',
      description: 'Your contact information stays private. Finders connect through our secure platform.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-12 bg-gradient-hero text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-white/20 text-white border-white/30 mb-6 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 mr-1" />
              Coming Soon
            </Badge>
            
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Smart Tags
              <span className="block text-xl lg:text-2xl font-normal text-white/80 mt-2">
                Revolutionary pet ID technology — launching soon
              </span>
            </h1>
            
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              We're developing the next generation of pet recovery technology using QR codes, NFC, and GPS. 
              Be the first to know when we launch and help shape the features that matter most to you.
            </p>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              What We're Building
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Smart recovery solutions designed to reunite you with your pet faster than ever.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interest Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  {submitted ? "Thanks for registering!" : "Register Your Interest"}
                </CardTitle>
                <CardDescription>
                  {submitted 
                    ? "We'll be in touch with updates and early access opportunities."
                    : "Help us create the perfect smart tag by sharing what matters most to you."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-muted-foreground">
                      Thanks! We'll be in touch.
                    </p>
                    <Button variant="outline" onClick={resetForm}>
                      Tell us more
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Name (optional)</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="likelihood">How likely are you to buy?</Label>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Not likely</span>
                        <div className="flex gap-2 flex-1 justify-center">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, likelihood: rating }))}
                              className={`w-10 h-10 rounded-full border-2 transition-colors ${
                                formData.likelihood === rating
                                  ? 'bg-primary border-primary text-primary-foreground'
                                  : 'border-muted hover:border-primary'
                              }`}
                            >
                              {rating}
                            </button>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">Very likely</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>What features matter most?</Label>
                      {featureOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={option.id}
                            checked={formData.features.includes(option.id)}
                            onCheckedChange={() => handleFeatureToggle(option.id)}
                          />
                          <label
                            htmlFor={option.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="comments">Anything we should know?</Label>
                      <Textarea
                        id="comments"
                        value={formData.comments}
                        onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                        placeholder="Tell us what you'd like to see in smart pet tags..."
                        rows={4}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4 mr-2" />
                          Register interest
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Smart Tags Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Why Smart Tags?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Traditional pet tags only show a phone number. Our smart tags connect finders directly to your pet's 
              complete profile, medical information, and emergency contacts — all while keeping your privacy protected. 
              Get instant notifications when your pet is found, with GPS coordinates and direct communication through 
              our secure platform.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-primary" />
              <span>Expected launch: 2025</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
