import { Capacitor } from '@capacitor/core';
import { checkForceIOS } from '@/lib/platformUtils';

/**
 * Hook to detect if running in a native app environment
 * Also supports forceIOS dev mode via sessionStorage
 */
export function useIsNativeApp(): boolean {
  // Direct call - always fresh check (no useMemo to avoid stale values)
  return checkForceIOS() || Capacitor.isNativePlatform();
}

/**
 * Hook to detect if running specifically on iOS
 * Also supports forceIOS dev mode via sessionStorage
 */
export function useIsIOSApp(): boolean {
  return checkForceIOS() || Capacitor.getPlatform() === 'ios';
}

/**
 * Hook to detect if running specifically on Android
 */
export function useIsAndroidApp(): boolean {
  return Capacitor.getPlatform() === 'android';
}
