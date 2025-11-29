/**
 * Platform detection utilities
 * Shared utilities for detecting native/iOS platforms with development override support
 */

const FORCE_IOS_KEY = 'dev_force_ios';

/**
 * Check if forceIOS is active (URL param or sessionStorage)
 * Uses sessionStorage for persistence across navigations
 */
export function checkForceIOS(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check URL param first (for initial toggle)
  const params = new URLSearchParams(window.location.search);
  const urlParam = params.get('forceIOS');
  
  // If URL has explicit param, update storage and return
  if (urlParam === 'true') {
    sessionStorage.setItem(FORCE_IOS_KEY, 'true');
    return true;
  }
  if (urlParam === 'false') {
    sessionStorage.removeItem(FORCE_IOS_KEY);
    return false;
  }
  
  // Otherwise check sessionStorage
  return sessionStorage.getItem(FORCE_IOS_KEY) === 'true';
}

/**
 * Set forceIOS state in sessionStorage
 */
export function setForceIOS(enabled: boolean): void {
  if (enabled) {
    sessionStorage.setItem(FORCE_IOS_KEY, 'true');
  } else {
    sessionStorage.removeItem(FORCE_IOS_KEY);
  }
}

/**
 * Check if dev mode (forceIOS) is currently active
 */
export function isDevModeActive(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(FORCE_IOS_KEY) === 'true';
}
