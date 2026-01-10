/**
 * PHASE 2: Intelligence Activation - Personalized Places Hook
 * 
 * Wraps usePublicPlaces with affinity-weighted sorting so recommendations
 * feel personalized within 2-3 interactions.
 * 
 * ARCHITECTURE:
 * - Distance remains the foundation (users still see nearby places)
 * - Affinity provides gentle relevance boost (not hard filtering)
 * - Intent preferences expand to category matches
 * - No scores, weights, or internal metrics exposed to UI
 */

import { useMemo } from 'react';
import { usePublicPlaces, UsePublicPlacesOptions } from './usePublicPlaces';
import { useUserAffinity } from './useUserAffinity';
import { useUserPreferences } from './useUserPreferences';
import { useAuth } from './useAuth';
import { getExpandedCategories } from '@/lib/category-aliases';
import { DirectoryPlace } from '@/components/directory/DirectoryPlaceCard';
import { calculateDistanceMiles } from '@/lib/distance';

interface PersonalizedPlace extends DirectoryPlace {
  distance?: number;
  isRelevant?: boolean; // For "For you" badge - never expose score
}

interface UsePersonalizedPlacesOptions extends UsePublicPlacesOptions {
  // Reference coordinates for distance calculation (exploration mode)
  referenceCoords?: { lat: number; lng: number } | null;
}

/**
 * PHASE 2: Intelligence Activation - Personalized Places Hook
 * 
 * PHASE 1 FIX: Exploration mode now uses explored city coordinates
 * for distance sorting, not user's home location.
 */
export function usePersonalizedPlaces(options: UsePersonalizedPlacesOptions) {
  const { isAuthenticated } = useAuth();
  const { data: places, isLoading, isSwitchingLocation, ...rest } = usePublicPlaces(options);
  const { affinities } = useUserAffinity();
  const { preferences } = useUserPreferences();
  
  // Determine if we're in exploration mode (viewing a different city)
  const isExplorationMode = !!(options.city && options.state);
  
  // Find representative coordinates for the explored city
  const exploredCityCoords = useMemo(() => {
    if (!isExplorationMode || !places?.length) return null;
    
    // Use the first place in the filtered city as approximate center
    const cityPlace = places.find(p => 
      p.city?.toLowerCase() === options.city?.toLowerCase()
    );
    
    if (cityPlace?.lat && cityPlace?.lng) {
      return { lat: cityPlace.lat, lng: cityPlace.lng };
    }
    
    return null;
  }, [places, options.city, isExplorationMode]);
  
  // Determine reference point for distance calculation
  const referencePoint = useMemo(() => {
    // Explicit override from props
    if (options.referenceCoords) {
      return options.referenceCoords;
    }
    
    // In exploration mode: use explored city center
    if (isExplorationMode && exploredCityCoords) {
      return exploredCityCoords;
    }
    
    // Default: use provided lat/lng (user location)
    if (options.lat != null && options.lng != null) {
      return { lat: options.lat, lng: options.lng };
    }
    
    return null;
  }, [options.lat, options.lng, options.referenceCoords, isExplorationMode, exploredCityCoords]);
  
  const personalizedPlaces = useMemo(() => {
    if (!places) return [];
    
    // Calculate distances using appropriate reference point
    const placesWithDistance = places.map(place => {
      let distance: number | undefined;
      if (referencePoint && place.lat != null && place.lng != null) {
        distance = calculateDistanceMiles(
          referencePoint.lat,
          referencePoint.lng,
          place.lat,
          place.lng
        );
      }
      return { ...place, distance };
    });
    
    // For unauthenticated users or no affinity data, return distance-sorted only
    if (!isAuthenticated || affinities.length === 0) {
      return placesWithDistance.sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        if (a.distance !== undefined) return -1;
        if (b.distance !== undefined) return 1;
        return a.name.localeCompare(b.name);
      }) as PersonalizedPlace[];
    }
    
    // Build affinity lookup map (category -> score)
    const affinityMap = new Map<string, number>(
      affinities.map(a => [a.place_category, a.affinity_score])
    );
    
    // Get expanded categories from intent preferences
    const intentPrefs = preferences?.intent_preferences || [];
    const intentCategories = new Set(getExpandedCategories(intentPrefs));
    
    // Score and sort places
    const scored = placesWithDistance.map(place => {
      const category = place.primary_category;
      
      // Calculate relevance boost (internal only, never exposed)
      let relevanceScore = 0;
      
      // 1. Behavioral affinity (from saves, views, clicks)
      if (category && affinityMap.has(category)) {
        relevanceScore += affinityMap.get(category)! * 0.6;
      }
      
      // 2. Explicit intent preference match
      if (category && intentCategories.has(category)) {
        relevanceScore += 0.4;
      }
      
      // Determine if this place is "relevant" for badge (threshold)
      const isRelevant = relevanceScore >= 0.3;
      
      return {
        ...place,
        _relevanceScore: relevanceScore, // Internal only
        isRelevant,
      };
    });
    
    // Sort: relevance boost + distance
    // Scale factor ensures relevance matters but doesn't override proximity entirely
    return scored.sort((a, b) => {
      const RELEVANCE_WEIGHT = 30; // Miles equivalent for max relevance
      const DISTANCE_WEIGHT = 1;
      
      // Calculate effective distance (lower is better)
      const aEffective = 
        (a.distance ?? 100) * DISTANCE_WEIGHT - 
        (a._relevanceScore || 0) * RELEVANCE_WEIGHT;
      
      const bEffective = 
        (b.distance ?? 100) * DISTANCE_WEIGHT - 
        (b._relevanceScore || 0) * RELEVANCE_WEIGHT;
      
      return aEffective - bEffective;
    }).map(({ _relevanceScore, ...place }) => place) as PersonalizedPlace[];
    
  }, [places, isAuthenticated, affinities, preferences?.intent_preferences, referencePoint]);
  
  return {
    data: personalizedPlaces,
    isLoading,
    isSwitchingLocation,
    ...rest,
  };
}
