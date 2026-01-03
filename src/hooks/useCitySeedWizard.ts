import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
}

interface NearbySearchParams {
  lat: number;
  lng: number;
  radius: number;
  includedTypes: string[];
}

// Curated anchor venue types for seeding
export const ANCHOR_VENUE_TYPES = [
  'restaurant', 'cafe', 'bakery',
  'bar', 'wine_bar', 'brewery',
  'movie_theater', 'bowling_alley',
  'museum', 'art_gallery',
  'park',
] as const;

export const EXTENDED_VENUE_TYPES = [
  ...ANCHOR_VENUE_TYPES,
  'coffee_shop', 'ice_cream_shop',
  'night_club',
  'amusement_park',
  'library', 'tourist_attraction',
  'spa', 'yoga_studio',
] as const;

export const VENUE_CATEGORY_GROUPS = [
  {
    label: 'Dining',
    types: ['restaurant', 'cafe', 'bakery', 'coffee_shop', 'ice_cream_shop'],
  },
  {
    label: 'Nightlife',
    types: ['bar', 'wine_bar', 'brewery', 'night_club'],
  },
  {
    label: 'Entertainment',
    types: ['movie_theater', 'bowling_alley', 'amusement_park'],
  },
  {
    label: 'Culture',
    types: ['museum', 'art_gallery', 'library', 'tourist_attraction'],
  },
  {
    label: 'Wellness & Outdoors',
    types: ['park', 'spa', 'yoga_studio'],
  },
];

export type WizardStep = 'configure' | 'discovering' | 'review' | 'importing' | 'complete';

export function useCitySeedWizard(cityId: string, cityName: string) {
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState<WizardStep>('configure');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([...ANCHOR_VENUE_TYPES]);
  const [radius, setRadius] = useState<number>(10000); // 10km default
  const [candidates, setCandidates] = useState<SeedCandidate[]>([]);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });

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

  // Search nearby places
  const searchNearby = useMutation({
    mutationFn: async (params: NearbySearchParams) => {
      const allPlaces: NearbyPlace[] = [];
      
      // Split types into batches of 5 (Google API limit per call)
      const typeBatches: string[][] = [];
      for (let i = 0; i < params.includedTypes.length; i += 5) {
        typeBatches.push(params.includedTypes.slice(i, i + 5));
      }

      for (const batch of typeBatches) {
        const { data, error } = await supabase.functions.invoke('google-places-nearby', {
          body: {
            lat: params.lat,
            lng: params.lng,
            radius: params.radius,
            includedTypes: batch,
            maxResultCount: 20,
          },
        });

        if (error) {
          console.error('Nearby search error:', error);
          continue;
        }

        if (data?.places) {
          allPlaces.push(...data.places);
        }
      }

      // De-duplicate by place_id
      const uniquePlaces = Array.from(
        new Map(allPlaces.map(p => [p.place_id, p])).values()
      );

      return uniquePlaces;
    },
    onSuccess: (places) => {
      const existingIds = new Set(existingPlaces.map(p => p.google_place_id));
      
      const candidatesWithStatus: SeedCandidate[] = places.map(place => ({
        ...place,
        isDuplicate: existingIds.has(place.place_id),
        selected: !existingIds.has(place.place_id), // Auto-select non-duplicates
      }));

      // Sort: non-duplicates first, then by rating
      candidatesWithStatus.sort((a, b) => {
        if (a.isDuplicate !== b.isDuplicate) return a.isDuplicate ? 1 : -1;
        return (b.rating || 0) - (a.rating || 0);
      });

      setCandidates(candidatesWithStatus);
      setStep('review');
    },
    onError: (error) => {
      console.error('Search failed:', error);
      toast.error('Failed to search nearby places');
      setStep('configure');
    },
  });

  // Import selected candidates
  const importPlaces = useMutation({
    mutationFn: async (selectedCandidates: SeedCandidate[]) => {
      const results: { success: number; failed: number } = { success: 0, failed: 0 };
      setImportProgress({ current: 0, total: selectedCandidates.length });

      for (let i = 0; i < selectedCandidates.length; i++) {
        const candidate = selectedCandidates[i];
        setImportProgress({ current: i + 1, total: selectedCandidates.length });

        try {
          // Fetch full details from Google Places
          const { data: detailsData, error: detailsError } = await supabase.functions.invoke(
            'google-places-details',
            { body: { place_id: candidate.place_id } }
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
      
      toast.success(`Imported ${results.success} places${results.failed > 0 ? ` (${results.failed} failed)` : ''}`);
      setStep('complete');
    },
    onError: (error) => {
      console.error('Import failed:', error);
      toast.error('Failed to import places');
    },
  });

  const startDiscovery = useCallback((lat: number, lng: number) => {
    if (selectedTypes.length === 0) {
      toast.error('Please select at least one category');
      return;
    }
    
    setStep('discovering');
    searchNearby.mutate({ lat, lng, radius, includedTypes: selectedTypes });
  }, [selectedTypes, radius, searchNearby]);

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
  }, []);

  const selectedCount = candidates.filter(c => c.selected && !c.isDuplicate).length;
  const newCandidateCount = candidates.filter(c => !c.isDuplicate).length;

  return {
    // State
    step,
    selectedTypes,
    radius,
    candidates,
    importProgress,
    selectedCount,
    newCandidateCount,
    isSearching: searchNearby.isPending,
    isImporting: importPlaces.isPending,
    
    // Actions
    setSelectedTypes,
    setRadius,
    startDiscovery,
    startImport,
    toggleCandidate,
    selectAll,
    reset,
    setStep,
  };
}
