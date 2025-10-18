import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from './roles';
import { log } from '@/lib/log';

interface RoleInfo {
  role: Role;
  petId: string | null;
  loading: boolean;
}

/**
 * Hook to get the current user's role for a specific pet
 */
export function useRole(petId: string | null): RoleInfo {
  const { user } = useAuth();
  const [role, setRole] = useState<Role>('caregiver');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !petId) {
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        // Check if user owns the pet
        const { data: petData, error: petError } = await supabase
          .from('pets')
          .select('user_id')
          .eq('id', petId)
          .single();

        if (!petError && petData?.user_id === user.id) {
          setRole('owner');
          setLoading(false);
          return;
        }

        // Check memberships
        const { data: membershipData, error: membershipError } = await supabase
          .from('pet_memberships')
          .select('role')
          .eq('pet_id', petId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!membershipError && membershipData) {
          setRole(membershipData.role as Role);
        } else {
          setRole('caregiver');
        }
      } catch (error) {
        log.error('[useRole] Error fetching role:', error);
        setRole('caregiver');
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user, petId]);

  return { role, petId, loading };
}
