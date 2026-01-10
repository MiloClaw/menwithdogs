import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Trash2, ChevronRight, X, MapPin, List, LayoutGrid, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toggle } from '@/components/ui/toggle';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import AdminLayout from '@/components/admin/AdminLayout';
import PlaceListPane from '@/components/admin/places/PlaceListPane';
import PlaceDetailPane, { PlaceDetailMode } from '@/components/admin/places/PlaceDetailPane';
import { usePlaces, Place } from '@/hooks/usePlaces';
import { supabase } from '@/integrations/supabase/client';

type StatusFilter = 'all' | 'approved' | 'pending' | 'rejected';
type ViewMode = 'flat' | 'city' | 'metro';

const PlaceManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('city');
  
  // Read city filter from URL
  const cityFilter = searchParams.get('city') || '';
  // Read location bias from URL (for Google Places search)
  const locationBias = useMemo(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (lat && lng) {
      return { lat: parseFloat(lat), lng: parseFloat(lng) };
    }
    return undefined;
  }, [searchParams]);
  
  const { places, isLoading, createPlace, updatePlace, deletePlace } = usePlaces();

  // Fetch geo_areas to build metro mapping
  const { data: geoAreas } = useQuery({
    queryKey: ['geo-areas-metros'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geo_areas')
        .select('id, name, type, parent_id')
        .in('type', ['metro', 'locality']);
      if (error) throw error;
      return data;
    }
  });

  // Build metro mapping: cityName (lowercase) → metroName
  const metroMapping = useMemo(() => {
    if (!geoAreas) return {};
    
    const metroMap: Record<string, string> = {};
    const metrosById: Record<string, string> = {};
    
    // First pass: collect metros by ID
    for (const area of geoAreas) {
      if (area.type === 'metro') {
        metrosById[area.id] = area.name;
      }
    }
    
    // Second pass: map localities to their parent metro
    for (const area of geoAreas) {
      if (area.type === 'locality' && area.parent_id && metrosById[area.parent_id]) {
        metroMap[area.name.toLowerCase()] = metrosById[area.parent_id];
      }
    }
    
    return metroMap;
  }, [geoAreas]);

  // Sync mode state with URL
  const [detailMode, setDetailMode] = useState<PlaceDetailMode>(() => {
    const id = searchParams.get('id');
    const action = searchParams.get('action');
    if (action === 'create') return { type: 'creating' };
    if (action === 'edit' && id) return { type: 'editing', placeId: id };
    if (id) return { type: 'viewing', placeId: id };
    return { type: 'empty' };
  });

  // Update URL when mode changes (preserve city filter)
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Preserve city filter
    if (cityFilter) {
      params.set('city', cityFilter);
    }
    
    // Preserve location bias
    if (locationBias) {
      params.set('lat', locationBias.lat.toString());
      params.set('lng', locationBias.lng.toString());
    }
    
    if (detailMode.type === 'viewing') {
      params.set('id', detailMode.placeId);
    } else if (detailMode.type === 'editing') {
      params.set('id', detailMode.placeId);
      params.set('action', 'edit');
    } else if (detailMode.type === 'creating') {
      params.set('action', 'create');
    }
    
    setSearchParams(params, { replace: true });
  }, [detailMode, cityFilter, locationBias, setSearchParams]);

  // Status counts for tabs
  const statusCounts = useMemo(() => {
    return {
      all: places.length,
      approved: places.filter(p => p.status === 'approved').length,
      pending: places.filter(p => p.status === 'pending').length,
      rejected: places.filter(p => p.status === 'rejected').length,
    };
  }, [places]);

  // Filtered places
  const filteredPlaces = useMemo(() => {
    return places.filter(place => {
      // Status filter
      if (statusFilter !== 'all' && place.status !== statusFilter) {
        return false;
      }
      // City filter from URL
      if (cityFilter && place.city?.toLowerCase() !== cityFilter.toLowerCase()) {
        return false;
      }
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          place.name.toLowerCase().includes(search) ||
          place.city?.toLowerCase().includes(search) ||
          place.primary_category.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [places, statusFilter, searchTerm, cityFilter]);

  // Handle place selection
  const handleSelectPlace = useCallback((id: string) => {
    setDetailMode({ type: 'viewing', placeId: id });
  }, []);

  // Handle city filter from grouped view
  const handleCityFilter = useCallback((city: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('city', city);
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  // Handle mode changes
  const handleModeChange = useCallback((mode: PlaceDetailMode) => {
    setDetailMode(mode);
  }, []);

  // Handle save
  const handleSave = useCallback(async (id: string, updates: Partial<Place>) => {
    await updatePlace.mutateAsync({ id, ...updates });
  }, [updatePlace]);

  // Handle create
  const handleCreate = useCallback(async (input: Parameters<typeof createPlace.mutateAsync>[0]) => {
    const newPlace = await createPlace.mutateAsync(input);
    setDetailMode({ type: 'viewing', placeId: newPlace.id });
  }, [createPlace]);

  // Handle delete confirmation
  const handleDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    await deletePlace.mutateAsync(deleteConfirm);
    setDeleteConfirm(null);
    setDetailMode({ type: 'empty' });
  }, [deleteConfirm, deletePlace]);

  // Keyboard shortcut for escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (detailMode.type === 'editing') {
          setDetailMode({ type: 'viewing', placeId: detailMode.placeId });
        } else if (detailMode.type === 'creating') {
          setDetailMode({ type: 'empty' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [detailMode]);

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col">
        {/* Header */}
        <div className="shrink-0 border-b bg-background px-4 py-3 space-y-3">
          {/* Breadcrumb + Title + Add Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link 
                to="/admin" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <h1 className="text-xl font-semibold">Places</h1>
              {cityFilter && (
                <Badge variant="secondary" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {cityFilter}
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.delete('city');
                      params.delete('lat');
                      params.delete('lng');
                      setSearchParams(params, { replace: true });
                    }}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {detailMode.type === 'viewing' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteConfirm(detailMode.placeId)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => setDetailMode({ type: 'creating' })}
                disabled={detailMode.type === 'creating'}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Place
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            {/* Status Tabs */}
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <TabsList>
                <TabsTrigger value="all">
                  All ({statusCounts.all})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({statusCounts.pending})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({statusCounts.approved})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({statusCounts.rejected})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search places..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-md">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={viewMode === 'flat'}
                    onPressedChange={() => setViewMode('flat')}
                    className="rounded-r-none data-[state=on]:bg-muted"
                    aria-label="Flat view"
                  >
                    <List className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Flat view</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={viewMode === 'city'}
                    onPressedChange={() => setViewMode('city')}
                    className="rounded-none border-l data-[state=on]:bg-muted"
                    aria-label="Group by city"
                  >
                    <Building2 className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Group by city</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={viewMode === 'metro'}
                    onPressedChange={() => setViewMode('metro')}
                    className="rounded-l-none border-l data-[state=on]:bg-muted"
                    aria-label="Group by metro"
                  >
                    <MapPin className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Group by metro</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Split Pane */}
        <div className="flex-1 min-h-0">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={40} minSize={25}>
              <PlaceListPane
                places={filteredPlaces}
                selectedPlaceId={
                  detailMode.type === 'viewing' || detailMode.type === 'editing'
                    ? detailMode.placeId
                    : null
                }
                onSelectPlace={handleSelectPlace}
                onCityFilter={handleCityFilter}
                isLoading={isLoading}
                groupBy={viewMode === 'flat' ? undefined : viewMode}
                metroMapping={metroMapping}
              />
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={60} minSize={35}>
              <PlaceDetailPane
                mode={detailMode}
                places={places}
                onModeChange={handleModeChange}
                onSave={handleSave}
                onCreate={handleCreate}
                isUpdating={updatePlace.isPending}
                isCreating={createPlace.isPending}
                locationBias={locationBias}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Place</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this place? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default PlaceManagement;
