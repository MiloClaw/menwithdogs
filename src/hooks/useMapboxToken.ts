import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseMapboxTokenResult {
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useMapboxToken(): UseMapboxTokenResult {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchToken = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke('get-mapbox-token');

        if (!isMounted) return;

        if (fnError) {
          console.error('Failed to fetch MapBox token:', fnError);
          setError('Failed to load map');
          setIsLoading(false);
          return;
        }

        if (data?.token) {
          setToken(data.token);
          setError(null);
        } else {
          setError('Map token not available');
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching MapBox token:', err);
        setError('Failed to load map');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchToken();

    return () => {
      isMounted = false;
    };
  }, []);

  return { token, isLoading, error };
}
