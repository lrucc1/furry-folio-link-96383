import { useMemo } from 'react';
import { Capacitor } from '@capacitor/core';

/**
 * Check URL param for development iOS preview mode
 */
function checkForceIOS(): boolean {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get('forceIOS') === 'true';
  }
  return false;
}

/**
 * Hook to detect if running in a native app environment
 * Also supports ?forceIOS=true URL param for development testing
 */
export function useIsNativeApp(): boolean {
  return useMemo(() => checkForceIOS() || Capacitor.isNativePlatform(), []);
}

/**
 * Hook to detect if running specifically on iOS
 * Also supports ?forceIOS=true URL param for development testing
 */
export function useIsIOSApp(): boolean {
  return useMemo(() => checkForceIOS() || Capacitor.getPlatform() === 'ios', []);
}

/**
 * Hook to detect if running specifically on Android
 */
export function useIsAndroidApp(): boolean {
  return useMemo(() => Capacitor.getPlatform() === 'android', []);
}
