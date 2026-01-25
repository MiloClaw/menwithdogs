import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NPSTrailFeature {
  type: 'Feature';
  properties: {
    TrailName: string;
    TrailClass: string; // 1-5 scale
    TrailSurface: string;
    Miles: number | null;
    UnitCode: string;
  };
  geometry: {
    type: 'LineString' | 'MultiLineString';
    coordinates: number[][] | number[][][];
  };
}

interface NPSTrailsGeoJSON {
  type: 'FeatureCollection';
  features: NPSTrailFeature[];
}

interface UseNPSTrailsOptions {
  parkCode: string;
  bounds: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  enabled?: boolean;
}

export function useNPSTrails({ parkCode, bounds, enabled = true }: UseNPSTrailsOptions) {
  return useQuery({
    queryKey: ['nps-trails', parkCode, bounds],
    queryFn: async (): Promise<NPSTrailsGeoJSON> => {
      const { data, error } = await supabase.functions.invoke('nps-trails', {
        body: {
          parkCode,
          bounds,
        },
      });

      if (error) {
        console.error('Error fetching NPS trails:', error);
        throw error;
      }

      return data as NPSTrailsGeoJSON;
    },
    enabled: enabled && !!parkCode && bounds.length === 4,
    staleTime: 1000 * 60 * 60, // 1 hour cache
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
  });
}

// Map NPS trail class (1-5) to difficulty label
export function getTrailClassLabel(trailClass: string | number): string {
  const classNum = typeof trailClass === 'string' ? parseInt(trailClass, 10) : trailClass;
  
  if (classNum <= 2) return 'Easy';
  if (classNum <= 3) return 'Moderate';
  return 'Strenuous';
}

// Map NPS trail class to color
export function getTrailClassColor(trailClass: string | number): string {
  const classNum = typeof trailClass === 'string' ? parseInt(trailClass, 10) : trailClass;
  
  if (classNum <= 2) return '#22c55e'; // green-500
  if (classNum <= 3) return '#eab308'; // yellow-500
  return '#ef4444'; // red-500
}
