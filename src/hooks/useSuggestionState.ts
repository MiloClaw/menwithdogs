import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCouple } from '@/hooks/useCouple';

interface SuggestionState {
  id: string;
  hasUserOptedIn: boolean;
  isMutual: boolean;
  isRecipient: boolean;
}

/**
 * Fetches the suggestion state for a specific couple pairing.
 * Used in detail view to determine opt-in button state.
 */
export const useSuggestionState = (candidateCoupleId: string | undefined) => {
  const { couple } = useCouple();
  const [state, setState] = useState<SuggestionState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchState = async () => {
      if (!couple?.id || !candidateCoupleId) {
        setLoading(false);
        return;
      }

      try {
        // Check if there's a suggestion where current couple is recipient
        const { data: asRecipient } = await supabase
          .from('suggested_connections')
          .select('id, recipient_opt_in_at, candidate_opt_in_at, status')
          .eq('recipient_couple_id', couple.id)
          .eq('candidate_couple_id', candidateCoupleId)
          .in('status', ['pending', 'opted_in', 'mutual'])
          .maybeSingle();

        if (asRecipient) {
          setState({
            id: asRecipient.id,
            hasUserOptedIn: asRecipient.recipient_opt_in_at !== null,
            isMutual: asRecipient.status === 'mutual',
            isRecipient: true,
          });
          setLoading(false);
          return;
        }

        // Check if there's a suggestion where current couple is candidate
        const { data: asCandidate } = await supabase
          .from('suggested_connections')
          .select('id, recipient_opt_in_at, candidate_opt_in_at, status')
          .eq('candidate_couple_id', couple.id)
          .eq('recipient_couple_id', candidateCoupleId)
          .in('status', ['pending', 'opted_in', 'mutual'])
          .maybeSingle();

        if (asCandidate) {
          setState({
            id: asCandidate.id,
            hasUserOptedIn: asCandidate.candidate_opt_in_at !== null,
            isMutual: asCandidate.status === 'mutual',
            isRecipient: false,
          });
        } else {
          // No suggestion exists for this pairing
          setState(null);
        }
      } catch (err) {
        console.error('Failed to fetch suggestion state:', err);
        setState(null);
      } finally {
        setLoading(false);
      }
    };

    fetchState();
  }, [couple?.id, candidateCoupleId]);

  const refetch = async () => {
    if (!couple?.id || !candidateCoupleId) return;
    
    setLoading(true);
    
    try {
      const { data: asRecipient } = await supabase
        .from('suggested_connections')
        .select('id, recipient_opt_in_at, candidate_opt_in_at, status')
        .eq('recipient_couple_id', couple.id)
        .eq('candidate_couple_id', candidateCoupleId)
        .in('status', ['pending', 'opted_in', 'mutual'])
        .maybeSingle();

      if (asRecipient) {
        setState({
          id: asRecipient.id,
          hasUserOptedIn: asRecipient.recipient_opt_in_at !== null,
          isMutual: asRecipient.status === 'mutual',
          isRecipient: true,
        });
      }
    } catch (err) {
      console.error('Failed to refetch suggestion state:', err);
    } finally {
      setLoading(false);
    }
  };

  return { state, loading, refetch };
};
