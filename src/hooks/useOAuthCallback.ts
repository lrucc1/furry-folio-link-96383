import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { supabase } from '@/integrations/supabase/client';
import { Capacitor } from '@capacitor/core';

/**
 * Hook to handle OAuth callbacks when returning from Google Sign-In on iOS.
 * Listens for deep link URL opens and processes the OAuth code exchange.
 */
export function useOAuthCallback() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleAppUrlOpen = async ({ url }: { url: string }) => {
      console.log('[OAuth] App URL opened:', url);
      
      // Check if this is an OAuth callback
      if (!url.includes('auth/callback') && !url.includes('access_token') && !url.includes('code=')) {
        return;
      }

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
              console.log('[OAuth] Session set successfully from hash tokens');
              navigate('/ios-home', { replace: true });
              return;
            }
            console.error('[OAuth] Error setting session:', error);
          }
        }

        // Handle code-based exchange (PKCE flow)
        const code = urlObj.searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (!error) {
            console.log('[OAuth] Session established via code exchange');
            navigate('/ios-home', { replace: true });
            return;
          }
          console.error('[OAuth] Error exchanging code:', error);
        }

        // If we get here, check if we already have a session (callback might have set it)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('[OAuth] Session already exists, navigating to home');
          navigate('/ios-home', { replace: true });
        }
      } catch (error) {
        console.error('[OAuth] Error processing callback:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    // Add listener for deep links
    App.addListener('appUrlOpen', handleAppUrlOpen);

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
    };
  }, [navigate]);

  return { isProcessing };
}
