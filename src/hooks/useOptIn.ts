import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCouple } from '@/hooks/useCouple';

interface OptInState {
  hasUserOptedIn: boolean;
  isMutual: boolean;
}

interface UseOptInResult {
  optIn: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Handles the opt-in action for a suggestion.
 * Determines if user is recipient or candidate, updates the appropriate timestamp,
 * and transitions status from pending → opted_in → mutual.
 */
export const useOptIn = (
  suggestionId: string,
  candidateCoupleId: string,
  initialState: OptInState
): UseOptInResult => {
  const { couple } = useCouple();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optIn = useCallback(async () => {
    if (!couple?.id || !suggestionId) return;

    setLoading(true);
    setError(null);

    try {
      // Determine if current couple is recipient or candidate
      const isRecipient = couple.id !== candidateCoupleId;
      const timestampColumn = isRecipient ? 'recipient_opt_in_at' : 'candidate_opt_in_at';
      const otherTimestampColumn = isRecipient ? 'candidate_opt_in_at' : 'recipient_opt_in_at';

      // Fetch current suggestion state to check if other party has opted in
      const { data: currentSuggestion, error: fetchError } = await supabase
        .from('suggested_connections')
        .select('recipient_opt_in_at, candidate_opt_in_at, status')
        .eq('id', suggestionId)
        .single();

      if (fetchError) throw fetchError;

      // Check if the other party has already opted in
      const otherHasOptedIn = currentSuggestion[otherTimestampColumn] !== null;
      const newStatus = otherHasOptedIn ? 'mutual' : 'opted_in';
      const now = new Date().toISOString();

      // Build update object
      const updateData: Record<string, unknown> = {
        [timestampColumn]: now,
        status: newStatus,
      };

      // If becoming mutual, set resolved_at
      if (newStatus === 'mutual') {
        updateData.resolved_at = now;
      }

      // Perform the update
      const { error: updateError } = await supabase
        .from('suggested_connections')
        .update(updateData)
        .eq('id', suggestionId);

      if (updateError) throw updateError;

    } catch (err) {
      console.error('Opt-in failed:', err);
      setError('Failed to express interest');
    } finally {
      setLoading(false);
    }
  }, [couple?.id, suggestionId, candidateCoupleId]);

  return {
    optIn,
    loading,
    error,
  };
};
