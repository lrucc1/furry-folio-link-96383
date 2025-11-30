/**
 * Apple Sign-In Authentication
 * Handles Apple Sign-In flow for iOS native app using Capacitor Social Login
 */

import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Dynamic import for social login to avoid issues on web
let SocialLogin: any = null;

/**
 * Initialize Apple Auth (call on app startup for iOS)
 */
export async function initializeAppleAuth(): Promise<void> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    console.log('[AppleAuth] Skipping initialization - not on iOS native');
    return;
  }

  try {
    const module = await import('@capgo/capacitor-social-login');
    SocialLogin = module.SocialLogin;
    
    await SocialLogin.initialize({
      apple: {
        clientId: 'app.lovable.a2e9460fc39147688955cf1b862df298',
      },
    });
    console.log('[AppleAuth] Initialized successfully');
  } catch (error) {
    console.error('[AppleAuth] Failed to initialize:', error);
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

  if (!SocialLogin) {
    try {
      const module = await import('@capgo/capacitor-social-login');
      SocialLogin = module.SocialLogin;
    } catch (error) {
      console.error('[AppleAuth] Failed to load social login module:', error);
      return { data: null, error };
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
        return { data: null, error };
      }

      console.log('[AppleAuth] Successfully signed in with Supabase');
      
      // If Apple provided user info (only on first sign-in), update profile
      if (result.result.givenName || result.result.familyName) {
        const fullName = [result.result.givenName, result.result.familyName]
          .filter(Boolean)
          .join(' ');
        
        if (fullName && data.user) {
          // Update profile with name from Apple
          await supabase
            .from('profiles')
            .update({ 
              full_name: fullName,
              display_name: fullName 
            })
            .eq('id', data.user.id);
        }
      }

      return { data, error: null };
    }

    return { 
      data: null, 
      error: new Error('Apple Sign-In failed - no identity token received') 
    };
  } catch (error) {
    console.error('[AppleAuth] Error during Apple Sign-In:', error);
    return { data: null, error };
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
