import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Metro {
  id: string;
  name: string;
  slug: string | null;
  is_active: boolean;
}

/**
 * Fetches all active metro areas for use in dropdowns and selectors
 */
export function useMetros() {
  return useQuery({
    queryKey: ['metros'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geo_areas')
        .select('id, name, slug, is_active')
        .eq('type', 'metro')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Metro[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
