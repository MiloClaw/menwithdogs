import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PlaceMetroAssignment {
  geo_area_id: string;
  metro_name: string;
  source: string;
  confidence: number | null;
}

export function usePlaceGeoAreas(placeId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch metro assignment for a place
  const { data: metroAssignment, isLoading } = useQuery({
    queryKey: ['place-geo-areas', placeId],
    queryFn: async (): Promise<PlaceMetroAssignment | null> => {
      if (!placeId) return null;

      const { data, error } = await supabase
        .from('place_geo_areas')
        .select(`
          geo_area_id,
          source,
          confidence,
          geo_areas!inner (
            id,
            name,
            type
          )
        `)
        .eq('place_id', placeId)
        .eq('geo_areas.type', 'metro')
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const geoArea = data.geo_areas as unknown as { id: string; name: string; type: string };
      
      return {
        geo_area_id: data.geo_area_id,
        metro_name: geoArea.name,
        source: data.source,
        confidence: data.confidence,
      };
    },
    enabled: !!placeId,
  });

  // Assign metro to place
  const assignMetro = useMutation({
    mutationFn: async ({ placeId, metroId }: { placeId: string; metroId: string }) => {
      // First, remove any existing metro assignment for this place
      const { data: existingMetros } = await supabase
        .from('place_geo_areas')
        .select('id, geo_areas!inner(type)')
        .eq('place_id', placeId)
        .eq('geo_areas.type', 'metro');

      if (existingMetros && existingMetros.length > 0) {
        const idsToDelete = existingMetros.map(m => m.id);
        await supabase
          .from('place_geo_areas')
          .delete()
          .in('id', idsToDelete);
      }

      // Insert new assignment
      const { data, error } = await supabase
        .from('place_geo_areas')
        .insert({
          place_id: placeId,
          geo_area_id: metroId,
          source: 'admin_override',
          confidence: 1.0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['place-geo-areas', placeId] });
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast({ title: 'Metro assignment updated' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to assign metro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Remove metro assignment
  const removeMetro = useMutation({
    mutationFn: async (placeId: string) => {
      const { data: existingMetros } = await supabase
        .from('place_geo_areas')
        .select('id, geo_areas!inner(type)')
        .eq('place_id', placeId)
        .eq('geo_areas.type', 'metro');

      if (existingMetros && existingMetros.length > 0) {
        const idsToDelete = existingMetros.map(m => m.id);
        const { error } = await supabase
          .from('place_geo_areas')
          .delete()
          .in('id', idsToDelete);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['place-geo-areas', placeId] });
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast({ title: 'Metro assignment removed' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to remove metro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    metroAssignment,
    isLoading,
    assignMetro,
    removeMetro,
    isAssigning: assignMetro.isPending,
    isRemoving: removeMetro.isPending,
  };
}
