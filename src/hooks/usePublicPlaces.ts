import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { DirectoryPlace } from '@/components/directory/DirectoryPlaceCard';
import { calculateDistanceMiles } from '@/lib/distance';

interface UsePublicPlacesOptions {
  lat?: number | null;
  lng?: number | null;
  radiusMiles?: number;
}

/**
 * Fetches approved places for the public directory view.
 * When location is provided, filters to places within the specified radius.
 */
export const usePublicPlaces = (options?: UsePublicPlacesOptions) => {
  const { lat, lng, radiusMiles = 100 } = options || {};

  const query = useQuery({
    queryKey: ['places', 'public', lat, lng, radiusMiles],
    staleTime: 0, // Ensure fresh filtering when location changes
    queryFn: async () => {
      const { data, error } = await supabase
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
          website_url,
          google_maps_url,
          phone_number,
          opening_hours,
          lat,
          lng
        `)
        .eq('status', 'approved')
        .order('name');

      if (error) throw error;

      // Client-side filter by radius when location is provided
      if (lat != null && lng != null) {
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