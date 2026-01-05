import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { DirectoryPlace } from '@/components/directory/DirectoryPlaceCard';
import { calculateDistanceMiles } from '@/lib/distance';

interface UsePublicPlacesOptions {
  lat?: number | null;
  lng?: number | null;
  radiusMiles?: number;
  // For exploration mode: filter by city/state text instead of coordinates
  city?: string | null;
  state?: string | null;
}

/**
 * Fetches approved places for the public directory view.
 * - Exploration mode (city/state provided): filters by city name match
 * - Normal mode (lat/lng provided): filters by radius from coordinates
 */
export const usePublicPlaces = (options?: UsePublicPlacesOptions) => {
  const { lat, lng, radiusMiles = 100, city, state } = options || {};

  // Determine if we're in exploration mode (city text filtering)
  const isExplorationMode = city != null && city.length > 0;

  const query = useQuery({
    queryKey: ['places', 'public', isExplorationMode ? 'exploration' : 'geo', city, state, lat, lng, radiusMiles],
    staleTime: 0,
    queryFn: async () => {
      let query = supabase
        .from('places')
        .select(`
          id,
          google_place_id,
          name,
          primary_category,
          city,
          state,
          formatted_address,
          rating,
          user_ratings_total,
          price_level,
          photos,
          stored_photo_urls,
          website_url,
          google_maps_url,
          phone_number,
          opening_hours,
          lat,
          lng
        `)
        .eq('status', 'approved');

      // Exploration mode: filter by city name (case-insensitive)
      if (isExplorationMode) {
        query = query.ilike('city', city!);
        if (state) {
          query = query.eq('state', state);
        }
      }

      const { data, error } = await query.order('name');

      if (error) throw error;

      // For non-exploration mode with coordinates, apply radius filter client-side
      if (!isExplorationMode && lat != null && lng != null) {
        return (data as DirectoryPlace[]).filter(place => {
          if (place.lat == null || place.lng == null) return false;
          const distance = calculateDistanceMiles(lat, lng, place.lat, place.lng);
          return distance <= radiusMiles;
        });
      }

      return data as DirectoryPlace[];
    },
  });

  return {
    ...query,
    isSwitchingLocation: query.isFetching && !query.isLoading,
  };
};