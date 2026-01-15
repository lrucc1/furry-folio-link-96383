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
import { invokeWithAuth } from './invokeWithAuth';
import { log } from '@/lib/log';

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
let productConfigurationError: string | null = null;

function validateProductConfig(): boolean {
  if (!APPLE_PRO_MONTHLY_ID || !APPLE_PRO_YEARLY_ID) {
    productConfigurationError = 'In-app purchases are not configured for this build.';
    return false;
  }

  if (APPLE_PRO_MONTHLY_ID === APPLE_PRO_YEARLY_ID) {
    productConfigurationError = 'Monthly and yearly product IDs must be unique.';
    return false;
  }

  productConfigurationError = null;
  return true;
}

function ensureProductConfig(): boolean {
  if (validateProductConfig()) return true;

  toast.error(productConfigurationError ?? 'In-app purchases are misconfigured.');
  return false;
}

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
  return isNativeApp() && isIOSApp() && validateProductConfig();
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

function getReceiptData(transaction?: any): string | null {
  const store = getStore();

  return transaction?.appStoreReceipt
    ?? transaction?.appstoreReceipt
    ?? store?.applicationReceipt?.appStoreReceipt
    ?? store?.appStoreReceipt
    ?? store?.appstoreReceipt
    ?? null;
}

async function syncReceiptWithBackend(transaction?: any, fallbackProductId?: string): Promise<void> {
  const receiptData = getReceiptData(transaction);
  if (!receiptData) {
    throw new Error('Missing App Store receipt');
  }

  const productId = transaction?.productId
    || transaction?.product?.id
    || transaction?.id
    || fallbackProductId
    || null;

  const transactionId = transaction?.transactionId
    || transaction?.id
    || transaction?.originalTransactionId
    || null;

  const response = await invokeWithAuth<{ ok?: boolean; error?: string }>('validate-apple-receipt', {
    body: {
      receiptData,
      productId,
      transactionId,
    },
  });

  if (!response?.ok) {
    throw new Error(response?.error ?? 'Receipt validation failed');
  }
}

/**
 * Initialize the IAP store
 */
export async function initializeStore(): Promise<boolean> {
  if (!isAppleIAPAvailable()) {
    log.warn('[AppleIAP] Not available on this platform');
    return false;
  }

  if (!ensureProductConfig()) return false;

  if (isInitialized && getStore()) {
    return true;
  }

  const store = getStore();
  if (!store) {
    log.error('[AppleIAP] Store not available - cordova-plugin-purchase not loaded');
    productConfigurationError = 'In-app purchases are unavailable. Please reinstall from the App Store.';
    toast.error(productConfigurationError);
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
      log.debug('[AppleIAP] Transaction approved');
      try {
        await syncReceiptWithBackend(transaction);
        toast.success('Purchase verified!');
      } catch (error) {
        log.error('[AppleIAP] Failed to sync receipt:', error);
        toast.error('Could not validate your purchase. Please contact support.');
      }
      transaction.finish();
    });

    store.when().verified((receipt: any) => {
      log.debug('[AppleIAP] Receipt verified');
      receipt.finish();
    });

    store.error((error: any) => {
      log.error('[AppleIAP] Store error:', error);
      toast.error('Purchase error: ' + (error.message || 'Unknown error'));
    });

    await store.initialize([CdvPurchase.Platform.APPLE_APPSTORE]);

    const productStateInvalid = store?.ProductState?.INVALID;
    const unavailableProducts = [APPLE_PRO_MONTHLY_ID, APPLE_PRO_YEARLY_ID].filter((id) => {
      const product = store.get(id);
      return !product || (productStateInvalid && product.state === productStateInvalid);
    });

    if (unavailableProducts.length) {
      productConfigurationError = 'In-app purchase products are not recognized by the App Store.';
      toast.error(productConfigurationError);
      return false;
    }

    isInitialized = true;
    log.debug('[AppleIAP] Store initialized');
    return true;
  } catch (error) {
    log.error('[AppleIAP] Failed to initialize:', error);
    return false;
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

  if (!ensureProductConfig()) {
    throw new Error(productConfigurationError ?? 'Product IDs not configured');
  }

  const productId = getProductId(period);
  if (!productId) {
    toast.error('Product not configured.');
    throw new Error('Product ID not configured');
  }

  const initialized = await initializeStore();
  const store = getStore();
  if (!initialized || !store) {
    const message = productConfigurationError ?? 'Unable to connect to App Store.';
    toast.error(message);
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

  if (!ensureProductConfig()) return false;

  const initialized = await initializeStore();
  const store = getStore();
  if (!initialized || !store) {
    const message = productConfigurationError ?? 'Unable to connect to App Store.';
    toast.error(message);
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
    const restoredProductId = monthlyProduct?.owned
      ? APPLE_PRO_MONTHLY_ID
      : yearlyProduct?.owned
        ? APPLE_PRO_YEARLY_ID
        : undefined;

    if (hasActive) {
      try {
        await syncReceiptWithBackend(undefined, restoredProductId);
        toast.success('Subscription restored!');
        return true;
      } catch (error) {
        log.error('[AppleIAP] Failed to sync restored receipt:', error);
        toast.error('Failed to validate restored purchases');
        return false;
      }
    } else {
      toast.info('No purchases found.');
      return false;
    }
  } catch (error: any) {
    log.error('[AppleIAP] Restore failed:', error);
    toast.error('Failed to restore purchases');
    return false;
  }
}
