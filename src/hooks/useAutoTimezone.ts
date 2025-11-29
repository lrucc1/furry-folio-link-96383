import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { log } from '@/lib/log';

/**
 * Detects browser timezone and saves it to user profile if not already set.
 * Runs once per session when user is authenticated.
 */
export const useAutoTimezone = (userId: string | undefined) => {
  const hasChecked = useRef(false);

  useEffect(() => {
    if (!userId || hasChecked.current) return;

    const detectAndSaveTimezone = async () => {
      hasChecked.current = true;

      try {
        // Get detected timezone from browser
        const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (!detectedTimezone) return;

        // Check if user already has timezone set
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('timezone')
          .eq('id', userId)
          .single();

        if (fetchError) {
          log.error('Error fetching profile for timezone:', fetchError);
          return;
        }

        // Only update if timezone is not already set
        if (!profile?.timezone) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ timezone: detectedTimezone })
            .eq('id', userId);

          if (updateError) {
            log.error('Error auto-setting timezone:', updateError);
          } else {
            log.debug('Auto-detected and saved timezone:', detectedTimezone);
          }
        }
      } catch (error) {
        log.error('Error in auto timezone detection:', error);
      }
    };

    detectAndSaveTimezone();
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
