import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Users, Signal, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface IntelligenceMetrics {
  proUsersCount: number;
  signalDensity: number; // avg signals per pro user
  warmUpProgress: { atThreshold: number; total: number };
  affinityCoverage: number; // % of active users with affinity
}

export default function IntelligenceStatusCard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['admin-intelligence-status'],
    queryFn: async (): Promise<IntelligenceMetrics> => {
      // Get Pro users (users with pro_selection signals)
      const { data: proSignals } = await supabase
        .from('user_signals')
        .select('user_id')
        .eq('signal_type', 'pro_selection')
        .eq('signal_value', 'true');
      
      const uniqueProUsers = new Set(proSignals?.map(s => s.user_id) || []);
      const proUsersCount = uniqueProUsers.size;
      
      // Get total pro_selection signals for density calculation
      const { count: totalProSignals } = await supabase
        .from('user_signals')
        .select('*', { count: 'exact', head: true })
        .eq('signal_type', 'pro_selection')
        .eq('signal_value', 'true');
      
      const signalDensity = proUsersCount > 0 
        ? (totalProSignals || 0) / proUsersCount 
        : 0;
      
      // Get warm-up progress from pro_context_definitions
      const { data: contextDefs } = await supabase
        .from('pro_context_definitions')
        .select('key, is_sensitive')
        .eq('is_active', true)
        .eq('influence_mode', 'boost');
      
      // Check density thresholds
      const { data: densityData } = await supabase
        .from('place_context_density')
        .select('context_key, meets_k_threshold')
        .eq('meets_k_threshold', true);
      
      const contextsAtThreshold = new Set(densityData?.map(d => d.context_key) || []);
      const warmUpProgress = {
        atThreshold: contextsAtThreshold.size,
        total: contextDefs?.length || 0
      };
      
      // Get affinity coverage
      const { count: usersWithAffinity } = await supabase
        .from('user_place_affinity')
        .select('user_id', { count: 'exact', head: true });
      
      const { count: activeUsers } = await supabase
        .from('couples')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      
      const affinityCoverage = activeUsers && activeUsers > 0
        ? ((usersWithAffinity || 0) / activeUsers) * 100
        : 0;
      
      return {
        proUsersCount,
        signalDensity: Math.round(signalDensity * 10) / 10,
        warmUpProgress,
        affinityCoverage: Math.min(100, Math.round(affinityCoverage))
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const getWarmUpState = (atThreshold: number, total: number): string => {
    if (total === 0) return 'No contexts defined';
    const pct = (atThreshold / total) * 100;
    if (pct === 0) return 'Pre-threshold';
    if (pct < 50) return 'Warming up';
    if (pct < 100) return 'Threshold met';
    return 'Active';
  };

  const getWarmUpColor = (atThreshold: number, total: number): string => {
    if (total === 0) return 'text-muted-foreground';
    const pct = (atThreshold / total) * 100;
    if (pct === 0) return 'text-amber-500';
    if (pct < 50) return 'text-amber-500';
    if (pct < 100) return 'text-emerald-500';
    return 'text-emerald-500';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          Intelligence Status
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/pro-contexts">Details →</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-2 gap-4">
            {/* Pro Users */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                Pro Users
              </div>
              <p className="text-xl font-semibold">{metrics.proUsersCount}</p>
            </div>
            
            {/* Signal Density */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Signal className="h-3 w-3" />
                Avg Signals/User
              </div>
              <p className="text-xl font-semibold">{metrics.signalDensity}</p>
            </div>
            
            {/* Warm-Up Progress */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Activity className="h-3 w-3" />
                Warm-Up State
              </div>
              <p className={`text-sm font-medium ${getWarmUpColor(metrics.warmUpProgress.atThreshold, metrics.warmUpProgress.total)}`}>
                {getWarmUpState(metrics.warmUpProgress.atThreshold, metrics.warmUpProgress.total)}
              </p>
              <p className="text-xs text-muted-foreground">
                {metrics.warmUpProgress.atThreshold}/{metrics.warmUpProgress.total} contexts at k
              </p>
            </div>
            
            {/* Affinity Coverage */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Brain className="h-3 w-3" />
                Affinity Coverage
              </div>
              <p className="text-xl font-semibold">{metrics.affinityCoverage}%</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No data available</p>
        )}
      </CardContent>
    </Card>
  );
}
