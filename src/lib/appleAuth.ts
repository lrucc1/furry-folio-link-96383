/**
 * Apple Sign-In Authentication
 * Handles Apple Sign-In flow for iOS native app using Capacitor Social Login
 */

import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Dynamic import for social login to avoid issues on web
let SocialLogin: any = null;
let appleAuthConfig: { clientId: string; bundleId: string } | null = null;

export type AppleAuthFailureReason =
  | 'missing_client_id'
  | 'module_load_failed'
  | 'initialization_failed'
  | 'unknown';

export class AppleAuthError extends Error {
  reason: AppleAuthFailureReason;
  metadata?: Record<string, unknown>;

  constructor(reason: AppleAuthFailureReason, message: string, metadata?: Record<string, unknown>) {
    super(message);
    this.reason = reason;
    this.metadata = metadata;
    this.name = 'AppleAuthError';
  }
}

export function logAppleAuthFailure(
  reason: AppleAuthFailureReason,
  error?: unknown,
  metadata?: Record<string, unknown>
) {
  const message = error instanceof Error ? error.message : String(error ?? 'Unknown error');

  console.error('[AppleAuth][Telemetry]', {
    reason,
    message,
    stack: error instanceof Error ? error.stack : undefined,
    metadata,
  });
}

function formatBundleIdForEnv(bundleId: string): string {
  return bundleId.replace(/[^A-Za-z0-9]/g, '_').toUpperCase();
}

function getAppleClientId(bundleId: string): string {
  const envKey = `VITE_APPLE_CLIENT_ID_${formatBundleIdForEnv(bundleId)}`;
  const env = import.meta.env as Record<string, string | undefined>;
  const clientId = env[envKey];

  if (!clientId) {
    const availableKeys = Object.keys(env)
      .filter(key => key.startsWith('VITE_APPLE_CLIENT_ID_'))
      .sort();

    const message =
      `[AppleAuth] Missing Apple client ID for bundle "${bundleId}". ` +
      `Set ${envKey} in your environment (.env.*).` +
      (availableKeys.length ? ` Available keys: ${availableKeys.join(', ')}` : ' No Apple client IDs found.');

    const error = new AppleAuthError('missing_client_id', message, {
      bundleId,
      envKey,
      availableKeys,
    });
    logAppleAuthFailure('missing_client_id', error, { bundleId });
    throw error;
  }

  return clientId;
}

/**
 * Initialize Apple Auth (call on app startup for iOS)
 */
export async function initializeAppleAuth(): Promise<void> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    console.log('[AppleAuth] Skipping initialization - not on iOS native');
    return;
  }

  try {
    const appInfo = await App.getInfo();
    const clientId = getAppleClientId(appInfo.id);

    try {
      const module = await import('@capgo/capacitor-social-login');
      SocialLogin = module.SocialLogin;
    } catch (error) {
      const moduleError = new AppleAuthError('module_load_failed', 'Failed to load capacitor-social-login module', {
        bundleId: appInfo.id,
      });
      logAppleAuthFailure('module_load_failed', moduleError, { originalError: error });
      throw moduleError;
    }

    await SocialLogin.initialize({
      apple: {
        clientId,
      },
    });

    appleAuthConfig = { clientId, bundleId: appInfo.id };

    const maskedClientId = `${clientId.slice(0, 6)}...${clientId.slice(-4)}`;
    console.log(`[AppleAuth] Initialized for bundle ${appInfo.id} using client ${maskedClientId}`);
    console.log('[AppleAuth] Initialized successfully');
  } catch (error) {
    const reason = error instanceof AppleAuthError ? error.reason : 'initialization_failed';
    logAppleAuthFailure(reason, error, { stage: 'initialize' });
    throw error;
  }
}

/**
 * Check if Apple Sign-In is available
 */
