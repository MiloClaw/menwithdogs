import { useState, useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { isValidPlaceType, getPlaceTypeLabel } from '@/lib/google-places-types';
export interface NearbyPlace {
  place_id: string;
  name: string;
  formatted_address: string;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  user_ratings_total: number | null;
  primary_type: string | null;
  primary_type_display: string | null;
  price_level: number | null;
  photos: Array<{ name: string; widthPx: number; heightPx: number }>;
}

export interface SeedCandidate extends NearbyPlace {
  selected: boolean;
  isDuplicate: boolean;
  keywordMatches?: string[];
  reviewSnippets?: string[];
  reviewsScanned?: boolean;
  isScanning?: boolean;
  discoveredFrom?: string;
  categoryGroup?: string; // Track which category group this place belongs to
}

// Discovery statistics for transparency
export interface DiscoveryStats {
  totalApiResults: number;
  afterDedup: number;
  filteredByQuality: number;
  duplicatesInDb: number;
  byDiscoveryPoint: Record<string, number>;
  byCategory: Record<string, number>;
}

interface NearbySearchParams {
  lat: number;
  lng: number;
  radius: number;
  includedTypes: string[];
}

// ========================================================================
// Google Places API (New) Table A Types - VALIDATED
// Reference: https://developers.google.com/maps/documentation/places/web-service/place-types
// ========================================================================

// Focused venue types - optimized for 1 API call (5 types max)
export const FOCUSED_VENUE_TYPES = [
  'restaurant',      // Core dining
  'bar',             // Core nightlife  
  'cafe',            // Daytime social
  'night_club',      // Late night
  'art_gallery',     // Culture
] as const;

// Interest-Aligned: Types that map directly to user interests (all validated Table A)
export const INTEREST_ALIGNED_TYPES = [
  // Dining
  'restaurant', 'bar', 'cafe', 'coffee_shop', 'brunch_restaurant', 'wine_bar',
  // Culture
  'museum', 'art_gallery', 'performing_arts_theater', 'movie_theater',
  // Fitness
  'gym', 'fitness_center', 'yoga_studio', 'spa',
  // Outdoor
  'hiking_area', 'beach', 'park', 'marina', 'dog_park',
  // Entertainment
  'bowling_alley', 'comedy_club', 'night_club', 'karaoke', 'amusement_center',
] as const;

// Curated anchor venue types for seeding (validated Table A)
export const ANCHOR_VENUE_TYPES = [
  'restaurant', 'cafe', 'bakery', 'coffee_shop',
  'bar', 'wine_bar', 'pub', 'night_club',
  'movie_theater', 'bowling_alley', 'gym',
  'museum', 'art_gallery',
  'park', 'hiking_area',
] as const;

// Extended venue types - comprehensive discovery (all validated Table A)
export const EXTENDED_VENUE_TYPES = [
  // Dining & Food
  'restaurant', 'cafe', 'bakery', 'coffee_shop', 'ice_cream_shop',
  'brunch_restaurant', 'fine_dining_restaurant', 'seafood_restaurant',
  'italian_restaurant', 'mexican_restaurant', 'japanese_restaurant',
  'steak_house', 'pizza_restaurant', 'barbecue_restaurant',
  // Nightlife & Bars
  'bar', 'wine_bar', 'pub', 'night_club', 'comedy_club', 'karaoke',
  // Entertainment
  'movie_theater', 'performing_arts_theater', 'concert_hall',
  'bowling_alley', 'amusement_center', 'amusement_park', 'video_arcade',
  'aquarium', 'zoo', 'casino', 'event_venue', 'water_park',
  // Culture & Museums
  'museum', 'art_gallery', 'art_studio', 'library', 'tourist_attraction',
  'historical_landmark', 'botanical_garden', 'planetarium',
  // Wellness & Fitness
  'gym', 'fitness_center', 'spa', 'yoga_studio', 'wellness_center',
  // Outdoor & Nature
  'park', 'hiking_area', 'beach', 'marina', 'dog_park', 'campground',
  'national_park', 'state_park', 'garden', 'picnic_ground',
  // Sports & Recreation
  'golf_course', 'ski_resort', 'ice_skating_rink', 'swimming_pool',
  // Getaways & Lodging
  'hotel', 'bed_and_breakfast', 'resort_hotel',
] as const;

// Category groups for UI organization (all validated Table A types)
export const VENUE_CATEGORY_GROUPS = [
  {
    label: 'Dining & Food',
    types: [
      'restaurant', 'cafe', 'bakery', 'coffee_shop', 'ice_cream_shop',
      'brunch_restaurant', 'fine_dining_restaurant', 'seafood_restaurant',
      'italian_restaurant', 'mexican_restaurant', 'japanese_restaurant',
      'steak_house', 'pizza_restaurant', 'barbecue_restaurant',
    ],
  },
  {
    label: 'Nightlife & Bars',
    types: ['bar', 'wine_bar', 'pub', 'night_club', 'comedy_club', 'karaoke'],
  },
  {
    label: 'Live Performance',
    types: ['performing_arts_theater', 'movie_theater', 'concert_hall', 'amphitheatre'],
  },
  {
    label: 'Games & Activities',
    types: ['bowling_alley', 'amusement_center', 'amusement_park', 'video_arcade', 'casino', 'water_park'],
  },
  {
    label: 'Culture & Museums',
    types: ['museum', 'art_gallery', 'art_studio', 'library', 'tourist_attraction', 'historical_landmark', 'planetarium'],
  },
  {
    label: 'Fitness & Wellness',
    types: ['gym', 'fitness_center', 'yoga_studio', 'spa', 'wellness_center'],
  },
  {
    label: 'Outdoor & Nature',
    types: ['park', 'hiking_area', 'beach', 'marina', 'dog_park', 'campground', 'national_park', 'state_park', 'garden', 'botanical_garden', 'picnic_ground'],
  },
  {
    label: 'Animals & Wildlife',
    types: ['zoo', 'aquarium'],
  },
  {
    label: 'Sports & Recreation',
    types: ['golf_course', 'ski_resort', 'ice_skating_rink', 'swimming_pool', 'athletic_field'],
  },
  {
    label: 'Getaways & Lodging',
    types: ['hotel', 'bed_and_breakfast', 'resort_hotel', 'campground'],
  },
];

// Default LGBTQ-friendly keywords for review scanning
export const DEFAULT_REVIEW_KEYWORDS = [
  'gay', 'LGBT', 'LGBTQ', 'queer', 'inclusive', 'affirming', 'pride', 'welcoming'
] as const;

// Known LGBTQ+ neighborhoods for quick-add suggestions
export const KNOWN_NEIGHBORHOODS: Record<string, string[]> = {
  'Dallas': ['Oak Lawn', 'Bishop Arts District', 'Uptown', 'Deep Ellum', 'Design District'],
  'Austin': ['South Congress', 'East Austin', 'Rainey Street', 'The Domain', 'Downtown'],
  'Houston': ['Montrose', 'The Heights', 'Midtown', 'EaDo', 'River Oaks'],
  'San Antonio': ['Southtown', 'Pearl District', 'King William', 'Downtown'],
  'Fort Worth': ['Near Southside', 'Sundance Square', 'West 7th', 'Fairmount'],
  'San Francisco': ['Castro', 'Mission', 'Hayes Valley', 'SOMA', 'Noe Valley'],
  'Los Angeles': ['West Hollywood', 'Silver Lake', 'Echo Park', 'Downtown LA', 'Los Feliz'],
  'New York': ['Chelsea', "Hell's Kitchen", 'West Village', 'Williamsburg', 'East Village'],
  'Chicago': ['Boystown', 'Andersonville', 'Wicker Park', 'Logan Square', 'Pilsen'],
  'Atlanta': ['Midtown', 'Virginia-Highland', 'East Atlanta', 'Little Five Points', 'Inman Park'],
  'Denver': ['Capitol Hill', 'RiNo', 'Baker', 'Highlands', 'LoDo'],
  'Seattle': ['Capitol Hill', 'Fremont', 'Ballard', 'Columbia City', 'Georgetown'],
  'Miami': ['South Beach', 'Wynwood', 'Wilton Manors', 'Coconut Grove', 'Design District'],
  'Phoenix': ['Roosevelt Row', 'Downtown Phoenix', 'Melrose District', 'Arcadia', 'Tempe'],
  'Portland': ['Pearl District', 'Alberta Arts District', 'Hawthorne', 'Division', 'Mississippi'],
  'Philadelphia': ['Gayborhood', 'Fishtown', 'Northern Liberties', 'South Street', 'University City'],
  'Boston': ['South End', 'Jamaica Plain', 'Cambridge', 'Provincetown', 'Back Bay'],
  'Nashville': ['The Gulch', '12 South', 'East Nashville', 'Germantown', 'Wedgewood-Houston'],
  'New Orleans': ['Marigny', 'Bywater', 'French Quarter', 'Treme', 'Garden District'],
  'Minneapolis': ['Loring Park', 'Uptown', 'Northeast', 'North Loop', 'Whittier'],
};

export interface DiscoveryPoint {
  id: string;
  label: string;
  lat: number;
  lng: number;
  placeId?: string;
  isDefault?: boolean;
}

export type WizardStep = 'configure' | 'discovering' | 'review' | 'importing' | 'complete';

export function useCitySeedWizard(cityId: string, cityName: string, defaultLat?: number, defaultLng?: number) {
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState<WizardStep>('configure');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([...FOCUSED_VENUE_TYPES]);
  const [radius, setRadius] = useState<number>(8047); // ~5 miles default (optimized)
  const [candidates, setCandidates] = useState<SeedCandidate[]>([]);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [searchKeywords, setSearchKeywords] = useState<string[]>([...DEFAULT_REVIEW_KEYWORDS]);
  const [minRating, setMinRating] = useState<number>(0); // Default to "Any" for broader discovery
  const [minReviewCount, setMinReviewCount] = useState<number>(0); // Default to "Any"
  const [discoveryStats, setDiscoveryStats] = useState<DiscoveryStats | null>(null);
  
  // Discovery points for neighborhood-based searching
  const [discoveryPoints, setDiscoveryPoints] = useState<DiscoveryPoint[]>(() => {
    if (defaultLat && defaultLng) {
      return [{
        id: 'city-center',
        label: `${cityName} (City Center)`,
        lat: defaultLat,
        lng: defaultLng,
        isDefault: true,
      }];
    }
    return [];
  });

  // Fetch existing places in this city to detect duplicates
  const { data: existingPlaces = [] } = useQuery({
    queryKey: ['admin-places-city', cityName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('places')
        .select('google_place_id, name')
        .ilike('city', cityName);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Add a discovery point (neighborhood)
  const addDiscoveryPoint = useCallback((point: Omit<DiscoveryPoint, 'id'>) => {
    const id = `point-${Date.now()}`;
    setDiscoveryPoints(prev => [...prev, { ...point, id }]);
  }, []);

  // Remove a discovery point (including city center)
  const removeDiscoveryPoint = useCallback((pointId: string) => {
    setDiscoveryPoints(prev => prev.filter(p => p.id !== pointId));
  }, []);

  // Map primary_type to category group for filtering
  const getCategoryGroup = (primaryType: string | null): string => {
    if (!primaryType) return 'Other';
    for (const group of VENUE_CATEGORY_GROUPS) {
      if (group.types.includes(primaryType)) {
        return group.label;
      }
    }
    return 'Other';
  };

  // Search nearby places from ALL discovery points
  const searchNearby = useMutation({
    mutationFn: async (params: NearbySearchParams & { discoveryPoints: DiscoveryPoint[] }) => {
      const allPlaces: (NearbyPlace & { discoveredFrom?: string })[] = [];
      
      // RUNTIME VALIDATION: Filter to only valid Google Places types
      const validatedTypes = params.includedTypes.filter(t => isValidPlaceType(t));
      const invalidTypes = params.includedTypes.filter(t => !isValidPlaceType(t));
      
      if (invalidTypes.length > 0) {
        console.warn('Filtered out invalid place types:', invalidTypes);
      }
      
      if (validatedTypes.length === 0) {
        throw new Error('No valid place types selected');
      }
      
      // Split types into batches of 5 (Google API limit per call)
      const typeBatches: string[][] = [];
      for (let i = 0; i < validatedTypes.length; i += 5) {
        typeBatches.push(validatedTypes.slice(i, i + 5));
      }

      const byDiscoveryPoint: Record<string, number> = {};
      let totalApiResults = 0;

      // Search from each discovery point
      for (const point of params.discoveryPoints) {
        console.log(`Searching near: ${point.label}`);
        let pointCount = 0;
        
        for (const batch of typeBatches) {
          const { data, error } = await supabase.functions.invoke('google-places-nearby', {
            body: {
              lat: point.lat,
              lng: point.lng,
              radius: params.radius,
              includedTypes: batch,
              maxResultCount: 20,
            },
          });

          if (error) {
            console.error(`Nearby search error for ${point.label}:`, error);
            continue;
          }

          if (data?.places) {
            totalApiResults += data.places.length;
            pointCount += data.places.length;
            
            // Tag each place with where it was discovered
            const taggedPlaces = data.places.map((p: NearbyPlace) => ({
              ...p,
              discoveredFrom: point.label,
            }));
            allPlaces.push(...taggedPlaces);
          }
        }
        
        byDiscoveryPoint[point.label] = pointCount;
      }

      // De-duplicate by place_id (keep first occurrence to preserve discoveredFrom)
      const uniquePlaces = Array.from(
        new Map(allPlaces.map(p => [p.place_id, p])).values()
      );

      return { places: uniquePlaces, totalApiResults, byDiscoveryPoint };
    },
    onSuccess: ({ places, totalApiResults, byDiscoveryPoint }) => {
      const existingIds = new Set(existingPlaces.map(p => p.google_place_id));
      
      // Filter by quality thresholds (only if > 0)
      const qualityFiltered = places.filter(place => {
        const rating = place.rating || 0;
        const reviews = place.user_ratings_total || 0;
        const passesRating = minRating === 0 || rating >= minRating;
        const passesReviews = minReviewCount === 0 || reviews >= minReviewCount;
        return passesRating && passesReviews;
      });

      // Track category distribution
      const byCategory: Record<string, number> = {};
      
      const candidatesWithStatus: SeedCandidate[] = qualityFiltered.map(place => {
        const categoryGroup = getCategoryGroup(place.primary_type);
        byCategory[categoryGroup] = (byCategory[categoryGroup] || 0) + 1;
        
        return {
          ...place,
          isDuplicate: existingIds.has(place.place_id),
          selected: !existingIds.has(place.place_id), // Auto-select non-duplicates
          reviewsScanned: false,
          isScanning: false,
          categoryGroup,
        };
      });

      // Sort: non-duplicates first, then by rating
      candidatesWithStatus.sort((a, b) => {
        if (a.isDuplicate !== b.isDuplicate) return a.isDuplicate ? 1 : -1;
        return (b.rating || 0) - (a.rating || 0);
      });

      // Build discovery stats
      const duplicatesInDb = candidatesWithStatus.filter(c => c.isDuplicate).length;
      const stats: DiscoveryStats = {
        totalApiResults,
        afterDedup: places.length,
        filteredByQuality: places.length - qualityFiltered.length,
        duplicatesInDb,
        byDiscoveryPoint,
        byCategory,
      };
      
      setDiscoveryStats(stats);
      setCandidates(candidatesWithStatus);
      setStep('review');
      
      // Show discovery summary
      const qualityNote = stats.filteredByQuality > 0 
        ? ` • ${stats.filteredByQuality} filtered by quality` 
        : '';
      toast.success(`Found ${candidatesWithStatus.length} places${qualityNote}`);
    },
    onError: (error) => {
      console.error('Search failed:', error);
      toast.error('Failed to search nearby places');
      setStep('configure');
    },
  });

  // Helper to find keyword matches in reviews and extract snippets
  const findKeywordMatchesWithSnippets = (
    reviews: Array<{ text: string }> | undefined, 
    keywords: string[]
  ): { matches: string[]; snippets: string[] } => {
    if (!reviews || reviews.length === 0 || keywords.length === 0) {
      return { matches: [], snippets: [] };
    }
    
    const matches = new Set<string>();
    const snippets: string[] = [];
    const lowerKeywords = keywords.map(k => k.toLowerCase().trim()).filter(k => k.length > 0);
    
    for (const review of reviews) {
      if (!review.text) continue;
      const text = review.text;
      const lowerText = text.toLowerCase();
      
      for (const keyword of lowerKeywords) {
        if (lowerText.includes(keyword)) {
          matches.add(keyword);
          // Extract a snippet around the keyword (first match only per review)
          const keywordIndex = lowerText.indexOf(keyword);
          const start = Math.max(0, keywordIndex - 50);
          const end = Math.min(text.length, keywordIndex + keyword.length + 50);
          const snippet = (start > 0 ? '...' : '') + 
                         text.slice(start, end).trim() + 
                         (end < text.length ? '...' : '');
          if (!snippets.includes(snippet) && snippets.length < 3) {
            snippets.push(snippet);
          }
          break; // Only one snippet per review
        }
      }
    }
    
    return { matches: Array.from(matches), snippets };
  };

  // Scan reviews for a single candidate (on-demand)
  const scanCandidateReviews = useMutation({
    mutationFn: async (placeId: string) => {
      // Mark as scanning
      setCandidates(prev => prev.map(c => 
        c.place_id === placeId ? { ...c, isScanning: true } : c
      ));

      const { data, error } = await supabase.functions.invoke('google-places-details', {
        body: { place_id: placeId, includeReviews: true },
      });

      if (error) throw error;
      return { placeId, details: data?.details };
    },
    onSuccess: ({ placeId, details }) => {
      const { matches, snippets } = findKeywordMatchesWithSnippets(details?.reviews, searchKeywords);
      
      setCandidates(prev => prev.map(c => 
        c.place_id === placeId 
          ? { 
              ...c, 
              keywordMatches: matches, 
              reviewSnippets: snippets,
              reviewsScanned: true, 
              isScanning: false 
            } 
          : c
      ));

      if (matches.length > 0) {
        toast.success(`Found ${matches.length} keyword match(es)`);
      } else {
        toast.info('No keyword matches found in reviews');
      }
    },
    onError: (error, placeId) => {
      console.error('Review scan failed:', error);
      setCandidates(prev => prev.map(c => 
        c.place_id === placeId ? { ...c, isScanning: false } : c
      ));
      toast.error('Failed to scan reviews');
    },
  });

  // Scan all visible candidates
  const scanAllReviews = useMutation({
    mutationFn: async (placeIds: string[]) => {
      const results: { placeId: string; matches: string[]; snippets: string[] }[] = [];
      
      for (const placeId of placeIds) {
        // Mark as scanning
        setCandidates(prev => prev.map(c => 
          c.place_id === placeId ? { ...c, isScanning: true } : c
        ));

        try {
          const { data, error } = await supabase.functions.invoke('google-places-details', {
            body: { place_id: placeId, includeReviews: true },
          });

          if (error) {
            console.error(`Review scan failed for ${placeId}:`, error);
            continue;
          }

          const { matches, snippets } = findKeywordMatchesWithSnippets(data?.details?.reviews, searchKeywords);
          results.push({ placeId, matches, snippets });

          // Update candidate immediately
          setCandidates(prev => prev.map(c => 
            c.place_id === placeId 
              ? { 
                  ...c, 
                  keywordMatches: matches, 
                  reviewSnippets: snippets,
                  reviewsScanned: true, 
                  isScanning: false 
                } 
              : c
          ));
        } catch (err) {
          console.error(`Error scanning ${placeId}:`, err);
          setCandidates(prev => prev.map(c => 
            c.place_id === placeId ? { ...c, isScanning: false } : c
          ));
        }
      }

      return results;
    },
    onSuccess: (results) => {
      const matchCount = results.filter(r => r.matches.length > 0).length;
      toast.success(`Scanned ${results.length} places • ${matchCount} with keyword matches`);
    },
  });

  // Import selected candidates (no review fetching - done on-demand)
  const importPlaces = useMutation({
    mutationFn: async (selectedCandidates: SeedCandidate[]) => {
      const results: { success: number; failed: number; keywordMatchCount: number } = { 
        success: 0, 
        failed: 0,
        keywordMatchCount: 0 
      };
      setImportProgress({ current: 0, total: selectedCandidates.length });

      for (let i = 0; i < selectedCandidates.length; i++) {
        const candidate = selectedCandidates[i];
        setImportProgress({ current: i + 1, total: selectedCandidates.length });

        // Count pre-scanned keyword matches
        if (candidate.keywordMatches && candidate.keywordMatches.length > 0) {
          results.keywordMatchCount++;
        }

        try {
          // Fetch basic details (no reviews - they were scanned on-demand)
          const { data: detailsData, error: detailsError } = await supabase.functions.invoke(
            'google-places-details',
            { body: { place_id: candidate.place_id, includeReviews: false } }
          );

          if (detailsError || !detailsData?.details) {
            console.error(`Failed to fetch details for ${candidate.name}:`, detailsError);
            results.failed++;
            continue;
          }

          const details = detailsData.details;

          // Insert place with pending status
          const { error: insertError } = await supabase.from('places').insert({
            google_place_id: candidate.place_id,
            name: details.name || candidate.name,
            formatted_address: details.formatted_address || candidate.formatted_address,
            city: details.city || cityName,
            state: details.state,
            country: details.country || 'US',
            lat: details.lat || candidate.lat,
            lng: details.lng || candidate.lng,
            rating: details.rating || candidate.rating,
            user_ratings_total: details.user_ratings_total || candidate.user_ratings_total,
            price_level: details.price_level || candidate.price_level,
            website_url: details.website_url,
            phone_number: details.phone_number,
            google_maps_url: details.google_maps_url,
            opening_hours: details.opening_hours,
            photos: details.photos || candidate.photos,
            google_primary_type: details.google_primary_type || candidate.primary_type,
            google_primary_type_display: details.google_primary_type_display || candidate.primary_type_display,
            primary_category: 'restaurant', // Default, can be refined later
            source: 'google_places',
            status: 'pending',
          });

          if (insertError) {
            // Check for duplicate constraint
            if (insertError.code === '23505') {
              console.log(`Duplicate place skipped: ${candidate.name}`);
            } else {
              console.error(`Failed to insert ${candidate.name}:`, insertError);
            }
            results.failed++;
          } else {
            results.success++;
          }
        } catch (err) {
          console.error(`Error processing ${candidate.name}:`, err);
          results.failed++;
        }
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['admin-places'] });
      queryClient.invalidateQueries({ queryKey: ['admin-places-city'] });
      queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
      
      let message = `Imported ${results.success} places`;
      if (results.failed > 0) message += ` (${results.failed} failed)`;
      if (results.keywordMatchCount > 0) message += ` • ${results.keywordMatchCount} with keyword matches`;
      
      toast.success(message);
      setStep('complete');
    },
    onError: (error) => {
      console.error('Import failed:', error);
      toast.error('Failed to import places');
    },
  });

  const startDiscovery = useCallback(() => {
    if (selectedTypes.length === 0) {
      toast.error('Please select at least one category');
      return;
    }
    
    if (discoveryPoints.length === 0) {
      toast.error('Please add at least one discovery point');
      return;
    }
    
    setStep('discovering');
    // Use the first point's coordinates as the base params (for compatibility),
    // but pass all discovery points for multi-point search
    const firstPoint = discoveryPoints[0];
    searchNearby.mutate({ 
      lat: firstPoint.lat, 
      lng: firstPoint.lng, 
      radius, 
      includedTypes: selectedTypes,
      discoveryPoints,
    });
  }, [selectedTypes, radius, discoveryPoints, searchNearby]);

  const startImport = useCallback(() => {
    const selected = candidates.filter(c => c.selected && !c.isDuplicate);
    if (selected.length === 0) {
      toast.error('No places selected for import');
      return;
    }
    
    setStep('importing');
    importPlaces.mutate(selected);
  }, [candidates, importPlaces]);

  const toggleCandidate = useCallback((placeId: string) => {
    setCandidates(prev => prev.map(c => 
      c.place_id === placeId ? { ...c, selected: !c.selected } : c
    ));
  }, []);

  const selectAll = useCallback((selectNew: boolean) => {
    setCandidates(prev => prev.map(c => ({
      ...c,
      selected: c.isDuplicate ? false : selectNew,
    })));
  }, []);

  const reset = useCallback(() => {
    setStep('configure');
    setCandidates([]);
    setImportProgress({ current: 0, total: 0 });
    setSearchKeywords([]);
    setDiscoveryStats(null);
  }, []);

  // Compute unique category groups from candidates
  const categoryGroups = useMemo(() => {
    const groups = new Set(candidates.map(c => c.categoryGroup || 'Other'));
    return ['All', ...Array.from(groups).sort()];
  }, [candidates]);

  const selectedCount = candidates.filter(c => c.selected && !c.isDuplicate).length;
  const newCandidateCount = candidates.filter(c => !c.isDuplicate).length;
  const scannedCount = candidates.filter(c => c.reviewsScanned).length;
  const keywordMatchCount = candidates.filter(c => (c.keywordMatches?.length ?? 0) > 0).length;

  return {
    // State
    step,
    selectedTypes,
    radius,
    candidates,
    importProgress,
    selectedCount,
    newCandidateCount,
    scannedCount,
    keywordMatchCount,
    isSearching: searchNearby.isPending,
    isImporting: importPlaces.isPending,
    isScanningReviews: scanCandidateReviews.isPending || scanAllReviews.isPending,
    searchKeywords,
    minRating,
    minReviewCount,
    discoveryPoints,
    discoveryStats,
    categoryGroups,
    
    // Actions
    setSelectedTypes,
    setRadius,
    startDiscovery,
    startImport,
    toggleCandidate,
    selectAll,
    reset,
    setStep,
    setSearchKeywords,
    setMinRating,
    setMinReviewCount,
    addDiscoveryPoint,
    removeDiscoveryPoint,
    scanCandidateReviews: scanCandidateReviews.mutate,
    scanAllReviews: scanAllReviews.mutate,
  };
}
