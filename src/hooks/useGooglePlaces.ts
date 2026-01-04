import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PhotoReference {
  name: string;
  widthPx: number;
  heightPx: number;
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
  // GBP enrichment fields
  rating: number | null;
  user_ratings_total: number | null;
  price_level: number | null;
  website_url: string | null;
  phone_number: string | null;
  google_maps_url: string | null;
  opening_hours: { weekday_text: string[] } | null;
  photos: PhotoReference[] | null;
  google_primary_type: string | null;
  google_primary_type_display: string | null;
  // Additional GBP fields
  google_types: string[] | null;
  business_status: string | null;
  utc_offset_minutes: number | null;
}

// Generate a UUID v4 for session tokens
const generateSessionToken = (): string => {
  return crypto.randomUUID();
};

export const useGooglePlaces = () => {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Session token for billing optimization
  const sessionTokenRef = useRef<string | null>(null);

  // Get or create session token
  const getSessionToken = useCallback((): string => {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = generateSessionToken();
    }
    return sessionTokenRef.current;
  }, []);

  // Reset session token (call after place selection)
  const resetSessionToken = useCallback(() => {
    sessionTokenRef.current = null;
  }, []);

  const fetchAutocomplete = useCallback(async (
    input: string,
    types: string = '(cities)',
    locationBias?: { lat: number; lng: number; radius?: number }
  ): Promise<PlacePrediction[]> => {
    if (!input || input.trim().length < 1) {
      setPredictions([]);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'google-places-autocomplete',
        {
          body: { 
            input: input.trim(), 
            types,
            sessionToken: getSessionToken(),
            locationBias,
          },
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
  }, [getSessionToken]);

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
          body: { 
            place_id,
            sessionToken: sessionTokenRef.current, // Use current token to complete session
          },
        }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Reset session token after successful details fetch (billing session complete)
      resetSessionToken();

      return data.details || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch place details';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [resetSessionToken]);

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
    resetSessionToken,
  };
};
