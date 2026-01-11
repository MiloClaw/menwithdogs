import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PlacePrior {
  id: string;
  place_id: string;
  city_id: string;
  context_key: string;
  confidence: number;
  created_at: string;
  place?: { name: string; city: string };
}

interface ContextDefinition {
  key: string;
  domain: string;
  is_active: boolean;
}

interface Place {
  id: string;
  name: string;
  city: string | null;
}

interface City {
  id: string;
  name: string;
}

/**
 * Admin editor for place_context_priors.
 * 
 * Admins can:
 * - Add context priors to places (weak scaffolding)
 * - Edit confidence values
 * - Remove priors
 * 
 * Rules:
 * - Priors are capped at 0.25 confidence
 * - Priors decay fastest (90-day half-life)
 * - Priors are overridden by real density
 */
export function PlacePriorEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    place_id: '',
    city_id: '',
    context_key: '',
    confidence: 0.15,
  });

  // Fetch priors
  const { data: priors = [], isLoading } = useQuery({
    queryKey: ['admin-place-priors', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('place_context_priors')
        .select(`
          *,
          place:places(name, city)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      const { data, error } = await query;
      if (error) throw error;
      return data as PlacePrior[];
    },
  });

  // Fetch context definitions for dropdown
  const { data: contexts = [] } = useQuery({
    queryKey: ['admin-context-definitions-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pro_context_definitions')
        .select('key, domain, is_active')
        .eq('is_active', true)
        .order('domain')
        .order('key');

      if (error) throw error;
      return data as ContextDefinition[];
    },
  });

  // Search places
  const { data: searchResults = [] } = useQuery({
    queryKey: ['admin-place-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];

      const { data, error } = await supabase
        .from('places')
        .select('id, name, city')
        .ilike('name', `%${searchQuery}%`)
        .eq('status', 'approved')
        .limit(20);

      if (error) throw error;
      return data as Place[];
    },
    enabled: searchQuery.length >= 2,
  });

  // Fetch cities for the selected place
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

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('place_context_priors')
        .insert({
          place_id: data.place_id,
          city_id: data.city_id,
          context_key: data.context_key,
          confidence: Math.min(0.25, data.confidence),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Prior added' });
      queryClient.invalidateQueries({ queryKey: ['admin-place-priors'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error adding prior', description: String(error), variant: 'destructive' });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('place_context_priors')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Prior removed' });
      queryClient.invalidateQueries({ queryKey: ['admin-place-priors'] });
    },
    onError: (error) => {
      toast({ title: 'Error removing prior', description: String(error), variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      place_id: '',
      city_id: '',
      context_key: '',
      confidence: 0.15,
    });
    setSelectedPlaceId(null);
    setSearchQuery('');
  };

  const selectPlace = (place: Place) => {
    setSelectedPlaceId(place.id);
    setFormData({ ...formData, place_id: place.id });
    setSearchQuery(place.name);
    
    // Auto-select city if we can find it
    const matchedCity = cities.find(c => c.name === place.city);
    if (matchedCity) {
      setFormData(prev => ({ ...prev, city_id: matchedCity.id }));
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with guardrail */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Seed places with weak context priors for early Pro value.
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded inline-block">
              ⚠️ Place priors are temporary scaffolding. They decay quickly (90-day half-life) and should only be used when culturally obvious. Real user signals will override these.
            </p>
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Prior
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Place Context Prior</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Search Place</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for a place..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedPlaceId(null);
                    }}
                    className="pl-9"
                  />
                </div>
                {searchResults.length > 0 && !selectedPlaceId && (
                  <div className="border rounded-md max-h-40 overflow-y-auto">
                    {searchResults.map((place) => (
                      <button
                        key={place.id}
                        className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                        onClick={() => selectPlace(place)}
                      >
                        <span className="font-medium">{place.name}</span>
                        {place.city && <span className="text-muted-foreground ml-2">{place.city}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>City</Label>
                <Select 
                  value={formData.city_id} 
                  onValueChange={(v) => setFormData({ ...formData, city_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Context</Label>
                <Select 
                  value={formData.context_key} 
                  onValueChange={(v) => setFormData({ ...formData, context_key: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select context" />
                  </SelectTrigger>
                  <SelectContent>
                    {contexts.map((ctx) => (
                      <SelectItem key={ctx.key} value={ctx.key}>
                        <span className="capitalize">{ctx.domain}:</span> {ctx.key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Confidence (max 0.25)</Label>
                <Input
                  type="number"
                  min={0}
                  max={0.25}
                  step={0.05}
                  value={formData.confidence}
                  onChange={(e) => setFormData({ ...formData, confidence: parseFloat(e.target.value) })}
                />
              </div>

              <Button
                className="w-full"
                onClick={() => createMutation.mutate(formData)}
                disabled={!formData.place_id || !formData.city_id || !formData.context_key || createMutation.isPending}
              >
                Add Prior
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Priors list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Active Priors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {priors.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No priors yet. Add one to seed early Pro value.
            </p>
          ) : (
            priors.map((prior) => (
              <div
                key={prior.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{prior.place?.name || 'Unknown Place'}</span>
                    <Badge variant="outline" className="text-xs">
                      {prior.context_key}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {prior.place?.city} · Confidence: {prior.confidence}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate(prior.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PlacePriorEditor;
