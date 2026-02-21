import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Crown, 
  Sparkles, 
  PawPrint, 
  QrCode, 
  MapPin, 
  FileText,
  Users,
  Bell,
  AlertTriangle,
  User,
  Smartphone,
  Gift,
  Info
} from "lucide-react";
import { Link } from "react-router-dom";
import { PLANS, formatPrice, getYearlySavings } from "@/config/pricing";

interface FeatureItemProps {
  icon: React.ReactNode;
  text: string;
}

const FeatureItem = ({ icon, text }: FeatureItemProps) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 w-5 h-5 text-primary mt-0.5">
      {icon}
    </div>
    <span className="text-sm text-foreground/80">{text}</span>
  </div>
);

interface FreePlanCardProps {
  isCurrentPlan?: boolean;
  showButton?: boolean;
  onAction?: () => void;
  variant?: 'compact' | 'full';
}

export const FreePlanCard = ({ 
  isCurrentPlan = false, 
  showButton = true, 
  onAction,
  variant = 'full'
}: FreePlanCardProps) => {
  const freeFeatures = [
    { icon: <User className="w-4 h-4" />, text: "Create your PetLinkID account" },
    { icon: <PawPrint className="w-4 h-4" />, text: "Add 1 pet profile" },
    { icon: <Bell className="w-4 h-4" />, text: "2 health reminders" },
    { icon: <QrCode className="w-4 h-4" />, text: "Link QR tags to your pet" },
    { icon: <MapPin className="w-4 h-4" />, text: "Lost & found profile page" },
    { icon: <FileText className="w-4 h-4" />, text: "Basic contact details & notes" },
  ];

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
      isCurrentPlan ? 'border-primary ring-2 ring-primary/20' : 'border-border/50'
    }`}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/10 pointer-events-none" />
      
      <div className="relative p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-semibold text-foreground">Free</span>
              {isCurrentPlan && (
                <Badge variant="secondary" className="text-xs">Current</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Perfect for getting started
            </p>
          </div>
          <div className="p-2 rounded-xl bg-muted/50">
            <PawPrint className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">Free</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Forever, no card required</p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            What's included
          </p>
          <div className="space-y-2.5">
            {freeFeatures.map((feature, i) => (
              <FeatureItem key={i} icon={feature.icon} text={feature.text} />
            ))}
          </div>
        </div>

        {/* CTA */}
        {showButton && (
          isCurrentPlan ? (
            <Button variant="outline" className="w-full" disabled>
              Current Plan
            </Button>
          ) : onAction ? (
            <Button variant="outline" className="w-full" onClick={onAction}>
              Get Started Free
            </Button>
          ) : (
            <Button variant="outline" className="w-full" asChild>
              <Link to="/auth">Get Started Free</Link>
            </Button>
          )
        )}
      </div>
    </Card>
  );
};

interface ProPlanCardProps {
  isCurrentPlan?: boolean;
  showButton?: boolean;
  isOnIOS?: boolean;
  billingPeriod?: 'monthly' | 'yearly';
  onAction?: () => void;
  checkingOut?: boolean;
  canStartTrial?: boolean;
  showSubscribe?: boolean;
  isLoggedIn?: boolean;
  variant?: 'compact' | 'full';
}

export const ProPlanCard = ({ 
  isCurrentPlan = false, 
  showButton = true, 
  isOnIOS = false,
  billingPeriod = 'monthly',
  onAction,
  checkingOut = false,
  canStartTrial = false,
  showSubscribe = false,
  isLoggedIn = false,
  variant = 'full'
}: ProPlanCardProps) => {
  const price = billingPeriod === 'monthly' 
    ? PLANS.PRO.price_monthly_aud 
    : PLANS.PRO.price_yearly_aud;
  const savings = getYearlySavings();

  const proFeatures = [
    { icon: <PawPrint className="w-4 h-4" />, text: "Unlimited pets & QR tags", hasTooltip: false },
    { icon: <Users className="w-4 h-4" />, text: "Family sharing with caregivers", hasTooltip: true, tooltipText: "Caregivers you invite can use a free PetLinkID account — they don't need to pay!" },
    { icon: <FileText className="w-4 h-4" />, text: "Document storage (vet records, etc.)", hasTooltip: false },
    { icon: <Bell className="w-4 h-4" />, text: "Unlimited health reminders", hasTooltip: false },
    { icon: <AlertTriangle className="w-4 h-4" />, text: "Priority lost-pet support", hasTooltip: false },
    { icon: <Gift className="w-4 h-4" />, text: "7-day free trial included", hasTooltip: false },
  ];

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
      isCurrentPlan 
        ? 'border-primary ring-2 ring-primary/20' 
        : 'border-primary/40 shadow-lg'
    }`}>
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/3 to-accent/5 pointer-events-none" />
      
      {/* Most Popular badge */}
      {!isCurrentPlan && (
        <div className="absolute -top-0 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-b-xl text-sm font-semibold flex items-center gap-1.5 shadow-lg">
            <Crown className="w-4 h-4" />
            Most Popular
          </div>
        </div>
      )}
      
      <div className="relative p-6 sm:p-8 pt-8 sm:pt-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-semibold text-foreground">PetLinkID Pro</span>
              {isCurrentPlan && (
                <Badge variant="default" className="text-xs">Current</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Full features for pet families
            </p>
          </div>
          <div className="p-2 rounded-xl bg-primary/10">
            <Crown className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              {formatPrice(billingPeriod === 'monthly' ? PLANS.PRO.price_monthly_aud : PLANS.PRO.price_yearly_aud / 12)}
            </span>
            <span className="text-muted-foreground">/month</span>
          </div>
          {billingPeriod === 'yearly' ? (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                Billed {formatPrice(PLANS.PRO.price_yearly_aud)}/year
              </span>
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                Save {savings}%
              </Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">
              or {formatPrice(PLANS.PRO.price_yearly_aud)}/year (save {savings}%)
            </p>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Everything in Free, plus
          </p>
          <TooltipProvider>
            <div className="space-y-2.5">
              {proFeatures.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 text-primary mt-0.5">
                    {feature.icon}
                  </div>
                  <span className="text-sm text-foreground/80 flex items-center gap-1.5">
                    {feature.text}
                    {feature.hasTooltip && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-primary cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px] text-center">
                          <p className="text-xs">{feature.tooltipText}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </TooltipProvider>
        </div>

        {/* CTA */}
        {showButton && (
          <>
            {isCurrentPlan ? (
              <Button variant="outline" className="w-full" asChild>
                <Link to="/settings/billing">Manage Subscription</Link>
              </Button>
            ) : onAction && isOnIOS && (canStartTrial || showSubscribe) ? (
              <Button 
                onClick={onAction}
                disabled={checkingOut}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 shadow-md"
              >
                {checkingOut ? (
                  <>Processing...</>
                ) : canStartTrial ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start 7-Day Free Trial
                  </>
                ) : (
                  'Subscribe Now'
                )}
              </Button>
            ) : !isOnIOS && isLoggedIn ? (
              <Button 
                onClick={onAction}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 shadow-md"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Upgrade in iOS App
              </Button>
            ) : (
              <Button 
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 shadow-md"
                asChild
              >
                <Link to={isLoggedIn ? "/pricing" : "/auth"}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isLoggedIn ? "See How to Upgrade" : "Start Free Trial"}
                </Link>
              </Button>
            )}

            <p className="text-xs text-center text-muted-foreground mt-3">
              {isOnIOS 
                ? 'Cancel anytime in App Store settings'
                : 'Subscribe via iOS app • Cancel anytime'
              }
            </p>
          </>
        )}
      </div>
    </Card>
  );
};

interface BillingToggleProps {
  billingPeriod: 'monthly' | 'yearly';
  onToggle: (period: 'monthly' | 'yearly') => void;
}

export const BillingToggle = ({ billingPeriod, onToggle }: BillingToggleProps) => {
  const savings = getYearlySavings();
  
  return (
    <div className="flex items-center justify-center gap-1 p-1 bg-muted rounded-xl max-w-xs mx-auto">
      <button
        onClick={() => onToggle('monthly')}
        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
          billingPeriod === 'monthly'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Monthly
      </button>
      <button
        onClick={() => onToggle('yearly')}
        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
          billingPeriod === 'yearly'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Yearly
        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full font-semibold">
          -{savings}%
        </span>
      </button>
    </div>
  );
};

// Simple pricing cards for the home page
export const HomePricingCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
      <FreePlanCard showButton={true} />
      <ProPlanCard showButton={true} isLoggedIn={false} />
    </div>
  );
};
