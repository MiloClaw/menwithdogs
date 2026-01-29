import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlaceContext {
  id: string;
  context_types: string[];
  context_text: string;
  has_external_link: boolean;
  external_url: string | null;
  external_content_type: string | null;
  external_summary: string | null;
  submitted_at: string;
}

export function usePlaceTrailBlazerContext(placeId: string | undefined) {
  const [contexts, setContexts] = useState<PlaceContext[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!placeId) {
      setContexts([]);
      return;
    }

    const fetchContexts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('trail_blazer_submissions')
          .select('id, context_types, context_text, has_external_link, external_url, external_content_type, external_summary, submitted_at')
          .eq('place_id', placeId)
          .eq('status', 'approved')
          .order('submitted_at', { ascending: false });

        if (fetchError) throw fetchError;

        setContexts(data || []);
      } catch (err) {
        console.error('Error fetching Trail Blazer context:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch context'));
        setContexts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContexts();
  }, [placeId]);

  return { contexts, isLoading, error, hasContext: contexts.length > 0 };
}
