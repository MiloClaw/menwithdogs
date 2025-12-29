import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCouple } from '@/hooks/useCouple';

export interface Suggestion {
  id: string;
  candidateCoupleId: string;
  displayName: string | null;
  city: string | null;
  surfacedReason: string | null;
  recipientOptInAt: string | null;
  candidateOptInAt: string | null;
  hasUserOptedIn: boolean;
  isMutual: boolean;
}

/**
 * Fetches pending suggestions for the current couple.
 * Returns a maximum of 5 suggestions, sorted by rank and recency.
 */
export const useSuggestions = () => {
  const { couple } = useCouple();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    if (!couple?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch pending/opted_in suggestions where this couple is the recipient
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from('suggested_connections')
        .select('id, candidate_couple_id, surfaced_reason, surfaced_rank, generated_at, recipient_opt_in_at, candidate_opt_in_at, status')
        .eq('recipient_couple_id', couple.id)
        .in('status', ['pending', 'opted_in'])
        .order('surfaced_rank', { ascending: true, nullsFirst: false })
        .order('generated_at', { ascending: false })
        .limit(5);

      if (suggestionsError) throw suggestionsError;

      if (!suggestionsData || suggestionsData.length === 0) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      // Fetch candidate couple details
      const candidateIds = suggestionsData.map(s => s.candidate_couple_id);

      const { data: couplesData, error: couplesError } = await supabase
        .from('couples')
        .select('id, display_name')
        .in('id', candidateIds);

      if (couplesError) throw couplesError;

      // Fetch location summaries
      const { data: locationsData, error: locationsError } = await supabase
        .from('couple_location_summary')
        .select('couple_id, city')
        .in('couple_id', candidateIds);

      if (locationsError) throw locationsError;

      // Build lookup maps
      const couplesMap = new Map(couplesData?.map(c => [c.id, c]) || []);
      const locationsMap = new Map(locationsData?.map(l => [l.couple_id, l]) || []);

      // Combine the data
      const combined: Suggestion[] = suggestionsData.map(s => {
        const coupleData = couplesMap.get(s.candidate_couple_id);
        const locationData = locationsMap.get(s.candidate_couple_id);
        
        // User is always recipient in this query
        const hasUserOptedIn = s.recipient_opt_in_at !== null;
        const isMutual = s.status === 'mutual';

        return {
          id: s.id,
          candidateCoupleId: s.candidate_couple_id,
          displayName: coupleData?.display_name || null,
          city: locationData?.city || null,
          surfacedReason: s.surfaced_reason || null,
          recipientOptInAt: s.recipient_opt_in_at,
          candidateOptInAt: s.candidate_opt_in_at,
          hasUserOptedIn,
          isMutual,
        };
      });

      setSuggestions(combined);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
      setError('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  }, [couple?.id]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return {
    suggestions,
    loading,
    error,
    isEmpty: !loading && suggestions.length === 0,
    refetch: fetchSuggestions,
  };
};
