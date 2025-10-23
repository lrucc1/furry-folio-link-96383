import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PLANS, formatPrice, getYearlySavings } from '@/config/pricing';
import { useState } from 'react';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
  reason?: string;
}

export function PaywallModal({ open, onOpenChange, feature, reason }: PaywallModalProps) {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const price = billingPeriod === 'monthly' 
    ? PLANS.PRO.price_monthly_aud 
    : PLANS.PRO.price_yearly_aud;

  const savings = getYearlySavings();

  const proBenefits = [
    'Unlimited pet profiles',
    'Full caregiver access (read & write)',
    'Unlimited health reminders',
    'Large document storage (5GB)',
    'Data export capability',
    'Priority support',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Crown className="w-6 h-6 text-primary" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            {reason || `${feature} is a Pro feature. Upgrade to unlock full access.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Billing Period Toggle */}
          <div className="flex items-center justify-center gap-2 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors relative ${
                billingPeriod === 'yearly'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                Save {savings}%
              </span>
            </button>
          </div>

          {/* Price */}
          <div className="text-center">
            <div className="text-4xl font-bold">{formatPrice(price)}</div>
            <div className="text-muted-foreground">
              per {billingPeriod === 'monthly' ? 'month' : 'year'}
            </div>
            {billingPeriod === 'yearly' && (
              <div className="text-sm text-primary mt-1">
                That's just {formatPrice(price / 12)}/month
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <div className="font-semibold">Everything in Pro:</div>
            <div className="grid gap-2">
              {proBenefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Button 
            onClick={() => {
              onOpenChange(false);
              navigate('/pricing');
            }}
            size="lg"
            className="w-full"
          >
            <Crown className="w-4 h-4 mr-2" />
            Start 7-Day Free Trial
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Full Pro features for 7 days. Cancel anytime during trial at no charge.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
