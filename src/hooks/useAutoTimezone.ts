import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { log } from '@/lib/log';
import { COUNTRIES } from '@/components/CountrySelector';

/**
 * Detects browser timezone and country, saves to user profile if not already set.
 * Runs once per session when user is authenticated.
 */
export const useAutoTimezone = (userId: string | undefined) => {
  const hasChecked = useRef(false);

  useEffect(() => {
    if (!userId || hasChecked.current) return;

    const detectAndSaveLocale = async () => {
      hasChecked.current = true;

      try {
        // Get detected timezone and country from browser
        const detectedTimezone = getDetectedTimezone();
        const detectedCountry = getDetectedCountry();

        // Check if user already has timezone/country set
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('timezone, country_code')
          .eq('id', userId)
          .single();

        if (fetchError) {
          log.error('Error fetching profile for locale detection:', fetchError);
          return;
        }

        // Build update object for missing fields only
        const updates: { timezone?: string; country_code?: string } = {};
        
        if (!profile?.timezone && detectedTimezone) {
          updates.timezone = detectedTimezone;
        }
        
        if (!profile?.country_code && detectedCountry) {
          updates.country_code = detectedCountry;
        }

        // Only update if there are changes
        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);

          if (updateError) {
            log.error('Error auto-setting locale:', updateError);
          } else {
            log.debug('Auto-detected locale:', updates);
          }
        }
      } catch (error) {
        log.error('Error in auto locale detection:', error);
      }
    };

    detectAndSaveLocale();
  }, [userId]);
};

/**
 * Gets the browser's detected timezone
 */
export const getDetectedTimezone = (): string | null => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return null;
  }
};

/**
 * Gets the detected country code from browser locale
 * Returns a supported country code or null
 */
export const getDetectedCountry = (): string | null => {
  try {
    const supportedCodes = COUNTRIES.map(c => c.code) as string[];
    
    // Try navigator.language first (e.g., "en-AU", "en-US", "fr-FR")
    const locale = navigator.language || (navigator as any).userLanguage;
    if (locale && locale.includes('-')) {
      const countryCode = locale.split('-')[1].toUpperCase();
      if (supportedCodes.includes(countryCode)) {
        return countryCode;
      }
    }
    
    // Fallback: try Intl.DateTimeFormat resolved options
    const resolvedOptions = Intl.DateTimeFormat().resolvedOptions();
    if (resolvedOptions.locale && resolvedOptions.locale.includes('-')) {
      const countryCode = resolvedOptions.locale.split('-')[1].toUpperCase();
      if (supportedCodes.includes(countryCode)) {
        return countryCode;
      }
    }
    
    return null;
  } catch {
    return null;
  }
};
