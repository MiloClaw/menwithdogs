import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ExploreCity {
  id: string;
  name: string;
  state: string;
  place_count: number;
}

export interface ExploreState {
  state: string;
  state_abbr: string;
  cities: ExploreCity[];
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
 * Fetches launched cities and organizes them into a State → City hierarchy.
 */
export const useExploreHierarchy = () => {
  return useQuery({
    queryKey: ['explore', 'hierarchy'],
    queryFn: async () => {
      const { data: cities, error } = await supabase
        .from('launched_cities_summary')
        .select('id, name, state, place_count')
        .gt('place_count', 0)
        .order('name');

      if (error) throw error;
      if (!cities || cities.length === 0) return [];

      // Group by state
      const stateMap = new Map<string, ExploreCity[]>();
      cities.forEach(city => {
        const state = city.state || 'Unknown';
        if (!stateMap.has(state)) {
          stateMap.set(state, []);
        }
        stateMap.get(state)!.push({
          id: city.id!,
          name: city.name!,
          state: city.state || '',
          place_count: city.place_count || 0,
        });
      });

      // Build hierarchy
      const hierarchy: ExploreState[] = [];
      stateMap.forEach((stateCities, stateAbbr) => {
        stateCities.sort((a, b) => b.place_count - a.place_count);
        hierarchy.push({
          state: STATE_NAMES[stateAbbr] || stateAbbr,
          state_abbr: stateAbbr,
          cities: stateCities,
          total_places: stateCities.reduce((sum, c) => sum + c.place_count, 0),
        });
      });

      hierarchy.sort((a, b) => b.total_places - a.total_places);
      return hierarchy;
    },
    staleTime: 5 * 60 * 1000,
  });
};
