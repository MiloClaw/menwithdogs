import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DirectoryPlace } from '@/components/directory/DirectoryPlaceCard';
import { useRef, useState, useEffect } from 'react';

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function useMapPlaces(bounds: MapBounds | null, enabled: boolean = true) {
  // Debounce bounds changes
  const [debouncedBounds, setDebouncedBounds] = useState<MapBounds | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!bounds) {
      setDebouncedBounds(null);
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Check if bounds changed significantly (more than 0.05 degrees ~ 5km)
    if (debouncedBounds) {
      const significantChange = 
        Math.abs(bounds.north - debouncedBounds.north) > 0.05 ||
        Math.abs(bounds.south - debouncedBounds.south) > 0.05 ||
        Math.abs(bounds.east - debouncedBounds.east) > 0.05 ||
        Math.abs(bounds.west - debouncedBounds.west) > 0.05;

      if (!significantChange) {
        return; // Don't update if change is too small
      }
    }

    // Debounce the update
    timeoutRef.current = setTimeout(() => {
      setDebouncedBounds(bounds);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [bounds?.north, bounds?.south, bounds?.east, bounds?.west]);

  // Set initial bounds immediately (no debounce for first load)
  useEffect(() => {
    if (bounds && !debouncedBounds) {
      setDebouncedBounds(bounds);
    }
  }, [bounds, debouncedBounds]);

  return useQuery({
    queryKey: ['places', 'map-viewport', debouncedBounds],
    enabled: enabled && debouncedBounds !== null,
    staleTime: 60_000, // Cache for 1 minute
    queryFn: async (): Promise<DirectoryPlace[]> => {
      if (!debouncedBounds) return [];

      const { data, error } = await supabase
        .from('places')
        .select(`
          id,
          google_place_id,
          name,
          formatted_address,
          city,
          state,
          lat,
          lng,
          primary_category,
          rating,
          user_ratings_total,
          price_level,
          stored_photo_urls,
          photos,
          website_url,
          google_maps_url,
          phone_number,
          opening_hours,
          google_types,
          status,
          source,
          allows_dogs,
          wheelchair_accessible_entrance,
          wheelchair_accessible_restroom,
          wheelchair_accessible_seating,
          outdoor_seating,
          has_restroom,
          national_park_id
        `)
        .eq('status', 'approved')
        .gte('lat', debouncedBounds.south)
        .lte('lat', debouncedBounds.north)
        .gte('lng', debouncedBounds.west)
        .lte('lng', debouncedBounds.east)
        .limit(500); // Reasonable limit for map performance

      if (error) {
        console.error('Error fetching map places:', error);
        throw error;
      }

      // Return data matching DirectoryPlace interface
      return (data || []) as DirectoryPlace[];
    },
  });
}
