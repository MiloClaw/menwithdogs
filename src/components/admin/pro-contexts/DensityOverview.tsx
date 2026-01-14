import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, CheckCircle, XCircle, Users, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DensityRow {
  place_id: string;
  city_id: string;
  context_key: string;
  density_score: number;
  meets_k_threshold: boolean;
  last_updated: string;
  place?: { name: string; primary_category: string };
  city?: { name: string };
}

interface City {
  id: string;
  name: string;
}

interface ContextDefinition {
  key: string;
  domain: string;
  is_sensitive: boolean;
}

interface SignalWarmUpRow {
  context_key: string;
  unique_users: number;
  k_threshold: number;
  status: 'Met' | 'Pending';
}

/**
 * Admin view for place_context_density aggregates.
 * 
 * Shows ONLY:
 * - Aggregate density by city/context/category
 * - Whether k-threshold is met
 * - Last updated timestamp
 * 
 * Does NOT show:
 * - Individual users
 * - Raw user counts
 * - Per-user signals
 */
export function DensityOverview() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedContext, setSelectedContext] = useState<string>('all');

  // Fetch cities
  const { data: cities = [] } = useQuery({
    queryKey: ['admin-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name')
        .eq('status', 'launched')
        .order('name');

      if (error) throw error;
      return data as City[];
    },
  });

  // Fetch context definitions
  const { data: contexts = [] } = useQuery({
    queryKey: ['admin-context-definitions-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pro_context_definitions')
        .select('key, domain, is_sensitive')
        .order('domain')
        .order('key');

      if (error) throw error;
      return data as ContextDefinition[];
    },
  });

  // Fetch signal warm-up status (progress toward k-threshold)
  const { data: warmUpData = [], isLoading: isWarmUpLoading } = useQuery({
    queryKey: ['admin-signal-warmup'],
    queryFn: async () => {
      // Get all pro_selection signals with their context definitions
      const { data: signals, error: signalsError } = await supabase
        .from('user_signals')
        .select('signal_key, user_id')
        .eq('signal_type', 'pro_selection');

      if (signalsError) throw signalsError;

      // Get context definitions to know k-thresholds
      const { data: definitions, error: defsError } = await supabase
        .from('pro_context_definitions')
        .select('key, is_sensitive')
        .eq('is_active', true);

      if (defsError) throw defsError;

      // Build a map of context_key -> is_sensitive
      const sensitivityMap = new Map(definitions?.map(d => [d.key, d.is_sensitive]) || []);

      // Aggregate by signal_key
      const keyStats = new Map<string, Set<string>>();
      signals?.forEach(s => {
        if (!keyStats.has(s.signal_key)) {
          keyStats.set(s.signal_key, new Set());
        }
        keyStats.get(s.signal_key)!.add(s.user_id);
      });

      // Convert to array with k-threshold info
      const result: SignalWarmUpRow[] = [];
      keyStats.forEach((users, key) => {
        const isSensitive = sensitivityMap.get(key) ?? false;
        const kThreshold = isSensitive ? 20 : 10;
        const uniqueUsers = users.size;
        result.push({
          context_key: key,
          unique_users: uniqueUsers,
          k_threshold: kThreshold,
          status: uniqueUsers >= kThreshold ? 'Met' : 'Pending',
        });
      });

      // Sort by unique_users descending
      return result.sort((a, b) => b.unique_users - a.unique_users);
    },
  });

  // Calculate total unique Pro users
  const { data: totalProUsers = 0 } = useQuery({
    queryKey: ['admin-total-pro-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_signals')
        .select('user_id')
        .eq('signal_type', 'pro_selection');

      if (error) throw error;
      const uniqueUsers = new Set(data?.map(s => s.user_id) || []);
      return uniqueUsers.size;
    },
  });

  // Fetch density data (only where meets_k_threshold = true for privacy)
  const { data: densityData = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-density-overview', selectedCity, selectedContext],
    queryFn: async () => {
      let query = supabase
        .from('place_context_density')
        .select(`
          *,
          place:places(name, primary_category),
          city:cities(name)
        `)
        .eq('meets_k_threshold', true) // Only show where k-threshold is met
        .order('density_score', { ascending: false })
        .limit(100);

      if (selectedCity !== 'all') {
        query = query.eq('city_id', selectedCity);
      }
      if (selectedContext !== 'all') {
        query = query.eq('context_key', selectedContext);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DensityRow[];
    },
  });

  // Rebuild mutation
  const rebuildMutation = useMutation({
    mutationFn: async (cityId: string | null) => {
      const { error } = await supabase.rpc('rebuild_place_context_density', {
        _city_id: cityId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Density rebuilt successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-density-overview'] });
    },
    onError: (error) => {
      toast({ title: 'Error rebuilding density', description: String(error), variant: 'destructive' });
    },
  });

  // Summary stats
  const totalWithDensity = densityData.length;
  const avgDensity = densityData.length > 0
    ? (densityData.reduce((sum, d) => sum + d.density_score, 0) / densityData.length).toFixed(3)
    : '0';

  // Group by category for summary
  const byCategory = densityData.reduce((acc, d) => {
    const cat = d.place?.primary_category || 'Unknown';
    if (!acc[cat]) acc[cat] = 0;
    acc[cat]++;
    return acc;
  }, {} as Record<string, number>);

  // Get keys that have met threshold
  const metThreshold = warmUpData.filter(w => w.status === 'Met').length;
  const topWarmUp = warmUpData.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Signal Warm-Up Status Panel */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Signal Warm-Up Status</CardTitle>
          </div>
          <CardDescription>
            Progress toward k-anonymity thresholds. Density becomes active when thresholds are met.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary row */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Unique Pro users:</span>
              <span className="font-medium">{totalProUsers}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Contexts at threshold:</span>
              <span className="font-medium">{metThreshold} / {warmUpData.length}</span>
            </div>
          </div>

          {/* Top context keys progress */}
          {isWarmUpLoading ? (
            <div className="text-muted-foreground text-sm">Loading warm-up data...</div>
          ) : topWarmUp.length === 0 ? (
            <div className="text-muted-foreground text-sm">
              No pro_selection signals yet. Density will build as Pro users configure settings.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Top Context Keys (by adoption)
              </div>
              <div className="grid gap-2">
                {topWarmUp.map((row) => (
                  <div
                    key={row.context_key}
                    className="flex items-center justify-between p-2 rounded border bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {row.context_key}
                      </code>
                      {row.status === 'Met' && (
                        <Badge variant="default" className="text-xs">Met</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={row.status === 'Met' ? 'text-primary font-medium' : 'text-muted-foreground'}>
                        {row.unique_users} / {row.k_threshold}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium">City</label>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Context</label>
          <Select value={selectedContext} onValueChange={setSelectedContext}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Contexts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contexts</SelectItem>
              {contexts.map((ctx) => (
                <SelectItem key={ctx.key} value={ctx.key}>
                  {ctx.key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          onClick={() => rebuildMutation.mutate(selectedCity === 'all' ? null : selectedCity)}
          disabled={rebuildMutation.isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${rebuildMutation.isPending ? 'animate-spin' : ''}`} />
          {rebuildMutation.isPending ? 'Rebuilding...' : 'Rebuild Density'}
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Places with Density
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWithDensity}</div>
            <p className="text-xs text-muted-foreground">Meeting k-threshold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Density Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDensity}</div>
            <p className="text-xs text-muted-foreground">0-1 scale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories Covered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(byCategory).length}</div>
            <p className="text-xs text-muted-foreground">With valid density</p>
          </CardContent>
        </Card>
      </div>

      {/* Category breakdown */}
      {Object.keys(byCategory).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Density by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(byCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <Badge key={cat} variant="secondary">
                    {cat}: {count}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Density table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Density Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground text-center py-4">Loading...</div>
          ) : densityData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No density data meeting k-threshold yet.</p>
              <p className="text-xs text-muted-foreground mt-2">
                Density builds as Pro users select contexts and engage with places.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {densityData.map((row, i) => (
                <div
                  key={`${row.place_id}-${row.context_key}-${i}`}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{row.place?.name || 'Unknown'}</span>
                      <Badge variant="outline" className="text-xs">
                        {row.context_key}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {row.city?.name} · {row.place?.primary_category}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">{row.density_score.toFixed(3)}</div>
                      <div className="text-xs text-muted-foreground">density</div>
                    </div>
                    {row.meets_k_threshold ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DensityOverview;
