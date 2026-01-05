import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserAffinity {
  id: string;
  user_id: string;
  place_category: string;
  affinity_score: number;
  confidence: number | null;
  supporting_signals_count: number | null;
  last_updated: string | null;
}

export function useUserAffinity() {
  const { user } = useAuth();

  const { data: affinities, isLoading, refetch } = useQuery({
    queryKey: ['user-affinity', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Recompute affinities before fetching (lightweight server-side)
      await supabase.rpc('compute_user_affinity', { _user_id: user.id });

      const { data, error } = await supabase
        .from('user_place_affinity')
        .select('*')
        .eq('user_id', user.id)
        .order('affinity_score', { ascending: false });

      if (error) throw error;
      return (data as UserAffinity[]) || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  const totalSignals = affinities?.reduce(
    (sum, a) => sum + (a.supporting_signals_count || 0),
    0
  ) || 0;

  return { 
    affinities: affinities || [], 
    isLoading, 
    refetch,
    totalSignals,
    hasData: (affinities?.length || 0) > 0,
  };
}
