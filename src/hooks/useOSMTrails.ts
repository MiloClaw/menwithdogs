import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface OSMTrailFeature {
  type: 'Feature';
  properties: {
    TrailName: string;
    TrailClass: string; // 1-5 scale (mapped from sac_scale)
    TrailSurface: string;
    Miles: number | null;
    highway?: string;
    sac_scale?: string;
    route?: string;
  };
  geometry: {
    type: 'LineString' | 'MultiLineString';
    coordinates: number[][] | number[][][];
  };
}

interface OSMTrailsGeoJSON {
  type: 'FeatureCollection';
  features: OSMTrailFeature[];
  _meta?: {
    error?: string;
    status?: number;
  };
}

interface UseOSMTrailsOptions {
  bounds: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  parkId?: string; // Optional, used for cache key
  enabled?: boolean;
}

export function useOSMTrails({ bounds, parkId, enabled = true }: UseOSMTrailsOptions) {
  return useQuery({
    queryKey: ['osm-trails', parkId || 'region', bounds],
    queryFn: async (): Promise<OSMTrailsGeoJSON> => {
      const { data, error } = await supabase.functions.invoke('osm-trails', {
        body: { bounds },
      });

      if (error) {
        console.error('Error fetching OSM trails:', error);
        throw error;
      }

      // Log if there was an API-level error
      if (data?._meta?.error) {
        console.warn('OSM trails API warning:', data._meta);
      }

      return data as OSMTrailsGeoJSON;
    },
    enabled: enabled && bounds.length === 4,
    staleTime: 1000 * 60 * 60, // 1 hour cache
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
  });
}

// Map trail class (1-5) to difficulty label
export function getTrailClassLabel(trailClass: string | number): string {
  const classNum = typeof trailClass === 'string' ? parseInt(trailClass, 10) : trailClass;
  
  if (classNum <= 2) return 'Easy';
  if (classNum <= 3) return 'Moderate';
  return 'Strenuous';
}

// Map trail class to color
export function getTrailClassColor(trailClass: string | number): string {
  const classNum = typeof trailClass === 'string' ? parseInt(trailClass, 10) : trailClass;
  
  if (classNum <= 2) return '#22c55e'; // green-500
  if (classNum <= 3) return '#eab308'; // yellow-500
  return '#ef4444'; // red-500
}

// Map OSM sac_scale directly to color (alternative mapping)
export function getSacScaleColor(sacScale: string | undefined): string {
  if (!sacScale) return '#3F5E4A'; // brand-green default
  
  const colorMap: Record<string, string> = {
    'hiking': '#22c55e',
    'mountain_hiking': '#22c55e',
    'demanding_mountain_hiking': '#eab308',
    'alpine_hiking': '#ef4444',
    'demanding_alpine_hiking': '#ef4444',
    'difficult_alpine_hiking': '#ef4444',
  };
  
  return colorMap[sacScale] || '#3F5E4A';
}
