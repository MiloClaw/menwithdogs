import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LaunchedCity {
  id: string;
  name: string;
  state: string | null;
  place_count: number;
}

/**
 * Fetches cities with status='launched' that have at least one approved place.
 * Uses the safe launched_cities_summary view (no business intelligence exposure).
 * Used for the "Explore another city" picker.
 */
export const useLaunchedCities = () => {
  return useQuery({
    queryKey: ['cities', 'launched'],
    queryFn: async () => {
      // Use the safe public view instead of city_seeding_progress
      const { data, error } = await supabase
        .from('launched_cities_summary')
        .select('id, name, state, place_count')
        .gt('place_count', 0)
        .order('name');
      
      if (error) throw error;
      return data as LaunchedCity[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
