import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
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
        .select('key, domain')
        .order('domain')
        .order('key');

      if (error) throw error;
      return data as ContextDefinition[];
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

  return (
    <div className="space-y-6">
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
