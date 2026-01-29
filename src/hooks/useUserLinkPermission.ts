import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useUserLinkPermission() {
  const { user } = useAuth();
  const [canAttachLinks, setCanAttachLinks] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCanAttachLinks(false);
      setLoading(false);
      return;
    }

    const fetchPermission = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('trail_blazer_permissions')
          .select('can_attach_external_links')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching link permission:', error);
          setCanAttachLinks(false);
        } else {
          setCanAttachLinks(data?.can_attach_external_links ?? false);
        }
      } catch (err) {
        console.error('Error fetching link permission:', err);
        setCanAttachLinks(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPermission();
  }, [user]);

  return { canAttachLinks, loading };
}
