/**
 * Environment Configuration & Validation
 * Validates environment variables and provides runtime environment detection
 */

import { Capacitor } from '@capacitor/core';

export type AppEnvironment = 'production' | 'development' | 'preview';

/**
 * Determine if we're running inside a native Capacitor shell
 */
function isNativeApp(): boolean {
  const platform = Capacitor.getPlatform?.();
  const isNativePlatform = Capacitor.isNativePlatform?.() ?? false;

  return isNativePlatform || platform === 'ios' || platform === 'android';
}

/**
 * Detect current environment based on hostname
 */
export function detectEnvironment(): AppEnvironment {
  if (typeof window === 'undefined') return 'development';

  const protocol = window.location.protocol;
  const nativeApp = isNativeApp();

  // Packaged native builds use custom schemes like capacitor://localhost
  if (nativeApp && protocol !== 'http:' && protocol !== 'https:') {
    return 'production';
  }

  const hostname = window.location.hostname;

  // Production domains
  if (hostname === 'petlinkid.io' || hostname === 'www.petlinkid.io' || hostname === 'petlinkid.lovable.app') {
    return 'production';
  }
  
  // Local development
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
    return 'development';
  }
  
  // Lovable preview
  if (hostname.includes('.lovableproject.com') || hostname.includes('lovable.app')) {
    return 'preview';
  }
  
  // Default to development for safety
  return 'development';
}

/**
 * Check if we're in production
 */
export function isProduction(): boolean {
  return detectEnvironment() === 'production';
}

/**
 * Check if we're in development
 */
export function isDevelopment(): boolean {
  return detectEnvironment() === 'development';
}

/**
 * Validate required environment variables
 * @throws Error if critical variables are missing in production
 */
export function validateEnvironment(): void {
  const env = detectEnvironment();
  const requiredVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
  
  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
  
  if (missingVars.length > 0 && env === 'production') {
    throw new Error(
      `🚨 CRITICAL: Missing required environment variables in production:\n` +
      missingVars.map(v => `  - ${v}`).join('\n') +
      '\n\nApplication startup blocked. Configure missing variables before deployment.'
    );
  }
  
  if (missingVars.length > 0) {
    console.warn(
      `⚠️ Missing environment variables in ${env}:\n` +
      missingVars.map(v => `  - ${v}`).join('\n')
    );
  }
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig() {
  const env = detectEnvironment();
  const nativeApp = isNativeApp();
  const productionLike = env === 'production' || nativeApp;

  return {
    environment: env,
    isNativeApp: nativeApp,
    isProduction: env === 'production',
    isDevelopment: env === 'development',
    isPreview: env === 'preview',
    enableDebugLogs: !productionLike,
    enableSourceMaps: !productionLike,
    // App-specific config
    useInAppPurchases: true, // iOS app uses Apple IAP
    marketingUrl: 'https://petlinkid.io',
  };
}

/**
 * Initialize and validate environment
 * Call this early in application startup
 */
export function initializeEnvironment(): void {
  const env = detectEnvironment();
  console.log(`[ENV] Initializing PetLinkID in ${env.toUpperCase()} mode`);

  try {
    validateEnvironment();
    const config = getEnvironmentConfig();
    console.log('[ENV] Sanity check:', {
      environment: config.environment,
      native: config.isNativeApp,
      protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown',
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
    });
    console.log('[ENV] ✅ Environment validation passed');
  } catch (error) {
    console.error('[ENV] ❌ Environment validation failed:', error);
    throw error;
  }
}

// Export singleton instance
export const ENV = getEnvironmentConfig();
