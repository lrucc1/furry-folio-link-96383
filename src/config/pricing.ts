/**
 * Pricing v2 Configuration
 * Single source of truth for plans, entitlements, and pricing
 */

export const TRIAL_DAYS = parseInt(import.meta.env.VITE_TRIAL_DAYS || '7', 10);
export const FREE_DOCS_STORAGE_MB = parseInt(import.meta.env.VITE_FREE_DOCS_STORAGE_MB || '0', 10);
export const PREMIUM_DOCS_STORAGE_MB = parseInt(import.meta.env.VITE_PREMIUM_DOCS_STORAGE_MB || '50', 10);
export const FAMILY_DOCS_STORAGE_MB = parseInt(import.meta.env.VITE_FAMILY_DOCS_STORAGE_MB || '200', 10);

// Stripe Price IDs (AUD) - Import from centralized config
import { getPriceId, isCheckoutAvailable } from '@/lib/stripeConfig';

// Updated Stripe Price IDs for 2025 pricing
export const STRIPE_PRICE_PREMIUM_MONTHLY_AUD = import.meta.env.VITE_STRIPE_PRICE_PREMIUM_MONTHLY_AUD || '';
export const STRIPE_PRICE_PREMIUM_YEARLY_AUD = import.meta.env.VITE_STRIPE_PRICE_PREMIUM_YEARLY_AUD || '';
export const STRIPE_PRICE_FAMILY_MONTHLY_AUD = import.meta.env.VITE_STRIPE_PRICE_FAMILY_MONTHLY_AUD || '';
export const STRIPE_PRICE_FAMILY_YEARLY_AUD = import.meta.env.VITE_STRIPE_PRICE_FAMILY_YEARLY_AUD || '';

export type PlanType = 'FREE' | 'PREMIUM' | 'FAMILY';

export interface PlanEntitlements {
  pets_max: number | null; // null = unlimited
  caregivers_readonly_max: number;
  caregivers_readwrite_enabled: boolean;
  reminders_active_max: number | null; // null = unlimited
  docs_storage_mb: number;
  export_enabled: boolean;
  priority_support: boolean;
}

export interface PlanConfig {
  id: PlanType;
  name: string;
  description: string;
  price_monthly_aud: number;
  price_yearly_aud: number;
  stripe_price_monthly: string;
  stripe_price_yearly: string;
  entitlements: PlanEntitlements;
}

export const PLANS: Record<PlanType, PlanConfig> = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    description: 'Basic pet profiles and lost pet alerts',
    price_monthly_aud: 0,
    price_yearly_aud: 0,
    stripe_price_monthly: '',
    stripe_price_yearly: '',
    entitlements: {
      pets_max: 1,
      caregivers_readonly_max: 0,
      caregivers_readwrite_enabled: false,
      reminders_active_max: null, // unlimited reminders
      docs_storage_mb: FREE_DOCS_STORAGE_MB,
      export_enabled: false,
      priority_support: false,
    },
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium',
    description: 'Up to 5 pets with family sharing',
    price_monthly_aud: 4.49,
    price_yearly_aud: 48.44, // 10% discount
    stripe_price_monthly: STRIPE_PRICE_PREMIUM_MONTHLY_AUD,
    stripe_price_yearly: STRIPE_PRICE_PREMIUM_YEARLY_AUD,
    entitlements: {
      pets_max: 5,
      caregivers_readonly_max: 5,
      caregivers_readwrite_enabled: true,
      reminders_active_max: null, // unlimited
      docs_storage_mb: PREMIUM_DOCS_STORAGE_MB,
      export_enabled: true,
      priority_support: true,
    },
  },
  FAMILY: {
    id: 'FAMILY',
    name: 'Family',
    description: 'Unlimited pets for families',
    price_monthly_aud: 7.99,
    price_yearly_aud: 86.29, // 10% discount
    stripe_price_monthly: STRIPE_PRICE_FAMILY_MONTHLY_AUD,
    stripe_price_yearly: STRIPE_PRICE_FAMILY_YEARLY_AUD,
    entitlements: {
      pets_max: null, // unlimited
      caregivers_readonly_max: 10,
      caregivers_readwrite_enabled: true,
      reminders_active_max: null, // unlimited
      docs_storage_mb: FAMILY_DOCS_STORAGE_MB,
      export_enabled: true,
      priority_support: true,
    },
  },
};

export const ENTITLEMENTS = {
  FREE: PLANS.FREE.entitlements,
  PREMIUM: PLANS.PREMIUM.entitlements,
  FAMILY: PLANS.FAMILY.entitlements,
};

export function getEntitlements(plan: PlanType): PlanEntitlements {
  return PLANS[plan].entitlements;
}

export function formatPrice(amount: number): string {
  return `A$${amount.toFixed(2)}`;
}

export function getYearlySavings(plan: 'PREMIUM' | 'FAMILY' = 'PREMIUM'): number {
  const monthlyTotal = PLANS[plan].price_monthly_aud * 12;
  const yearlyTotal = PLANS[plan].price_yearly_aud;
  return Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100);
}
