import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { DirectoryPlace } from '@/components/directory/DirectoryPlaceCard';

/**
 * Fetches only approved places for the public directory view
 */
export const usePublicPlaces = () => {
  return useQuery({
    queryKey: ['places', 'public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('places')
        .select(`
          id,
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
      return data as DirectoryPlace[];
    },
  });
};
