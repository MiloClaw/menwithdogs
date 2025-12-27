import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type AppRole = 'admin' | 'moderator' | 'user';

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (!error && data) {
        setRoles(data.map(r => r.role as AppRole));
      }
      setLoading(false);
    };

    fetchRoles();
  }, [user, authLoading]);

  const hasRole = (role: AppRole) => roles.includes(role);
  const isAdmin = hasRole('admin');
  const isModerator = hasRole('moderator') || hasRole('admin');

  return {
    roles,
    loading: authLoading || loading,
    hasRole,
    isAdmin,
    isModerator,
  };
}
