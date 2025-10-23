/**
 * Centralized Stripe Configuration
 * Single source of truth for Stripe settings and price IDs
 */

// Stripe Publishable Key (client-side safe)
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// Stripe Price IDs
const PRICE_ID_PRO_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY_AUD || '';
const PRICE_ID_PRO_YEARLY = import.meta.env.VITE_STRIPE_PRICE_PRO_YEARLY_AUD || '';

export type BillingPeriod = 'monthly' | 'yearly';
export type PlanKey = 'PRO';

/**
 * Get Stripe Price ID for a plan and billing period
 * @throws Error if price ID is not configured
 */
export function getPriceId(plan: PlanKey, period: BillingPeriod): string {
  const priceId = period === 'monthly' ? PRICE_ID_PRO_MONTHLY : PRICE_ID_PRO_YEARLY;
  
  if (!priceId) {
    throw new Error(
      `Stripe ${period} price ID not configured. Please set VITE_STRIPE_PRICE_PRO_${period.toUpperCase()}_AUD in environment settings.`
    );
  }
  
  return priceId;
}

/**
 * Check if Stripe is fully configured
 */
export function isStripeConfigured(): boolean {
  return !!(PRICE_ID_PRO_MONTHLY && PRICE_ID_PRO_YEARLY && STRIPE_PUBLISHABLE_KEY);
}

/**
 * Check if checkout is available for a specific period
 */
export function isCheckoutAvailable(period: BillingPeriod): boolean {
  const priceId = period === 'monthly' ? PRICE_ID_PRO_MONTHLY : PRICE_ID_PRO_YEARLY;
  return !!priceId;
}

/**
 * Get user-friendly configuration status message
 */
export function getStripeConfigStatus(): { configured: boolean; message?: string } {
  if (!STRIPE_PUBLISHABLE_KEY) {
    return {
      configured: false,
      message: 'Stripe publishable key not configured'
    };
  }
  
  const missingPrices = [];
  if (!PRICE_ID_PRO_MONTHLY) missingPrices.push('monthly');
  if (!PRICE_ID_PRO_YEARLY) missingPrices.push('yearly');
  
  if (missingPrices.length > 0) {
    return {
      configured: false,
      message: `Stripe ${missingPrices.join(' and ')} price ID${missingPrices.length > 1 ? 's' : ''} not configured`
    };
  }
  
  return { configured: true };
}
