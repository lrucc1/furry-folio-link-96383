/**
 * Platform detection utilities
 * Shared utilities for detecting native/iOS platforms with development override support
 */

/**
 * Check if forceIOS URL param is set (for development testing)
 */
export function checkForceIOS(): boolean {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get('forceIOS') === 'true';
  }
  return false;
}
