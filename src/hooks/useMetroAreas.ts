import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MetroArea {
  id: string;
  name: string;
  type: 'metro';
  centroid_lat: number | null;
  centroid_lng: number | null;
  is_active: boolean;
}

export function useMetroAreas() {
  return useQuery({
    queryKey: ['metro-areas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geo_areas')
        .select('id, name, type, centroid_lat, centroid_lng, is_active')
        .eq('type', 'metro')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return (data || []) as MetroArea[];
    },
  });
}
