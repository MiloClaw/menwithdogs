import { useMemo } from 'react';
import { usePublicPlaces } from './usePublicPlaces';
import { useOverlapSession } from './useOverlapSession';
import type { DirectoryPlace } from '@/components/directory/DirectoryPlaceCard';

interface UseOverlapPlacesOptions {
  lat?: number | null;
  lng?: number | null;
}

export function useOverlapPlaces(options: UseOverlapPlacesOptions = {}) {
  const { lat, lng } = options;
  
  const {
    activeSession,
    overlapAffinities,
    hasActiveSession,
    isLoadingAffinities,
    sessionLocation,
  } = useOverlapSession();

  // Fetch places based on location
  const { data: placesData, isLoading: isLoadingPlaces } = usePublicPlaces({
    lat: lat ?? undefined,
    lng: lng ?? undefined,
  });

  const places = placesData || [];

  // Build affinity map for quick lookup
  const affinityMap = useMemo(() => {
    const map = new Map<string, number>();
    overlapAffinities.forEach((a) => {
      map.set(a.place_category, a.overlap_score);
    });
    return map;
  }, [overlapAffinities]);

  // Sort places by overlap affinity, then by distance
  const sortedPlaces = useMemo(() => {
    if (!hasActiveSession || overlapAffinities.length === 0) {
      // No active session or no overlap data - return places sorted by distance
      return [...places].sort((a, b) => {
        const distA = a.distance ?? Infinity;
        const distB = b.distance ?? Infinity;
        return distA - distB;
      });
    }

    return [...places].sort((a, b) => {
      // Get overlap score for each place's primary category
      const scoreA = affinityMap.get(a.primary_category) || 0;
      const scoreB = affinityMap.get(b.primary_category) || 0;

      // Sort by overlap score descending, then by distance ascending
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      const distA = a.distance ?? Infinity;
      const distB = b.distance ?? Infinity;
      return distA - distB;
    });
  }, [places, affinityMap, hasActiveSession, overlapAffinities.length]);

  // Get categories with high overlap (score > 0.3)
  const sharedCategories = useMemo(() => {
    return overlapAffinities
      .filter((a) => a.overlap_score > 0.3)
      .slice(0, 5)
      .map((a) => a.place_category);
  }, [overlapAffinities]);

  return {
    places: sortedPlaces,
    isLoading: isLoadingPlaces || isLoadingAffinities,
    hasActiveSession,
    activeSession,
    sharedCategories,
    affinityMap,
    sessionLocation,
  };
}
