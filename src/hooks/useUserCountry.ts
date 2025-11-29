import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getDetectedCountry } from '@/hooks/useAutoTimezone';

/**
 * Hook to get the user's country code.
 * First checks the user's profile, then falls back to browser detection.
 */
export const useUserCountry = () => {
  const { user } = useAuth();
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountry = async () => {
      setLoading(true);
      
      // Try to get from user profile first
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('country_code')
            .eq('id', user.id)
            .single();

          if (!error && data?.country_code) {
            setCountryCode(data.country_code);
            setLoading(false);
            return;
          }
        } catch {
          // Fall through to browser detection
        }
      }

      // Fallback to browser detection
      const detected = getDetectedCountry();
      setCountryCode(detected);
      setLoading(false);
    };

    fetchCountry();
  }, [user]);

  return { countryCode, loading };
};
