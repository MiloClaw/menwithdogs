import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  couples: {
    total: number;
    discoverable: number;
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
  blogPosts: number;
  members: number;
}

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      const [
        couplesResult,
        discoverableCouplesResult,
        approvedPlacesResult,
        pendingPlacesResult,
        approvedEventsResult,
        pendingEventsResult,
        blogPostsResult,
        membersResult,
        citiesResult,
      ] = await Promise.all([
        supabase.from('couples').select('id', { count: 'exact', head: true }),
        supabase.from('couples').select('id', { count: 'exact', head: true }).eq('is_discoverable', true).eq('is_complete', true),
        supabase.from('places').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('places').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('member_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('city_seeding_progress').select('*'),
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

      return {
        couples: {
          total: couplesResult.count ?? 0,
          discoverable: discoverableCouplesResult.count ?? 0,
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
        blogPosts: blogPostsResult.count ?? 0,
        members: membersResult.count ?? 0,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
