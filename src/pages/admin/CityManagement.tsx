import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Trash2, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { CityCard } from '@/components/admin/cities/CityCard';
import { CityListPane } from '@/components/admin/cities/CityListPane';
import { CityDetailPane, type CityDetailMode } from '@/components/admin/cities/CityDetailPane';
import { CitySuggestionCard } from '@/components/admin/cities/CitySuggestionCard';
import { useCities, useCity, useDeleteCity, useCreateCity, type CityWithProgress, type CityInsert } from '@/hooks/useCities';
import { useCitySuggestions, useUpdateCitySuggestion, type CitySuggestion } from '@/hooks/useCitySuggestions';
import type { Database } from '@/integrations/supabase/types';

type CityStatus = Database['public']['Enums']['city_status'];

export default function CityManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CityStatus | 'all'>('all');
  const [selectedCityId, setSelectedCityId] = useState<string | null>(
    searchParams.get('id')
  );
  const [detailMode, setDetailMode] = useState<CityDetailMode>('empty');

  const [suggestionsOpen, setSuggestionsOpen] = useState(true);

  const { data: cities = [], isLoading } = useCities();
  const { data: selectedCity } = useCity(selectedCityId);
  const { data: pendingSuggestions = [] } = useCitySuggestions('pending');
  const deleteCity = useDeleteCity();
  const createCity = useCreateCity();
  const updateSuggestion = useUpdateCitySuggestion();

  // Sync URL with selected city
  useEffect(() => {
    if (selectedCityId) {
      setSearchParams({ id: selectedCityId });
    } else {
      setSearchParams({});
    }
  }, [selectedCityId, setSearchParams]);

  // Filter and search cities
  const filteredCities = useMemo(() => {
    let result = cities;
    
    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter);
    }
    
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(lower) ||
        (c.state?.toLowerCase().includes(lower))
      );
    }
    
    return result;
  }, [cities, statusFilter, searchTerm]);

  // Status counts
  const statusCounts = useMemo(() => ({
    all: cities.length,
    draft: cities.filter(c => c.status === 'draft').length,
    launched: cities.filter(c => c.status === 'launched').length,
    paused: cities.filter(c => c.status === 'paused').length,
  }), [cities]);

  // Ready to launch count
  const readyToLaunchCount = useMemo(() => 
    cities.filter(c => c.status === 'draft' && c.is_ready_to_launch).length,
  [cities]);

  const handleSelectCity = useCallback((city: CityWithProgress) => {
    setSelectedCityId(city.id);
    setDetailMode('viewing');
  }, []);

  const handleModeChange = useCallback((mode: CityDetailMode) => {
    setDetailMode(mode);
    if (mode === 'empty' || mode === 'creating') {
      setSelectedCityId(null);
    }
  }, []);

  const handleDelete = useCallback(() => {
    if (selectedCityId) {
      deleteCity.mutate(selectedCityId, {
        onSuccess: () => {
          setSelectedCityId(null);
          setDetailMode('empty');
        },
      });
    }
  }, [selectedCityId, deleteCity]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (detailMode === 'editing') {
          setDetailMode('viewing');
        } else if (detailMode === 'creating') {
          setDetailMode('empty');
        } else if (selectedCityId) {
          setSelectedCityId(null);
          setDetailMode('empty');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [detailMode, selectedCityId]);

  // Handle approving a city suggestion (creates the city)
  const handleApproveSuggestion = useCallback(async (suggestion: CitySuggestion) => {
    const cityData: CityInsert = {
      name: suggestion.name,
      state: suggestion.state,
      country: suggestion.country,
      google_place_id: suggestion.google_place_id,
      lat: suggestion.lat,
      lng: suggestion.lng,
    };

    createCity.mutate(cityData, {
      onSuccess: () => {
        updateSuggestion.mutate({ id: suggestion.id, status: 'approved' });
      },
    });
  }, [createCity, updateSuggestion]);

  // Handle rejecting a city suggestion
  const handleRejectSuggestion = useCallback((id: string) => {
    updateSuggestion.mutate({ id, status: 'rejected' });
  }, [updateSuggestion]);

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-border bg-background px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Cities</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <h1 className="text-2xl font-bold mt-1">City Management</h1>
            </div>
            <div className="flex items-center gap-2">
              {selectedCityId && detailMode === 'viewing' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {selectedCity?.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the city
                        configuration. Places in this city will remain but will no longer
                        be associated with this city entity.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button onClick={() => handleModeChange('creating')}>
                <Plus className="h-4 w-4 mr-2" />
                Add City
              </Button>
            </div>
          </div>

          {/* City Suggestions Section */}
          {pendingSuggestions.length > 0 && (
            <Collapsible open={suggestionsOpen} onOpenChange={setSuggestionsOpen} className="mb-4">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between px-0 hover:bg-transparent">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">
                      {pendingSuggestions.length} City {pendingSuggestions.length === 1 ? 'Suggestion' : 'Suggestions'}
                    </span>
                  </div>
                  {suggestionsOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {pendingSuggestions.map((suggestion) => (
                  <CitySuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onApprove={handleApproveSuggestion}
                    onReject={handleRejectSuggestion}
                    isProcessing={createCity.isPending || updateSuggestion.isPending}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Dashboard Cards */}
          {cities.length > 0 && (
            <div className="mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {cities.slice(0, 6).map((city) => (
                  <CityCard
                    key={city.id}
                    city={city}
                    isSelected={selectedCityId === city.id}
                    onClick={() => handleSelectCity(city)}
                  />
                ))}
              </div>
              {cities.length > 6 && (
                <p className="text-sm text-muted-foreground mt-2">
                  +{cities.length - 6} more cities in list below
                </p>
              )}
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-4">
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as CityStatus | 'all')}>
              <TabsList>
                <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
                <TabsTrigger value="draft">Draft ({statusCounts.draft})</TabsTrigger>
                <TabsTrigger value="launched">Launched ({statusCounts.launched})</TabsTrigger>
                <TabsTrigger value="paused">Paused ({statusCounts.paused})</TabsTrigger>
              </TabsList>
            </Tabs>
            {readyToLaunchCount > 0 && (
              <span className="text-sm text-amber-600 font-medium">
                ✨ {readyToLaunchCount} ready to launch
              </span>
            )}
            <div className="flex-1" />
            <Input
              placeholder="Search cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </div>

        {/* Split Pane */}
        <div className="flex-1 min-h-0">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={40} minSize={30}>
              <CityListPane
                cities={filteredCities}
                selectedId={selectedCityId}
                onSelect={handleSelectCity}
                isLoading={isLoading}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={60} minSize={40}>
              <CityDetailPane
                mode={detailMode}
                city={selectedCity || null}
                onModeChange={handleModeChange}
                onCreateSuccess={() => setDetailMode('empty')}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </AdminLayout>
  );
}
