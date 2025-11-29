import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { checkForceIOS } from './platformUtils';

/**
 * iOS Payment Flow Handler
 * 
 * Handles the payment flow for iOS apps where in-app purchases are not allowed.
 * Opens the web checkout in Safari, and handles deep link return after payment.
 */

export const isNativeApp = () => {
  return checkForceIOS() || Capacitor.isNativePlatform();
};

export const isIOSApp = () => {
  return checkForceIOS() || Capacitor.getPlatform() === 'ios';
};

/**
 * Opens the web checkout in Safari for iOS apps
 * After payment, user will be redirected back to app via deep link
 */
export async function openWebCheckout(userId?: string) {
  if (!isIOSApp()) {
    console.warn('openWebCheckout called on non-iOS platform');
    return;
  }

  const baseUrl = import.meta.env.VITE_WEB_URL || 'https://petlinkid.io';
  const checkoutUrl = userId 
    ? `${baseUrl}/pricing?source=ios&userId=${userId}`
    : `${baseUrl}/pricing?source=ios`;

  try {
    await Browser.open({ 
      url: checkoutUrl,
      presentationStyle: 'popover'
    });
  } catch (error) {
    console.error('Failed to open web checkout:', error);
    // Fallback to window.open if Browser plugin fails
    window.open(checkoutUrl, '_blank');
  }
}

/**
 * Checks if the current request is from iOS app returning from web checkout
 */
export function isReturningFromWebCheckout() {
  if (!isNativeApp()) return false;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('source') === 'ios';
}

/**
 * Redirects back to the iOS app via deep link
 * Call this from the success page after payment is complete
 */
export function returnToIOSApp(path: string = '/dashboard') {
  if (!isNativeApp()) {
    console.warn('returnToIOSApp called on non-native platform');
    return;
  }

  // Use custom URL scheme to reopen the app
  const deepLink = `petlinkid://${path.replace(/^\//, '')}`;
  
  setTimeout(() => {
    window.location.href = deepLink;
  }, 2000); // 2 second delay to show success message
}
