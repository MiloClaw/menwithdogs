import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';

/**
 * Lazily ensures a relationship_unit (couple) exists before write operations.
 * Called silently on first save action, not on auth.
 * Uses existing create_couple_for_current_user() RPC.
 */
export const useEnsureRelationshipUnit = () => {
  const { user, isAuthenticated } = useAuth();
  const { hasCouple, refetch } = useCouple();
  const isCreating = useRef(false);

  const ensureRelationshipUnit = useCallback(async (): Promise<string | null> => {
    // Not authenticated - can't create
    if (!isAuthenticated || !user) {
      return null;
    }

    // Already has a couple - return existing
    if (hasCouple) {
      // Get the couple ID from member_profiles
      const { data: memberProfile } = await supabase
        .from('member_profiles')
        .select('couple_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      return memberProfile?.couple_id ?? null;
    }

    // Prevent concurrent creation
    if (isCreating.current) {
      return null;
    }

    isCreating.current = true;

    try {
      // Verify session is fully propagated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('[useEnsureRelationshipUnit] Session not ready');
        return null;
      }

      console.debug('[useEnsureRelationshipUnit] Creating relationship unit...');

      // Call atomic backend function
      const { data: coupleId, error } = await supabase.rpc('create_couple_for_current_user', {
        unit_type: 'individual'
      });

      if (error) {
        console.error('[useEnsureRelationshipUnit] Creation error:', error);
        return null;
      }

      console.debug('[useEnsureRelationshipUnit] Created:', coupleId);

      // Refetch to update context
      await refetch();

      return coupleId;
    } finally {
      isCreating.current = false;
    }
  }, [isAuthenticated, user, hasCouple, refetch]);

  return { ensureRelationshipUnit, hasCouple };
};
