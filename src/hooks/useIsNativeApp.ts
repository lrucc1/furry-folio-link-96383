import { useMemo } from 'react';
import { Capacitor } from '@capacitor/core';

/**
 * Hook to detect if running in a native app environment
 */
export function useIsNativeApp(): boolean {
  return useMemo(() => Capacitor.isNativePlatform(), []);
}

/**
 * Hook to detect if running specifically on iOS
 */
export function useIsIOSApp(): boolean {
  return useMemo(() => Capacitor.getPlatform() === 'ios', []);
}

/**
 * Hook to detect if running specifically on Android
 */
export function useIsAndroidApp(): boolean {
  return useMemo(() => Capacitor.getPlatform() === 'android', []);
}
