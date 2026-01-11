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

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

export interface TrendData {
  signups: number[];
  favorites: number[];
  places: number[];
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
  // New metrics
  engagement: {
    totalFavorites: number;
    avgFavoritesPerUser: number;
  };
  trends: TrendData;
  categoryBreakdown: CategoryBreakdown[];
}

// Helper to get dates for the last N days
function getLastNDays(n: number): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      // Calculate date range for trends (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoISO = sevenDaysAgo.toISOString();

      // Phase 2 optimization: Use materialized view for core stats
      // Reduces 16 parallel queries to 5
      const [
        // Core stats from materialized view (single query replaces 10+)
        coreStatsResult,
        // Dynamic data still needs fresh queries
        citiesResult,
        placesByCityResult,
        geoAreasResult,
        // Trend data (last 7 days)
        recentMembersResult,
        recentFavoritesResult,
        recentPlacesResult,
        // Category breakdown
        allPlacesResult,
      ] = await Promise.all([
        // Use secure RPC function instead of direct materialized view query
        supabase.rpc('get_admin_dashboard_stats').single(),
        supabase.from('city_seeding_progress').select('*'),
        supabase.from('places').select('city, state, status, source'),
        supabase.from('geo_areas').select('id, name, type, parent_id').eq('is_active', true),
        // Recent signups (last 7 days)
        supabase.from('member_profiles').select('created_at').gte('created_at', sevenDaysAgoISO),
        // Recent favorites (last 7 days)
        supabase.from('couple_favorites').select('created_at').gte('created_at', sevenDaysAgoISO),
        // Recent places (last 7 days)
        supabase.from('places').select('created_at').gte('created_at', sevenDaysAgoISO),
        // All places with categories for breakdown
        supabase.from('places').select('primary_category').eq('status', 'approved'),
      ]);

      // Extract core stats from materialized view
      const coreStats = coreStatsResult.data;

      // Use materialized view data for city stats, with fallback to view
      const cities = citiesResult.data || [];
      const cityStats = coreStats ? {
        total: Number(coreStats.total_cities) || 0,
        draft: Number(coreStats.draft_cities) || 0,
        launched: Number(coreStats.launched_cities) || 0,
        paused: Number(coreStats.paused_cities) || 0,
        readyToLaunch: Number(coreStats.ready_to_launch_cities) || 0,
      } : {
        total: cities.length,
        draft: cities.filter(c => c.status === 'draft').length,
        launched: cities.filter(c => c.status === 'launched').length,
        paused: cities.filter(c => c.status === 'paused').length,
        readyToLaunch: cities.filter(c => c.status === 'draft' && c.is_ready_to_launch).length,
      };

      // Build launched cities lookup
      const launchedCities = new Set(
        cities
          .filter(c => c.status === 'launched')
          .map(c => `${c.name?.toLowerCase()}|${c.state?.toLowerCase() || ''}`)
      );

      // Build geo_areas lookup
      const geoAreas = geoAreasResult.data || [];
      const localityToMetro = new Map<string, { metroId: string; metroName: string }>();
      const metrosById = new Map<string, string>();
      
      for (const area of geoAreas) {
        if (area.type === 'metro') {
          metrosById.set(area.id, area.name);
        }
      }
      
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

      const placesByCity = Array.from(cityAggregates.values())
        .sort((a, b) => {
          if (b.userSubmittedCount !== a.userSubmittedCount) {
            return b.userSubmittedCount - a.userSubmittedCount;
          }
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
      
      const placesByMetro = Array.from(metroAggregates.values())
        .sort((a, b) => {
          if (b.userSubmittedCount !== a.userSubmittedCount) {
            return b.userSubmittedCount - a.userSubmittedCount;
          }
          return b.pendingCount - a.pendingCount;
        });

      const emergingCitiesCount = placesByCity.filter(
        c => c.userSubmittedCount > 0 && !c.inLaunchedCity
      ).length;

      // Calculate engagement metrics from materialized view
      const totalFavorites = coreStats ? Number(coreStats.total_favorites) : 0;
      const activeUsers = coreStats ? Number(coreStats.active_couples) || 1 : 1;
      const avgFavoritesPerUser = activeUsers > 0 ? totalFavorites / activeUsers : 0;

      // Calculate 7-day trends
      const last7Days = getLastNDays(7);
      
      const signupsByDay = new Map<string, number>();
      const favoritesByDay = new Map<string, number>();
      const placesByDay = new Map<string, number>();
      
      // Initialize all days to 0
      for (const day of last7Days) {
        signupsByDay.set(day, 0);
        favoritesByDay.set(day, 0);
        placesByDay.set(day, 0);
      }
      
      // Count signups per day
      for (const member of recentMembersResult.data || []) {
        const day = member.created_at.split('T')[0];
        if (signupsByDay.has(day)) {
          signupsByDay.set(day, (signupsByDay.get(day) || 0) + 1);
        }
      }
      
      // Count favorites per day
      for (const fav of recentFavoritesResult.data || []) {
        const day = fav.created_at.split('T')[0];
        if (favoritesByDay.has(day)) {
          favoritesByDay.set(day, (favoritesByDay.get(day) || 0) + 1);
        }
      }
      
      // Count places per day
      for (const place of recentPlacesResult.data || []) {
        const day = place.created_at.split('T')[0];
        if (placesByDay.has(day)) {
          placesByDay.set(day, (placesByDay.get(day) || 0) + 1);
        }
      }

      const trends: TrendData = {
        signups: last7Days.map(day => signupsByDay.get(day) || 0),
        favorites: last7Days.map(day => favoritesByDay.get(day) || 0),
        places: last7Days.map(day => placesByDay.get(day) || 0),
      };

      // Calculate category breakdown
      const categoryCountMap = new Map<string, number>();
      const approvedPlaces = allPlacesResult.data || [];
      
      for (const place of approvedPlaces) {
        if (place.primary_category) {
          categoryCountMap.set(
            place.primary_category, 
            (categoryCountMap.get(place.primary_category) || 0) + 1
          );
        }
      }

      const totalApprovedPlaces = approvedPlaces.length;
      const categoryBreakdown: CategoryBreakdown[] = Array.from(categoryCountMap.entries())
        .map(([category, count]) => ({
          category,
          count,
          percentage: totalApprovedPlaces > 0 ? (count / totalApprovedPlaces) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      return {
        couples: {
          total: coreStats ? Number(coreStats.total_couples) : 0,
          active: coreStats ? Number(coreStats.active_couples) : 0,
        },
        places: {
          approved: coreStats ? Number(coreStats.approved_places) : 0,
          pending: coreStats ? Number(coreStats.pending_places) : 0,
        },
        events: {
          approved: coreStats ? Number(coreStats.approved_events) : 0,
          pending: coreStats ? Number(coreStats.pending_events) : 0,
        },
        cities: cityStats,
        posts: coreStats ? Number(coreStats.total_posts) : 0,
        members: coreStats ? Number(coreStats.total_members) : 0,
        placesByCity,
        placesByMetro,
        emergingCitiesCount,
        engagement: {
          totalFavorites,
          avgFavoritesPerUser,
        },
        trends,
        categoryBreakdown,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
