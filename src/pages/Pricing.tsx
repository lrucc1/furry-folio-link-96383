import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    productId: null,
    interval: 'forever',
    features: [
      'Up to 1 pet',
      'Basic pet profiles',
      'Lost pet alerts',
      'Health reminders',
    ],
    maxPets: 1,
    popular: false,
  },
  premium: {
    name: 'Premium',
    price: 9.99,
    priceId: 'price_1SF7X8EhyEZfSSpNyU9Qv14q',
    productId: 'prod_TBUW3WogN0dEtQ',
    interval: 'month',
    features: [
      'Unlimited pets',
      'Family sharing (up to 5 members)',
      'Custom lost pet posters',
      'Document storage (50MB)',
      'Priority support',
      'Advanced health tracking',
    ],
    maxPets: -1,
    popular: true,
  },
  family: {
    name: 'Family',
    price: 14.99,
    priceId: 'price_1SF7YIEhyEZfSSpN9pnfDV1Q',
    productId: 'prod_TBUX7Ubgxwr3co',
    interval: 'month',
    features: [
      'Unlimited pets',
      'Family sharing (up to 10 members)',
      'Custom lost pet posters',
      'Document storage (200MB)',
      'Priority support',
      'Advanced health tracking',
      'Multiple households',
    ],
    maxPets: -1,
    popular: false,
  },
};

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tierKey: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const tier = SUBSCRIPTION_TIERS[tierKey as keyof typeof SUBSCRIPTION_TIERS];
    if (!tier.priceId) return;

    setLoading(tierKey);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: tier.priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground">
            Start free and upgrade as your pet family grows
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => (
            <Card
              key={key}
              className={`p-8 relative ${
                tier.popular
                  ? 'border-primary shadow-lg scale-105'
                  : 'border-border'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">{tier.name}</h2>
                <div className="mb-4">
                  <span className="text-4xl font-bold">
                    ${tier.price}
                  </span>
                  <span className="text-muted-foreground">
                    {tier.price === 0 ? '' : `/${tier.interval}`}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={tier.popular ? 'default' : 'outline'}
                onClick={() => handleSubscribe(key)}
                disabled={loading === key || key === 'free'}
              >
                {loading === key
                  ? 'Loading...'
                  : key === 'free'
                  ? 'Current Plan'
                  : 'Subscribe Now'}
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            All plans include secure data storage and 24/7 access to your pet's information
          </p>
          <p className="text-sm text-muted-foreground">
            Prices in AUD. Cancel anytime. No hidden fees.
          </p>
        </div>
      </main>
    </div>
  );
}
