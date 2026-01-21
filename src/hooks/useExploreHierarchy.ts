import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ExploreCity {
  id: string;
  name: string;
  state: string;
  place_count: number;
  lat?: number;
  lng?: number;
}

export interface ExploreMetro {
  id: string;
  name: string;
  cities: ExploreCity[];
  total_places: number;
}

export interface ExploreState {
  state: string;
  state_abbr: string;
  metros: ExploreMetro[];
  standalone_cities: ExploreCity[];
  total_places: number;
}

// US State abbreviation to full name mapping
const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia',
};

/**
 * Fetches approved places grouped by city/state, then organizes into
 * State → Metro → City hierarchy using database relationships.
 * 
 * This hook queries:
 * 1. cities table (with metro_id) for the city→metro relationships
 * 2. places table for place counts per city
 * 3. geo_areas table for metro names
 */
export const useExploreHierarchy = () => {
  return useQuery({
    queryKey: ['explore', 'hierarchy-with-metros'],
    queryFn: async () => {
      // Fetch cities with their metro assignments and metro names
      const { data: citiesWithMetros, error: citiesError } = await supabase
        .from('cities')
        .select(`
          id,
          name,
          state,
          lat,
          lng,
          status,
          metro_id,
          metro:geo_areas!metro_id (
            id,
            name
          )
        `)
        .eq('status', 'launched');

      if (citiesError) throw citiesError;

      // Fetch all approved places grouped by city
      const { data: placeCounts, error: placeError } = await supabase
        .from('places')
        .select('city, state, lat, lng')
        .eq('status', 'approved')
        .not('city', 'is', null)
        .not('state', 'is', null);

      if (placeError) throw placeError;
      if (!placeCounts || placeCounts.length === 0) return [];

      // Aggregate place counts by city
      const cityPlaceMap = new Map<string, { 
        city: string; 
        state: string; 
        count: number;
        lat: number;
        lng: number;
      }>();

      placeCounts.forEach(place => {
        const key = `${place.city?.toLowerCase()}_${place.state?.toLowerCase()}`;
        const existing = cityPlaceMap.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          cityPlaceMap.set(key, {
            city: place.city!,
            state: place.state!,
            count: 1,
            lat: place.lat || 0,
            lng: place.lng || 0,
          });
        }
      });

      // Build city-to-metro mapping from database
      const cityMetroMap = new Map<string, { metroId: string; metroName: string }>();
      citiesWithMetros?.forEach(city => {
        if (city.metro_id && city.metro) {
          const key = `${city.name.toLowerCase()}_${city.state?.toLowerCase() || ''}`;
          cityMetroMap.set(key, {
            metroId: city.metro_id,
            metroName: (city.metro as { id: string; name: string }).name,
          });
        }
      });

      // Build State → Metro → City hierarchy
      const stateMap = new Map<string, {
        metros: Map<string, ExploreMetro>;
        standalone: ExploreCity[];
        total: number;
      }>();

      cityPlaceMap.forEach((cityData, key) => {
        const stateAbbr = cityData.state.toUpperCase();
        
        if (!stateMap.has(stateAbbr)) {
          stateMap.set(stateAbbr, {
            metros: new Map(),
            standalone: [],
            total: 0,
          });
        }
        const stateEntry = stateMap.get(stateAbbr)!;
        stateEntry.total += cityData.count;

        // Check if city belongs to a metro (from database)
        const metroInfo = cityMetroMap.get(key);

        const exploreCity: ExploreCity = {
          id: key,
          name: cityData.city,
          state: stateAbbr,
          place_count: cityData.count,
          lat: cityData.lat,
          lng: cityData.lng,
        };

        if (metroInfo) {
          // Add to metro
          if (!stateEntry.metros.has(metroInfo.metroId)) {
            stateEntry.metros.set(metroInfo.metroId, {
              id: metroInfo.metroId,
              name: metroInfo.metroName,
              cities: [],
              total_places: 0,
            });
          }
          const metro = stateEntry.metros.get(metroInfo.metroId)!;
          metro.cities.push(exploreCity);
          metro.total_places += cityData.count;
        } else {
          // Standalone city
          stateEntry.standalone.push(exploreCity);
        }
      });

      // Convert to array and sort
      const hierarchy: ExploreState[] = [];
      
      stateMap.forEach((stateData, stateAbbr) => {
        // Sort metros by total places descending
        const metros = Array.from(stateData.metros.values());
        metros.forEach(metro => {
          // Sort cities within metro by place count descending
          metro.cities.sort((a, b) => b.place_count - a.place_count);
        });
        metros.sort((a, b) => b.total_places - a.total_places);

        // Sort standalone cities by place count descending
        stateData.standalone.sort((a, b) => b.place_count - a.place_count);

        hierarchy.push({
          state: STATE_NAMES[stateAbbr] || stateAbbr,
          state_abbr: stateAbbr,
          metros,
          standalone_cities: stateData.standalone,
          total_places: stateData.total,
        });
      });

      // Sort states by total places descending
      hierarchy.sort((a, b) => b.total_places - a.total_places);
      
      return hierarchy;
    },
    staleTime: 5 * 60 * 1000,
  });
};
