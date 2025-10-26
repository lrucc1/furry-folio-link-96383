/**
 * Environment Configuration & Validation
 * Validates environment variables and provides runtime environment detection
 * 
 * CRITICAL: This file ensures production safety by validating that:
 * - Production never uses test Stripe keys
 * - All required secrets are configured
 * - Environment mismatches crash early with clear errors
 */

export type AppEnvironment = 'production' | 'development' | 'preview';

/**
 * Detect current environment based on hostname
 */
export function detectEnvironment(): AppEnvironment {
  if (typeof window === 'undefined') return 'development';
  
  const hostname = window.location.hostname;
  
  // Production domains
  if (hostname === 'petlinkid.com' || hostname === 'www.petlinkid.com' || hostname === 'petlinkid.lovable.app') {
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
 * Validate Stripe keys match environment
 * @throws Error if production uses test keys or vice versa
 */
export function validateStripeKeys(): void {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  const env = detectEnvironment();
  
  if (!publishableKey) {
    console.warn('[ENV] Stripe publishable key not configured');
    return;
  }
  
  const isTestKey = publishableKey.startsWith('pk_test_');
  const isLiveKey = publishableKey.startsWith('pk_live_');
  
  // Production MUST use live keys
  if (env === 'production' && isTestKey) {
    throw new Error(
      '🚨 SECURITY ERROR: Production is using Stripe TEST keys! ' +
      'Update VITE_STRIPE_PUBLISHABLE_KEY to use pk_live_* key. ' +
      'Application startup blocked to prevent test transactions in production.'
    );
  }
  
  // Development/Preview should use test keys
  if (env !== 'production' && isLiveKey) {
    console.error(
      '⚠️ WARNING: Non-production environment is using Stripe LIVE keys! ' +
      'This could result in real charges during development. ' +
      'Please use pk_test_* keys for development and preview environments.'
    );
  }
  
  console.log(`[ENV] Stripe keys validated: ${env} using ${isTestKey ? 'TEST' : 'LIVE'} keys`);
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
  
  return {
    environment: env,
    isProduction: env === 'production',
    isDevelopment: env === 'development',
    isPreview: env === 'preview',
    enableDebugLogs: env !== 'production',
    enableSourceMaps: env !== 'production',
    stripeMode: env === 'production' ? 'live' : 'test',
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
    validateStripeKeys();
    console.log('[ENV] ✅ Environment validation passed');
  } catch (error) {
    console.error('[ENV] ❌ Environment validation failed:', error);
    throw error;
  }
}

// Export singleton instance
export const ENV = getEnvironmentConfig();
