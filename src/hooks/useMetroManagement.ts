import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MetroWithDetails {
  id: string;
  name: string;
  slug: string | null;
  is_active: boolean;
  centroid_lat: number | null;
  centroid_lng: number | null;
  city_count: number;
  place_count: number;
  counties: MetroCounty[];
}

export interface MetroCounty {
  id: string;
  county_name: string;
  state_code: string;
  country_code: string;
}

export interface MetroInsert {
  name: string;
  slug?: string;
  centroid_lat?: number;
  centroid_lng?: number;
}

export interface MetroUpdate {
  name?: string;
  slug?: string;
  is_active?: boolean;
  centroid_lat?: number;
  centroid_lng?: number;
}

/**
 * Comprehensive hook for managing metro areas
 */
export function useMetroManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all metros with their stats
  const {
    data: metros,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['metros', 'admin'],
    queryFn: async () => {
      // Get all metro areas
      const { data: metroData, error: metroError } = await supabase
        .from('geo_areas')
        .select('*')
        .eq('type', 'metro')
        .order('name');

      if (metroError) throw metroError;

      // Get county mappings
      const { data: countyData, error: countyError } = await supabase
        .from('metro_counties')
        .select('*');

      if (countyError) throw countyError;

      // Get city counts per metro
      const { data: cityData, error: cityError } = await supabase
        .from('cities')
        .select('metro_id')
        .not('metro_id', 'is', null);

      if (cityError) throw cityError;

      // Get place counts per metro via place_geo_areas
      const { data: placeGeoData, error: placeGeoError } = await supabase
        .from('place_geo_areas')
        .select('geo_area_id');

      if (placeGeoError) throw placeGeoError;

      // Build lookup maps
      const countyMap = new Map<string, MetroCounty[]>();
      countyData?.forEach(county => {
        const existing = countyMap.get(county.metro_id) || [];
        existing.push({
          id: county.id,
          county_name: county.county_name,
          state_code: county.state_code,
          country_code: county.country_code,
        });
        countyMap.set(county.metro_id, existing);
      });

      const cityCountMap = new Map<string, number>();
      cityData?.forEach(city => {
        if (city.metro_id) {
          cityCountMap.set(city.metro_id, (cityCountMap.get(city.metro_id) || 0) + 1);
        }
      });

      const placeCountMap = new Map<string, number>();
      placeGeoData?.forEach(pg => {
        placeCountMap.set(pg.geo_area_id, (placeCountMap.get(pg.geo_area_id) || 0) + 1);
      });

      // Combine data
      return (metroData || []).map(metro => ({
        id: metro.id,
        name: metro.name,
        slug: metro.slug,
        is_active: metro.is_active ?? true,
        centroid_lat: metro.centroid_lat,
        centroid_lng: metro.centroid_lng,
        city_count: cityCountMap.get(metro.id) || 0,
        place_count: placeCountMap.get(metro.id) || 0,
        counties: countyMap.get(metro.id) || [],
      })) as MetroWithDetails[];
    },
  });

  // Create metro
  const createMetro = useMutation({
    mutationFn: async (input: MetroInsert) => {
      const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const { data, error } = await supabase
        .from('geo_areas')
        .insert({
          name: input.name,
          slug,
          type: 'metro',
          is_active: true,
          centroid_lat: input.centroid_lat,
          centroid_lng: input.centroid_lng,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metros'] });
      toast({ title: 'Metro created' });
    },
    onError: (error) => {
      toast({ title: 'Failed to create metro', description: error.message, variant: 'destructive' });
    },
  });

  // Update metro
  const updateMetro = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: MetroUpdate }) => {
      const { data, error } = await supabase
        .from('geo_areas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['metros'] });
      queryClient.invalidateQueries({ queryKey: ['metro', variables.id] });
      toast({ title: 'Metro updated' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update metro', description: error.message, variant: 'destructive' });
    },
  });

  // Add county to metro
  const addCounty = useMutation({
    mutationFn: async ({ metroId, countyName, stateCode, countryCode = 'US' }: {
      metroId: string;
      countyName: string;
      stateCode: string;
      countryCode?: string;
    }) => {
      const { data, error } = await supabase
        .from('metro_counties')
        .insert({
          metro_id: metroId,
          county_name: countyName,
          state_code: stateCode,
          country_code: countryCode,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metros'] });
      toast({ title: 'County added to metro' });
    },
    onError: (error) => {
      toast({ title: 'Failed to add county', description: error.message, variant: 'destructive' });
    },
  });

  // Remove county from metro
  const removeCounty = useMutation({
    mutationFn: async (countyId: string) => {
      const { error } = await supabase
        .from('metro_counties')
        .delete()
        .eq('id', countyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metros'] });
      toast({ title: 'County removed from metro' });
    },
    onError: (error) => {
      toast({ title: 'Failed to remove county', description: error.message, variant: 'destructive' });
    },
  });

  return {
    metros: metros || [],
    isLoading,
    error,
    refetch,
    createMetro,
    updateMetro,
    addCounty,
    removeCounty,
  };
}
