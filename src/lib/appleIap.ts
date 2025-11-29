/**
 * Apple In-App Purchase Integration for iOS
 * 
 * Uses cordova-plugin-purchase for StoreKit integration.
 * Supabase profiles table remains the source of truth for plan state.
 */

import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { checkForceIOS } from './platformUtils';

// Re-use types from stripeConfig for consistency
export type BillingPeriod = 'monthly' | 'yearly';
export type PlanKey = 'PRO';

// Apple Product IDs from environment
const APPLE_PRO_MONTHLY_ID = import.meta.env.VITE_APPLE_PRO_MONTHLY_PRODUCT_ID || '';
const APPLE_PRO_YEARLY_ID = import.meta.env.VITE_APPLE_PRO_YEARLY_PRODUCT_ID || '';

// Global store reference (cordova-plugin-purchase adds to window.CdvPurchase)
declare global {
  interface Window {
    CdvPurchase?: any;
  }
}

let isInitialized = false;

/**
 * Check if running in native iOS app (or forceIOS dev mode)
 */
export function isNativeApp(): boolean {
  return checkForceIOS() || Capacitor.isNativePlatform();
}

/**
 * Check if running specifically on iOS (or forceIOS dev mode)
 */
export function isIOSApp(): boolean {
  return checkForceIOS() || Capacitor.getPlatform() === 'ios';
}

/**
 * Check if Apple IAP is available
 */
export function isAppleIAPAvailable(): boolean {
  return isNativeApp() && isIOSApp() && !!APPLE_PRO_MONTHLY_ID && !!APPLE_PRO_YEARLY_ID;
}

/**
 * Get the Apple product ID for a billing period
 */
function getProductId(period: BillingPeriod): string {
  return period === 'monthly' ? APPLE_PRO_MONTHLY_ID : APPLE_PRO_YEARLY_ID;
}

/**
 * Get the store instance
 */
function getStore(): any {
  return window.CdvPurchase?.store;
}

/**
 * Initialize the IAP store
 */
export async function initializeStore(): Promise<boolean> {
  if (!isAppleIAPAvailable()) {
    console.warn('[AppleIAP] Not available on this platform');
    return false;
  }

  if (isInitialized && getStore()) {
    return true;
  }

  const store = getStore();
  if (!store) {
    console.error('[AppleIAP] Store not available - cordova-plugin-purchase not loaded');
    return false;
  }

  try {
    const CdvPurchase = window.CdvPurchase;
    
    store.verbosity = store.DEBUG;

    // Register products
    store.register([
      {
        id: APPLE_PRO_MONTHLY_ID,
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        platform: CdvPurchase.Platform.APPLE_APPSTORE,
      },
      {
        id: APPLE_PRO_YEARLY_ID,
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        platform: CdvPurchase.Platform.APPLE_APPSTORE,
      },
    ]);

    // Handle approved transactions
    store.when().approved(async (transaction: any) => {
      console.log('[AppleIAP] Transaction approved:', transaction.id);
      await updateProfileAfterPurchase(transaction);
      transaction.finish();
    });

    store.when().verified((receipt: any) => {
      console.log('[AppleIAP] Receipt verified');
      receipt.finish();
    });

    store.error((error: any) => {
      console.error('[AppleIAP] Store error:', error);
      toast.error('Purchase error: ' + (error.message || 'Unknown error'));
    });

    await store.initialize([CdvPurchase.Platform.APPLE_APPSTORE]);
    isInitialized = true;
    console.log('[AppleIAP] Store initialized');
    return true;
  } catch (error) {
    console.error('[AppleIAP] Failed to initialize:', error);
    return false;
  }
}

/**
 * Update Supabase profile after successful purchase
 */
async function updateProfileAfterPurchase(transaction: any): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const expiryDate = transaction.expirationDate 
      ? new Date(transaction.expirationDate).toISOString() 
      : null;

    const { error } = await supabase
      .from('profiles')
      .update({
        plan_v2: 'PRO',
        subscription_status: 'active',
        plan_source: 'apple',
        next_billing_at: expiryDate,
        plan_updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) throw error;
    console.log('[AppleIAP] Profile updated to PRO');
  } catch (error) {
    console.error('[AppleIAP] Error updating profile:', error);
    throw error;
  }
}

/**
 * Purchase PRO subscription via Apple IAP
 */
export async function purchasePro(period: BillingPeriod): Promise<void> {
  if (!isNativeApp() || !isIOSApp()) {
    toast.error('In-app purchases are only available on the iOS app.');
    throw new Error('Apple IAP not available');
  }

  const productId = getProductId(period);
  if (!productId) {
    toast.error('Product not configured.');
    throw new Error('Product ID not configured');
  }

  const initialized = await initializeStore();
  const store = getStore();
  if (!initialized || !store) {
    toast.error('Unable to connect to App Store.');
    throw new Error('Store not initialized');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    toast.error('Please sign in to purchase.');
    throw new Error('User not authenticated');
  }

  try {
    const product = store.get(productId);
    if (!product) {
      toast.error('Product not found.');
      throw new Error('Product not found');
    }

    const offer = product.getOffer();
    if (!offer) {
      toast.error('No offer available.');
      throw new Error('No offer available');
    }

    await store.order(offer);
    toast.success('Processing purchase...');
  } catch (error: any) {
    if (error.code === 'E_USER_CANCELLED' || error.message?.includes('cancel')) {
      toast.info('Purchase cancelled');
      return;
    }
    toast.error('Purchase failed');
    throw error;
  }
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<boolean> {
  if (!isNativeApp() || !isIOSApp()) {
    toast.error('Restore is only available on iOS.');
    return false;
  }

  const initialized = await initializeStore();
  const store = getStore();
  if (!initialized || !store) {
    toast.error('Unable to connect to App Store.');
    return false;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    toast.error('Please sign in first.');
    return false;
  }

  try {
    toast.info('Checking for purchases...');
    await store.restorePurchases();

    const monthlyProduct = store.get(APPLE_PRO_MONTHLY_ID);
    const yearlyProduct = store.get(APPLE_PRO_YEARLY_ID);
    const hasActive = monthlyProduct?.owned || yearlyProduct?.owned;

    if (hasActive) {
      await supabase
        .from('profiles')
        .update({
          plan_v2: 'PRO',
          subscription_status: 'active',
          plan_source: 'apple',
          plan_updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      toast.success('Subscription restored!');
      return true;
    } else {
      toast.info('No purchases found.');
      return false;
    }
  } catch (error: any) {
    console.error('[AppleIAP] Restore failed:', error);
    toast.error('Failed to restore purchases');
    return false;
  }
}
