/**
 * Pricing v2 Configuration
 * Single source of truth for plans, entitlements, and pricing
 */

export const TRIAL_DAYS = parseInt(import.meta.env.VITE_TRIAL_DAYS || '7', 10);
export const FREE_DOCS_STORAGE_MB = parseInt(import.meta.env.VITE_FREE_DOCS_STORAGE_MB || '100', 10);
export const PRO_DOCS_STORAGE_MB = parseInt(import.meta.env.VITE_PRO_DOCS_STORAGE_MB || '5000', 10);

// Stripe Price IDs (AUD) - Import from centralized config
import { getPriceId, isCheckoutAvailable } from '@/lib/stripeConfig';

// Stripe Price IDs for PRO plan
export const STRIPE_PRICE_PRO_MONTHLY_AUD = import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY_AUD || '';
export const STRIPE_PRICE_PRO_YEARLY_AUD = import.meta.env.VITE_STRIPE_PRICE_PRO_YEARLY_AUD || '';

export type PlanType = 'FREE' | 'PRO';

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
    description: 'Perfect for getting started with one pet',
    price_monthly_aud: 0,
    price_yearly_aud: 0,
    stripe_price_monthly: '',
    stripe_price_yearly: '',
    entitlements: {
      pets_max: 1,
      caregivers_readonly_max: 1,
      caregivers_readwrite_enabled: false,
      reminders_active_max: 2,
      docs_storage_mb: FREE_DOCS_STORAGE_MB,
      export_enabled: false,
      priority_support: false,
    },
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    description: 'Full features for pet families',
    price_monthly_aud: 2.99,
    price_yearly_aud: 28.99,
    stripe_price_monthly: STRIPE_PRICE_PRO_MONTHLY_AUD,
    stripe_price_yearly: STRIPE_PRICE_PRO_YEARLY_AUD,
    entitlements: {
      pets_max: null, // unlimited
      caregivers_readonly_max: 999,
      caregivers_readwrite_enabled: true,
      reminders_active_max: null, // unlimited
      docs_storage_mb: PRO_DOCS_STORAGE_MB,
      export_enabled: true,
      priority_support: true,
    },
  },
};

export const ENTITLEMENTS = {
  FREE: PLANS.FREE.entitlements,
  PRO: PLANS.PRO.entitlements,
};

export function getEntitlements(plan: PlanType | string): PlanEntitlements {
  // Map legacy plan types to current structure
  const normalizedPlan = normalizePlanType(plan);
  return PLANS[normalizedPlan].entitlements;
}

// Helper function to normalize legacy plan types
function normalizePlanType(plan: PlanType | string): PlanType {
  const planUpper = String(plan).toUpperCase();
  
  // Map legacy plans to current structure
  if (planUpper === 'PREMIUM' || planUpper === 'TRIAL' || planUpper === 'FAMILY') {
    return 'PRO';
  }
  
  // If it's a valid plan type, return it
  if (planUpper === 'PRO' || planUpper === 'FREE') {
    return planUpper as PlanType;
  }
  
  // Default to FREE for unknown plans
  console.warn(`Unknown plan type: ${plan}, defaulting to FREE`);
  return 'FREE';
}

export function formatPrice(amount: number): string {
  return `A$${amount.toFixed(2)}`;
}

export function getYearlySavings(): number {
  const monthlyTotal = PLANS.PRO.price_monthly_aud * 12;
  const yearlyTotal = PLANS.PRO.price_yearly_aud;
  return Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100);
}
