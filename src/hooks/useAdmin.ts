import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        console.debug('[useAdmin] No user, skipping admin check');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      console.debug('[useAdmin] Checking admin for user', { id: user.id, email: user.email });

      try {
        // Try RPC first (bypasses RLS via SECURITY DEFINER)
        const { data: rpcData, error: rpcError } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin',
        });
        console.debug('[useAdmin] RPC has_role result', { rpcData, rpcError });

        if (rpcError) {
          console.warn('RPC has_role failed, falling back to direct query:', rpcError);
          // Fall back to direct table query (RLS allows users to view their own roles)
          const { data: roleRow, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .maybeSingle();

          console.debug('[useAdmin] Fallback table query result', { roleRow, roleError });

          if (roleError) {
            console.error('Error checking admin status via table:', roleError);
            setIsAdmin(false);
          } else {
            setIsAdmin(!!roleRow);
          }
        } else {
          setIsAdmin(Boolean(rpcData));
        }
      } catch (error) {
        console.error('Error in admin check:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
};