import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  city: string | null;
  state: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
}

export const useGooglePlaces = () => {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAutocomplete = useCallback(async (
    input: string,
    types: string = '(cities)'
  ): Promise<PlacePrediction[]> => {
    if (!input || input.trim().length < 2) {
      setPredictions([]);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'google-places-autocomplete',
        {
          body: { input: input.trim(), types },
        }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const results = data.predictions || [];
      setPredictions(results);
      return results;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch suggestions';
      setError(message);
      setPredictions([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDetails = useCallback(async (
    place_id: string
  ): Promise<PlaceDetails | null> => {
    if (!place_id) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'google-places-details',
        {
          body: { place_id },
        }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data.details || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch place details';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearPredictions = useCallback(() => {
    setPredictions([]);
    setError(null);
  }, []);

  return {
    predictions,
    isLoading,
    error,
    fetchAutocomplete,
    fetchDetails,
    clearPredictions,
  };
};
