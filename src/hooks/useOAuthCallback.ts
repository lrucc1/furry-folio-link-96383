import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { supabase } from '@/integrations/supabase/client';
import { Capacitor } from '@capacitor/core';
import { log } from '@/lib/log';

/**
 * Hook to handle OAuth callbacks when returning from Google Sign-In on iOS.
 * Listens for deep link URL opens and processes the OAuth code exchange.
 * Also detects when Safari View Controller is dismissed without completing auth.
 */
export function useOAuthCallback(onCancel?: () => void) {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const browserOpenRef = useRef(false);
  const authSuccessRef = useRef(false);

  // Function to set browser open state (called from Auth.tsx when opening browser)
  const setBrowserOpen = useCallback((open: boolean) => {
    browserOpenRef.current = open;
    if (open) {
      authSuccessRef.current = false; // Reset success flag when opening
    }
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleAppUrlOpen = async ({ url }: { url: string }) => {
      log.debug('[OAuth] App URL opened');
      
      // Check if this is an OAuth callback
      if (!url.includes('auth/callback') && !url.includes('access_token') && !url.includes('code=')) {
        return;
      }

      // Mark as success before processing
      authSuccessRef.current = true;
      browserOpenRef.current = false;
      setIsProcessing(true);

      try {
        // Close the browser window
        await Browser.close().catch(() => {
          // Browser might already be closed, ignore error
        });

        // Parse the URL to extract tokens or code
        const urlObj = new URL(url);
        
        // Handle hash-based tokens (implicit flow)
        if (url.includes('#')) {
          const hashParams = new URLSearchParams(url.split('#')[1]);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (!error) {
              log.debug('[OAuth] Session set successfully from hash tokens');
              navigate('/ios-home', { replace: true });
              return;
            }
            log.error('[OAuth] Error setting session:', error);
          }
        }

        // Handle code-based exchange (PKCE flow)
        const code = urlObj.searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (!error) {
            log.debug('[OAuth] Session established via code exchange');
            navigate('/ios-home', { replace: true });
            return;
          }
          log.error('[OAuth] Error exchanging code:', error);
        }

        // If we get here, check if we already have a session (callback might have set it)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          log.debug('[OAuth] Session already exists, navigating to home');
          navigate('/ios-home', { replace: true });
        }
      } catch (error) {
        log.error('[OAuth] Error processing callback:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    // Handle when Safari View Controller is dismissed (user tapped Done or closed it)
    const handleBrowserFinished = async () => {
      log.debug('[OAuth] Browser finished/closed', {
        browserOpen: browserOpenRef.current,
        authSuccess: authSuccessRef.current,
      });
      
      // Only handle cancel if browser was open and auth wasn't successful
      if (!browserOpenRef.current) return;
      
      browserOpenRef.current = false;
      
      // Give a moment for any pending deep link to arrive
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // If auth was successful via deep link, don't trigger cancel
      if (authSuccessRef.current) {
        log.debug('[OAuth] Auth was successful, not triggering cancel');
        return;
      }
      
      // Check if we got a session (maybe the deep link arrived)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        log.debug('[OAuth] No session after browser close - user cancelled');
        onCancel?.();
      } else {
        log.debug('[OAuth] Session exists after browser close');
        navigate('/ios-home', { replace: true });
      }
    };

    // Add listener for deep links
    App.addListener('appUrlOpen', handleAppUrlOpen);
    
    // Add listener for browser close/finish
    Browser.addListener('browserFinished', handleBrowserFinished);

    // Also check for pending URL on app resume
    const checkPendingUrl = async () => {
      try {
        const { url } = await App.getLaunchUrl() || {};
        if (url && (url.includes('auth/callback') || url.includes('access_token') || url.includes('code='))) {
          handleAppUrlOpen({ url });
        }
      } catch {
        // No pending URL
      }
    };
    checkPendingUrl();

    return () => {
      App.removeAllListeners();
      Browser.removeAllListeners();
    };
  }, [navigate, onCancel]);

  return { isProcessing, setBrowserOpen };
}