export function isAppleSignInAvailable(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

/**
 * Sign in with Apple
 * Returns user data on success, throws on failure
 */
export async function signInWithApple(): Promise<{ data: any; error: any }> {
  if (!isAppleSignInAvailable()) {
    return {
      data: null,
      error: new Error('Apple Sign-In is only available on iOS devices')
    };
  }

  if (!appleAuthConfig) {
    const error = new Error('Apple Sign-In is not initialized. Check environment variables for your bundle ID.');
    console.error('[AppleAuth] Missing configuration:', error.message);
    return { data: null, error };
  }

  if (!SocialLogin) {
    try {
      const module = await import('@capgo/capacitor-social-login');
      SocialLogin = module.SocialLogin;
    } catch (error) {
      console.error('[AppleAuth] Failed to load social login module:', error);
      return { 
        data: null, 
        error: new Error('Unable to load Apple Sign-In. Please try again.') 
      };
    }
  }

  try {
    console.log('[AppleAuth] Starting Apple Sign-In flow');
    
    const result = await SocialLogin.login({
      provider: 'apple',
      options: {
        scopes: ['email', 'name'],
      },
    });

    console.log('[AppleAuth] Apple Sign-In result:', result?.provider);

    if (result?.provider === 'apple' && result.result?.identityToken) {
      // Exchange Apple ID token with Supabase Auth
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: result.result.identityToken,
        nonce: result.result.nonce,
      });

      if (error) {
        console.error('[AppleAuth] Supabase sign-in error:', error);
        // Provide user-friendly error messages
        if (error.message?.includes('network') || error.message?.includes('fetch')) {
          return { 
            data: null, 
            error: new Error('Please check your internet connection and try again.') 
          };
        }
        if (error.message?.includes('invalid') || error.message?.includes('expired')) {
          return { 
            data: null, 
            error: new Error('Apple Sign-In session expired. Please try again.') 
          };
        }
        return { 
          data: null, 
          error: new Error(error.message || 'Unable to verify Apple credentials. Please try again.') 
        };
      }

      console.log('[AppleAuth] Successfully signed in with Supabase');
      
      // If Apple provided user info (only on first sign-in), update profile
      // This is non-critical, so we log errors silently
      if (result.result.givenName || result.result.familyName) {
        const fullName = [result.result.givenName, result.result.familyName]
          .filter(Boolean)
          .join(' ');
        
        if (fullName && data.user) {
          try {
            await supabase
              .from('profiles')
              .update({ 
                full_name: fullName,
                display_name: fullName 
              })
              .eq('id', data.user.id);
          } catch (profileError) {
            // Non-critical - silently log profile update failures
            console.warn('[AppleAuth] Profile update failed (non-critical):', profileError);
          }
        }
      }

      return { data, error: null };
    }

    return { 
      data: null, 
      error: new Error('Apple Sign-In failed. Please try again.') 
    };
  } catch (error: any) {
    console.error('[AppleAuth] Error during Apple Sign-In:', error);
    
    // Handle specific error types with user-friendly messages
    const errorMessage = error?.message || '';
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('offline')) {
      return { 
        data: null, 
        error: new Error('Please check your internet connection and try again.') 
      };
    }
    
    if (errorMessage.includes('timeout')) {
      return { 
        data: null, 
        error: new Error('Request timed out. Please try again.') 
      };
    }
    
    return { 
      data: null, 
      error: new Error('Apple Sign-In failed. Please try again.') 
    };
  }
}

/**
 * Handle Apple Sign-In button click with error handling
 */
export async function handleAppleSignIn(): Promise<boolean> {
  try {
    const { error } = await signInWithApple();
    
    if (error) {
      // Don't show error for user cancellation
      if (error.message?.includes('cancelled') || error.message?.includes('canceled')) {
        return false;
      }
      toast.error(error.message || 'Apple Sign-In failed');
      return false;
    }
    
    toast.success('Signed in successfully!');
    return true;
  } catch (error: any) {
    console.error('[AppleAuth] Unexpected error:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
}
