import { useMemo } from 'react';
import { usePublicPlaces, UsePublicPlacesOptions } from '@/hooks/usePublicPlaces';
import { useOverlapSession, OverlapAffinity } from '@/hooks/useOverlapSession';
import { calculateDistanceMiles } from '@/lib/distance';
import type { DirectoryPlace } from '@/components/directory/DirectoryPlaceCard';

interface UseOverlapPlacesOptions extends UsePublicPlacesOptions {
  enabled?: boolean;
}

/**
 * Hook that returns places sorted by overlap affinity when an active session exists.
 * Falls back to distance-only sorting if no overlap data is available.
 */
export function useOverlapPlaces(options: UseOverlapPlacesOptions = {}) {
  const { lat, lng, radiusMiles = 100, city, state, enabled = true } = options;
  
  const { 
    activeSession, 
    overlapAffinities, 
    hasActiveSession,
    isLoadingAffinities 
  } = useOverlapSession();
  
  const { data: places, isLoading: isLoadingPlaces, ...queryRest } = usePublicPlaces({
    lat,
    lng,
    radiusMiles,
    city,
    state,
  });

  // Create affinity lookup map for O(1) access
  const affinityMap = useMemo(() => {
    if (!overlapAffinities?.length) return new Map<string, number>();
    return new Map(
      overlapAffinities.map((a: OverlapAffinity) => [a.place_category, a.overlap_score])
    );
  }, [overlapAffinities]);

  // Sort places by overlap affinity, then by distance
  const sortedPlaces = useMemo(() => {
    if (!places?.length) return [];
    if (!enabled || !hasActiveSession) return places;

    return [...places].sort((a, b) => {
      const affinityA = affinityMap.get(a.primary_category) || 0;
      const affinityB = affinityMap.get(b.primary_category) || 0;

      // Primary sort: overlap affinity (descending)
      if (affinityA !== affinityB) {
        return affinityB - affinityA;
      }

      // Secondary sort: distance (ascending) if coordinates available
      if (lat != null && lng != null && a.lat != null && a.lng != null && b.lat != null && b.lng != null) {
        const distA = calculateDistanceMiles(lat, lng, a.lat, a.lng);
        const distB = calculateDistanceMiles(lat, lng, b.lat, b.lng);
        return distA - distB;
      }

      // Fallback: alphabetical
      return a.name.localeCompare(b.name);
    });
  }, [places, affinityMap, hasActiveSession, enabled, lat, lng]);

  // Get top categories that both users share
  const sharedCategories = useMemo(() => {
    if (!overlapAffinities?.length) return [];
    return overlapAffinities
      .filter((a: OverlapAffinity) => a.overlap_score >= 0.2)
      .slice(0, 5)
      .map((a: OverlapAffinity) => a.place_category);
  }, [overlapAffinities]);

  return {
    places: sortedPlaces,
    isLoading: isLoadingPlaces || (hasActiveSession && isLoadingAffinities),
    hasActiveSession,
    activeSession,
    sharedCategories,
    affinityMap,
    ...queryRest,
  };
}
