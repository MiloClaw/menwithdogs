import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Building2, MapPin, X, RefreshCw, Globe, AlertTriangle, ExternalLink } from 'lucide-react';
import { useMetroManagement } from '@/hooks/useMetroManagement';
import { supabase } from '@/integrations/supabase/client';
import type { MetroWithDetails } from '@/hooks/useMetroManagement';

interface CityForMetro {
  id: string;
  name: string;
  state: string | null;
  status: string;
  metro_id: string | null;
}

export default function MetroManagement() {
  const {
    metros,
    isLoading,
    refetch,
    createMetro,
    addCounty,
    removeCounty,
  } = useMetroManagement();

  const [selectedMetro, setSelectedMetro] = useState<MetroWithDetails | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newMetroName, setNewMetroName] = useState('');
  const [newCountyName, setNewCountyName] = useState('');
  const [newCountyState, setNewCountyState] = useState('');

  // Fetch cities with their metro assignments
  const { data: allCities = [] } = useQuery({
    queryKey: ['cities-for-metro-management'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, state, status, metro_id')
        .eq('status', 'launched')
        .order('name');
      if (error) throw error;
      return data as CityForMetro[];
    }
  });

  // Cities assigned to selected metro
  const assignedCities = useMemo(() => {
    if (!selectedMetro) return [];
    return allCities.filter(c => c.metro_id === selectedMetro.id);
  }, [allCities, selectedMetro]);

  // Unassigned launched cities (standalone)
  const unassignedCities = useMemo(() => {
    return allCities.filter(c => !c.metro_id);
  }, [allCities]);

  const handleCreateMetro = () => {
    if (!newMetroName.trim()) return;
    createMetro.mutate({ name: newMetroName.trim() }, {
      onSuccess: () => {
        setNewMetroName('');
        setCreateOpen(false);
      },
    });
  };

  const handleAddCounty = () => {
    if (!selectedMetro || !newCountyName.trim() || !newCountyState.trim()) return;
    addCounty.mutate({
      metroId: selectedMetro.id,
      countyName: newCountyName.trim(),
      stateCode: newCountyState.trim().toUpperCase(),
    }, {
      onSuccess: () => {
        setNewCountyName('');
        setNewCountyState('');
        refetch();
      },
    });
  };

  const handleRemoveCounty = (countyId: string) => {
    removeCounty.mutate(countyId, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  // Totals
  const totalCities = metros.reduce((sum, m) => sum + m.city_count, 0);
  const totalPlaces = metros.reduce((sum, m) => sum + m.place_count, 0);
  const activeMetros = metros.filter(m => m.is_active).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Metro Areas</h1>
            <p className="text-muted-foreground">
              Manage metropolitan area definitions and county mappings
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Metro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Metro Area</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="metro-name">Metro Name</Label>
                    <Input
                      id="metro-name"
                      value={newMetroName}
                      onChange={(e) => setNewMetroName(e.target.value)}
                      placeholder="e.g., Dallas-Fort Worth"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateMetro} disabled={!newMetroName.trim() || createMetro.isPending}>
                    {createMetro.isPending ? 'Creating...' : 'Create Metro'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{activeMetros}</div>
              <div className="text-sm text-muted-foreground">Active Metros</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{totalCities}</div>
              <div className="text-sm text-muted-foreground">Linked Cities</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{totalPlaces}</div>
              <div className="text-sm text-muted-foreground">Metro Places</div>
            </CardContent>
          </Card>
          <Card className={unassignedCities.length > 0 ? 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/10' : ''}>
            <CardContent className="pt-6">
              <div className={`text-2xl font-bold ${unassignedCities.length > 0 ? 'text-amber-600' : ''}`}>
                {unassignedCities.length}
              </div>
              <div className="text-sm text-muted-foreground">Standalone Cities</div>
            </CardContent>
          </Card>
        </div>

        {/* Split View */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Metro List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metro Areas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="divide-y">
                  {metros.map(metro => (
                    <button
                      key={metro.id}
                      className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                        selectedMetro?.id === metro.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedMetro(metro)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-primary" />
                            <span className="font-medium">{metro.name}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {metro.city_count} cities
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {metro.place_count} places
                            </span>
                          </div>
                        </div>
                        <Badge variant={metro.is_active ? 'default' : 'secondary'}>
                          {metro.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {metro.counties.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {metro.counties.slice(0, 3).map(county => (
                            <Badge key={county.id} variant="outline" className="text-xs">
                              {county.county_name}, {county.state_code}
                            </Badge>
                          ))}
                          {metro.counties.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{metro.counties.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                  {metros.length === 0 && !isLoading && (
                    <div className="p-8 text-center text-muted-foreground">
                      No metro areas defined yet
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Metro Detail */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {selectedMetro ? selectedMetro.name : 'Select a Metro'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMetro ? (
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <div className="text-2xl font-bold">{selectedMetro.city_count}</div>
                      <div className="text-sm text-muted-foreground">Cities</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <div className="text-2xl font-bold">{selectedMetro.place_count}</div>
                      <div className="text-sm text-muted-foreground">Places</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Assigned Cities */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Assigned Cities</h4>
                    {assignedCities.length > 0 ? (
                      <div className="space-y-1">
                        {assignedCities.map(city => (
                          <Link
                            key={city.id}
                            to={`/admin/directory/cities?id=${city.id}`}
                            className="flex items-center justify-between p-2 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <span className="text-sm flex items-center gap-2">
                              <Building2 className="h-3 w-3 text-muted-foreground" />
                              {city.name}{city.state && `, ${city.state}`}
                            </span>
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No cities assigned to this metro yet.
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* County Mappings */}
                  <div className="space-y-3">
                    <h4 className="font-medium">County Mappings</h4>
                    <p className="text-sm text-muted-foreground">
                      Counties mapped to this metro enable automatic place assignment
                    </p>
                    
                    <div className="space-y-2">
                      {selectedMetro.counties.map(county => (
                        <div 
                          key={county.id}
                          className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                        >
                          <span className="text-sm">
                            {county.county_name} County, {county.state_code}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCounty(county.id)}
                            disabled={removeCounty.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {selectedMetro.counties.length === 0 && (
                        <div className="text-sm text-muted-foreground italic">
                          No counties mapped. Add counties to enable auto-assignment.
                        </div>
                      )}
                    </div>

                    {/* Add County */}
                    <div className="flex gap-2 mt-4">
                      <Input
                        placeholder="County name (e.g., Dallas)"
                        value={newCountyName}
                        onChange={(e) => setNewCountyName(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="State (e.g., TX)"
                        value={newCountyState}
                        onChange={(e) => setNewCountyState(e.target.value)}
                        className="w-20"
                        maxLength={2}
                      />
                      <Button
                        onClick={handleAddCounty}
                        disabled={!newCountyName.trim() || !newCountyState.trim() || addCounty.isPending}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Select a metro area to view details
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Unassigned Cities Section */}
        {unassignedCities.length > 0 && (
          <Card className="border-amber-500/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Standalone Cities ({unassignedCities.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                These launched cities are not assigned to any metro area
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {unassignedCities.map(city => (
                  <Link
                    key={city.id}
                    to={`/admin/directory/cities?id=${city.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md text-sm hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                  >
                    <MapPin className="h-3 w-3 text-amber-600" />
                    {city.name}{city.state && `, ${city.state}`}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
