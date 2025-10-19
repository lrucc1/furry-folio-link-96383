import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ENV_CONFIG } from '@/config/environment';
import { PremiumInfoSheet } from '@/components/PremiumInfoSheet';

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
      '1 free lost-pet poster',
    ],
    maxPets: 1,
    popular: false,
    conversionPurpose: 'Bring users in & build trust',
  },
  premium: {
    name: 'Premium',
    price: 4.49,
    priceId: 'price_1SJk4yEhyEZfSSpN8x8KqTGY',
    priceIdAnnual: 'price_1SJk5EEhyEZfSSpNpADhN5AQ',
    productId: 'prod_TGGcRtzlK6vz7A',
    interval: 'month',
    features: [
      'Up to 5 pets',
      'Family sharing (up to 5 members)',
      'Unlimited custom lost pet posters',
      'VetShare - Share medical records with vets via QR code',
      'Document storage (50MB)',
      'Priority support',
      'Advanced health tracking',
    ],
    maxPets: 5,
    popular: true,
    conversionPurpose: 'Capture early upgrades',
  },
  family: {
    name: 'Family',
    price: 7.99,
    priceId: 'price_1SJk5TEhyEZfSSpNKpDL6ZyO',
    priceIdAnnual: 'price_1SJk9JEhyEZfSSpNFATW8hkx',
    productId: 'prod_TGGcY3nKNalPuA',
    interval: 'month',
    features: [
      'Everything in Premium',
      'Unlimited pets',
      'Family sharing (up to 10 members)',
      'Multi-household sharing',
      'VetShare - Share medical records with vets via QR code',
      'Document storage (200MB)',
      'Priority support',
    ],
    maxPets: -1,
    popular: false,
    conversionPurpose: 'Retain power users, multi-households',
  },
};

export default function Pricing() {
  const { user, subscriptionInfo, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);

  // Redirect to home if in iOS free build (no pricing page needed)
  if (!ENV_CONFIG.useInAppPurchases) {
    navigate('/');
    return null;
  }

  const handleRefreshSubscription = async () => {
    setRefreshing(true);
    await refreshSubscription();
    toast.success('Subscription status updated!');
    setRefreshing(false);
  };

  const handleSubscribe = async (tierKey: string, isAnnual: boolean = false) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const tier = SUBSCRIPTION_TIERS[tierKey as keyof typeof SUBSCRIPTION_TIERS];
    
    // Determine which price ID to use
    let priceId = tier.priceId;
    if (isAnnual && 'priceIdAnnual' in tier && tier.priceIdAnnual) {
      priceId = tier.priceIdAnnual;
    }
    
    if (!priceId) return;

    setLoading(tierKey);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
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
          {user && subscriptionInfo.subscribed && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <p className="text-sm text-muted-foreground">
                Current plan: <span className="font-semibold capitalize">{subscriptionInfo.tier}</span>
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleRefreshSubscription}
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing...' : 'Refresh Status'}
              </Button>
            </div>
          )}
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

              <div className="space-y-2">
                <Button
                  className="w-full"
                  variant={tier.popular ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(key, false)}
                  disabled={loading === key || (key === 'free' || (subscriptionInfo.tier === key))}
                >
                  {loading === key
                    ? 'Loading...'
                    : subscriptionInfo.tier === key
                    ? 'Current Plan'
                    : key === 'free'
                    ? 'Free Forever'
                    : 'Subscribe Monthly'}
                </Button>
                
                {(key === 'premium' || key === 'family') && (
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => handleSubscribe(key, true)}
                    disabled={loading === key || (subscriptionInfo.tier === key)}
                  >
                    {loading === key
                      ? 'Loading...'
                      : 'Subscribe Annually (10% off)'}
                  </Button>
                )}
              </div>
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
      
      <Footer />
    </div>
  );
}
