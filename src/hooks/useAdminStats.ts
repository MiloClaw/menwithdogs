import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CityStats {
  city: string;
  state: string | null;
  pendingCount: number;
  approvedCount: number;
  userSubmittedCount: number;
  totalCount: number;
  inLaunchedCity: boolean;
  geoAreaId?: string;
  metroId?: string;
  metroName?: string;
}

export interface MetroStats {
  metroId: string;
  metroName: string;
  cities: CityStats[];
  pendingCount: number;
  approvedCount: number;
  userSubmittedCount: number;
  totalCount: number;
  hasEmergingCities: boolean;
}

interface AdminStats {
  couples: {
    total: number;
    active: number;
  };
  places: {
    approved: number;
    pending: number;
  };
  events: {
    approved: number;
    pending: number;
  };
  cities: {
    total: number;
    draft: number;
    launched: number;
    paused: number;
    readyToLaunch: number;
  };
  posts: number;
  members: number;
  placesByCity: CityStats[];
  placesByMetro: MetroStats[];
  emergingCitiesCount: number;
}

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      const [
        couplesResult,
        activeCouplesResult,
        approvedPlacesResult,
        pendingPlacesResult,
        approvedEventsResult,
        pendingEventsResult,
        postsResult,
        membersResult,
        citiesResult,
        placesByCityResult,
        geoAreasResult,
      ] = await Promise.all([
        supabase.from('couples').select('id', { count: 'exact', head: true }),
        supabase.from('couples').select('id', { count: 'exact', head: true }).eq('is_complete', true),
        supabase.from('places').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('places').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('member_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('city_seeding_progress').select('*'),
        // Get all places with city info
        supabase.from('places').select('city, state, status, source'),
        // Get geo_areas with parent relationships for metro rollup
        supabase.from('geo_areas').select('id, name, type, parent_id').eq('is_active', true),
      ]);

      // Calculate city stats from the view data
      const cities = citiesResult.data || [];
      const cityStats = {
        total: cities.length,
        draft: cities.filter(c => c.status === 'draft').length,
        launched: cities.filter(c => c.status === 'launched').length,
        paused: cities.filter(c => c.status === 'paused').length,
        readyToLaunch: cities.filter(c => c.status === 'draft' && c.is_ready_to_launch).length,
      };

      // Build launched cities lookup (lowercase for comparison)
      const launchedCities = new Set(
        cities
          .filter(c => c.status === 'launched')
          .map(c => `${c.name?.toLowerCase()}|${c.state?.toLowerCase() || ''}`)
      );

      // Build geo_areas lookup
      const geoAreas = geoAreasResult.data || [];
      const localityToMetro = new Map<string, { metroId: string; metroName: string }>();
      const metrosById = new Map<string, string>();
      
      // First pass: identify metros
      for (const area of geoAreas) {
        if (area.type === 'metro') {
          metrosById.set(area.id, area.name);
        }
      }
      
      // Second pass: map localities to their parent metros
      for (const area of geoAreas) {
        if (area.type === 'locality' && area.parent_id && metrosById.has(area.parent_id)) {
          localityToMetro.set(area.name.toLowerCase(), {
            metroId: area.parent_id,
            metroName: metrosById.get(area.parent_id)!,
          });
        }
      }

      // Aggregate places by city
      const placesData = placesByCityResult.data || [];
      const cityAggregates = new Map<string, CityStats>();

      for (const place of placesData) {
        if (!place.city) continue;
        
        const key = `${place.city}|${place.state || ''}`;
        const existing = cityAggregates.get(key);
        
        const cityLookupKey = `${place.city.toLowerCase()}|${place.state?.toLowerCase() || ''}`;
        const inLaunchedCity = launchedCities.has(cityLookupKey);
        
        // Look up metro from geo_areas
        const metroInfo = localityToMetro.get(place.city.toLowerCase());

        if (existing) {
          existing.totalCount++;
          if (place.status === 'pending') existing.pendingCount++;
          if (place.status === 'approved') existing.approvedCount++;
          if (place.source === 'user_submitted') existing.userSubmittedCount++;
        } else {
          cityAggregates.set(key, {
            city: place.city,
            state: place.state,
            pendingCount: place.status === 'pending' ? 1 : 0,
            approvedCount: place.status === 'approved' ? 1 : 0,
            userSubmittedCount: place.source === 'user_submitted' ? 1 : 0,
            totalCount: 1,
            inLaunchedCity,
            metroId: metroInfo?.metroId,
            metroName: metroInfo?.metroName,
          });
        }
      }

      // Convert to sorted array (user-submitted first, then pending)
      const placesByCity = Array.from(cityAggregates.values())
        .sort((a, b) => {
          // Primary: user-submitted count descending
          if (b.userSubmittedCount !== a.userSubmittedCount) {
            return b.userSubmittedCount - a.userSubmittedCount;
          }
          // Secondary: pending count descending
          return b.pendingCount - a.pendingCount;
        });

      // Aggregate by metro
      const metroAggregates = new Map<string, MetroStats>();
      
      for (const cityData of placesByCity) {
        if (cityData.metroId && cityData.metroName) {
          const existing = metroAggregates.get(cityData.metroId);
          
          if (existing) {
            existing.cities.push(cityData);
            existing.pendingCount += cityData.pendingCount;
            existing.approvedCount += cityData.approvedCount;
            existing.userSubmittedCount += cityData.userSubmittedCount;
            existing.totalCount += cityData.totalCount;
            if (!cityData.inLaunchedCity && cityData.userSubmittedCount > 0) {
              existing.hasEmergingCities = true;
            }
          } else {
            metroAggregates.set(cityData.metroId, {
              metroId: cityData.metroId,
              metroName: cityData.metroName,
              cities: [cityData],
              pendingCount: cityData.pendingCount,
              approvedCount: cityData.approvedCount,
              userSubmittedCount: cityData.userSubmittedCount,
              totalCount: cityData.totalCount,
              hasEmergingCities: !cityData.inLaunchedCity && cityData.userSubmittedCount > 0,
            });
          }
        }
      }
      
      // Sort metros by user-submitted count
      const placesByMetro = Array.from(metroAggregates.values())
        .sort((a, b) => {
          if (b.userSubmittedCount !== a.userSubmittedCount) {
            return b.userSubmittedCount - a.userSubmittedCount;
          }
          return b.pendingCount - a.pendingCount;
        });

      // Count emerging cities (have submissions but not launched)
      const emergingCitiesCount = placesByCity.filter(
        c => c.userSubmittedCount > 0 && !c.inLaunchedCity
      ).length;

      return {
        couples: {
          total: couplesResult.count ?? 0,
          active: activeCouplesResult.count ?? 0,
        },
        places: {
          approved: approvedPlacesResult.count ?? 0,
          pending: pendingPlacesResult.count ?? 0,
        },
        events: {
          approved: approvedEventsResult.count ?? 0,
          pending: pendingEventsResult.count ?? 0,
        },
        cities: cityStats,
        posts: postsResult.count ?? 0,
        members: membersResult.count ?? 0,
        placesByCity,
        placesByMetro,
        emergingCitiesCount,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
