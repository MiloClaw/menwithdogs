import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LaunchedCity {
  id: string;
  name: string;
  state: string | null;
  approved_place_count: number | null;
}

/**
 * Fetches cities with status='launched' that have at least one approved place.
 * Used for the "Explore another city" picker.
 */
export const useLaunchedCities = () => {
  return useQuery({
    queryKey: ['cities', 'launched'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('city_seeding_progress')
        .select('id, name, state, approved_place_count')
        .eq('status', 'launched')
        .gt('approved_place_count', 0)
        .order('name');
      
      if (error) throw error;
      return data as LaunchedCity[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
