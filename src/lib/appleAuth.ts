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

export enum AppleAuthFailureReason {
  MISSING_CLIENT_ID = 'missing_client_id',
  MODULE_LOAD_FAILED = 'module_load_failed',
  INITIALIZATION_FAILED = 'initialization_failed',
  SUPABASE_AUTH_FAILED = 'supabase_auth_failed',
  NETWORK_ERROR = 'network_error',
  UNKNOWN = 'unknown',
}

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

    const error = new AppleAuthError(AppleAuthFailureReason.MISSING_CLIENT_ID, message, {
      bundleId,
      envKey,
      availableKeys,
    });
    logAppleAuthFailure(AppleAuthFailureReason.MISSING_CLIENT_ID, error, { bundleId });
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
      const moduleError = new AppleAuthError(AppleAuthFailureReason.MODULE_LOAD_FAILED, 'Failed to load capacitor-social-login module', {
        bundleId: appInfo.id,
      });
      logAppleAuthFailure(AppleAuthFailureReason.MODULE_LOAD_FAILED, moduleError, { originalError: error });
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
    const reason = error instanceof AppleAuthError ? error.reason : AppleAuthFailureReason.INITIALIZATION_FAILED;
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
    const error = new Error('Apple Sign-In is not configured. Please contact support or use email sign-in.');
    console.error('[AppleAuth] Missing configuration - client ID not set for this bundle');
    toast.error('Apple Sign-In unavailable. Use email sign-in instead.');
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

    if (result?.provider === 'apple' && result.result?.idToken) {
      const idToken = result.result.idToken;
      const nonce = result.result.nonce;
      
      console.log('[AppleAuth] Got idToken, length:', idToken?.length);
      console.log('[AppleAuth] Got nonce:', nonce ? 'yes' : 'no');
      
      // Exchange Apple ID token with Supabase Auth with retry logic
      let lastError: Error | null = null;
      let authData: any = null;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`[AppleAuth] Supabase auth attempt ${attempt}/3`);
          
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: idToken,
            nonce: nonce,
          });

          if (error) {
            console.error(`[AppleAuth] Supabase auth error (attempt ${attempt}):`, error.message);
            lastError = error;
            
            // If it's a network/connection error, wait and retry
            const errMsg = error.message?.toLowerCase() || '';
            if (errMsg.includes('connection') || 
                errMsg.includes('network') ||
                errMsg.includes('interrupted') ||
                errMsg.includes('fetch')) {
              console.log('[AppleAuth] Network error detected, waiting before retry...');
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              continue;
            }
            
            // For other errors, don't retry
            break;
          }

          // Success!
          authData = data;
          console.log('[AppleAuth] Supabase auth successful, user:', data.user?.id);
          break;
          
        } catch (networkError) {
          console.error(`[AppleAuth] Network exception (attempt ${attempt}):`, networkError);
          lastError = networkError instanceof Error ? networkError : new Error(String(networkError));
          
          if (attempt < 3) {
            console.log('[AppleAuth] Waiting before retry...');
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }

      if (!authData) {
        console.error('[AppleAuth] All auth attempts failed:', lastError);
        logAppleAuthFailure(AppleAuthFailureReason.SUPABASE_AUTH_FAILED, lastError);
        
        // Provide user-friendly error messages
        const errMsg = lastError?.message?.toLowerCase() || '';
        if (errMsg.includes('network') || errMsg.includes('fetch') || errMsg.includes('connection')) {
          return { 
            data: null, 
            error: new Error('Please check your internet connection and try again.') 
          };
        }
        if (errMsg.includes('invalid') || errMsg.includes('expired')) {
          return { 
            data: null, 
            error: new Error('Apple Sign-In session expired. Please try again.') 
          };
        }
        return { 
          data: null, 
          error: new Error(lastError?.message || 'Unable to verify Apple credentials. Please try again.') 
        };
      }

      console.log('[AppleAuth] Successfully signed in with Supabase');
      
      // If Apple provided user info (only on first sign-in), update profile
      // This is non-critical, so we log errors silently
      if (result.result.givenName || result.result.familyName) {
        const fullName = [result.result.givenName, result.result.familyName]
          .filter(Boolean)
          .join(' ');
        
        if (fullName && authData.user) {
          try {
            await supabase
              .from('profiles')
              .update({ 
                full_name: fullName,
                display_name: fullName 
              })
              .eq('id', authData.user.id);
          } catch (profileError) {
            // Non-critical - silently log profile update failures
            console.warn('[AppleAuth] Profile update failed (non-critical):', profileError);
          }
        }
      }

      return { data: authData, error: null };
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
