import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPinOff, Calendar, MapPin, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import PageLayout from '@/components/PageLayout';
import DirectoryPlaceCard, { DirectoryPlace } from '@/components/directory/DirectoryPlaceCard';
import DirectoryEventCard from '@/components/directory/DirectoryEventCard';
import PlaceDetailModal from '@/components/directory/PlaceDetailModal';
import EventDetailModal from '@/components/directory/EventDetailModal';
import { usePublicPlaces } from '@/hooks/usePublicPlaces';
import { useEventsPublic, DateFilter, PublicEvent } from '@/hooks/useEventsPublic';
import { useUserLocation } from '@/hooks/useUserLocation';
import { calculateDistanceMiles } from '@/lib/distance';

const RADIUS_OPTIONS = [
  { label: 'All', value: null },
  { label: '10 mi', value: 10 },
  { label: '25 mi', value: 25 },
  { label: '50 mi', value: 50 },
];

const DATE_FILTER_OPTIONS: { label: string; value: DateFilter }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This week', value: 'this_week' },
  { label: 'This month', value: 'this_month' },
  { label: 'Upcoming', value: 'upcoming' },
];

const Places = () => {
  // User location (profile first, then browser geolocation fallback)
  const { 
    lat: userLat, 
    lng: userLng, 
    source: locationSource,
    isLoading: locationLoading, 
    requestBrowserLocation 
  } = useUserLocation();
  const hasUserLocation = userLat != null && userLng != null;
  
  // Shared state
  const [activeTab, setActiveTab] = useState<'places' | 'events'>('places');
  const [searchTerm, setSearchTerm] = useState('');
  const [radiusFilter, setRadiusFilter] = useState<number | null>(null);
  
  // Places state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<DirectoryPlace | null>(null);
  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  
  // Events state
  const [dateFilter, setDateFilter] = useState<DateFilter>('upcoming');
  const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  // Data fetching
  const { data: places, isLoading: placesLoading } = usePublicPlaces();
  const { data: events, isLoading: eventsLoading } = useEventsPublic({
    dateFilter,
    radiusFilter,
    searchTerm: activeTab === 'events' ? searchTerm : '',
  });

  // Get unique place categories
  const placeCategories = useMemo(() => {
    if (!places) return [];
    const cats = [...new Set(places.map(p => p.primary_category))].filter(Boolean);
    return cats.sort();
  }, [places]);

  // Process places with distance and filters
  const processedPlaces = useMemo(() => {
    if (!places) return [];

    const placesWithDistance = places.map(place => {
      let distance: number | undefined;
      if (hasUserLocation && place.lat != null && place.lng != null) {
        distance = calculateDistanceMiles(userLat, userLng, place.lat, place.lng);
      }
      return { ...place, distance };
    });

    let filtered = placesWithDistance.filter(place => {
      const matchesSearch = !searchTerm || 
        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.city?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || 
        place.primary_category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    if (radiusFilter !== null && hasUserLocation) {
      filtered = filtered.filter(place => 
        place.distance !== undefined && place.distance <= radiusFilter
      );
    }

    return filtered.sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      if (a.distance !== undefined) return -1;
      if (b.distance !== undefined) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [places, searchTerm, selectedCategory, radiusFilter, hasUserLocation, userLat, userLng]);

  // Process events
  const processedEvents = useMemo(() => {
    if (!events) return [];
    return events;
  }, [events]);

  const handlePlaceClick = (place: DirectoryPlace) => {
    setSelectedPlace(place);
    setPlaceModalOpen(true);
  };

  const handleEventClick = (event: PublicEvent) => {
    setSelectedEvent(event);
    setEventModalOpen(true);
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || selectedCategory || radiusFilter;

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setRadiusFilter(null);
  };

  return (
    <PageLayout>
      <div className="container py-8 md:py-12 space-y-8">
        {/* Header */}
        <header className="space-y-3 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight text-balance">
            Discover Places
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Curated spots for memorable dates in your city
          </p>
        </header>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'places' | 'events')}>
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="places" className="min-h-[44px]">
              <MapPin className="h-4 w-4 mr-2" />
              Places
            </TabsTrigger>
            <TabsTrigger value="events" className="min-h-[44px]">
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
          </TabsList>

          {/* Search */}
          <div className="relative max-w-md mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeTab === 'places' ? 'Search places...' : 'Search events...'}
              className="pl-9 pr-9"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Location Notice */}
          {!hasUserLocation && (
            <div className="flex items-center justify-between gap-4 text-sm bg-muted/50 px-4 py-3 rounded-lg mt-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPinOff className="h-4 w-4 flex-shrink-0" />
                <span>Enable location to see nearby places</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={requestBrowserLocation}
                  disabled={locationLoading}
                  className="h-auto py-1.5 px-3"
                >
                  {locationLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Use my location'
                  )}
                </Button>
                <Link 
                  to="/onboarding/my-profile" 
                  className="text-primary font-medium hover:underline whitespace-nowrap text-sm"
                >
                  Add City
                </Link>
              </div>
            </div>
          )}

          {/* Distance Filter (shared) */}
          {hasUserLocation && (
            <div className="space-y-2 mt-4">
              <p className="text-sm text-muted-foreground font-medium">Distance</p>
              <div className="flex flex-wrap gap-2">
                {RADIUS_OPTIONS.map(option => (
                  <Badge
                    key={option.label}
                    variant={radiusFilter === option.value ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/90 min-h-[44px] px-4 flex items-center"
                    onClick={() => setRadiusFilter(option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Places Tab */}
          <TabsContent value="places" className="space-y-6 mt-6">
            {/* Category Filters */}
            {placeCategories.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Category</p>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedCategory === null ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/90 min-h-[44px] px-4 flex items-center"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All
                  </Badge>
                  {placeCategories.map(category => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/90 min-h-[44px] px-4 flex items-center"
                      onClick={() => setSelectedCategory(
                        selectedCategory === category ? null : category
                      )}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Results Count & Clear Filters */}
            {!placesLoading && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {processedPlaces.length} {processedPlaces.length === 1 ? 'place' : 'places'} found
                </p>
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="text-muted-foreground hover:text-foreground h-auto py-1 px-2"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear filters
                  </Button>
                )}
              </div>
            )}

            {/* Places Grid */}
            {placesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : processedPlaces.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30" />
                <div className="space-y-2">
                  <p className="font-medium">
                    {hasActiveFilters ? 'No matches found' : 'Your area is coming soon'}
                  </p>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    {hasActiveFilters
                      ? 'Try adjusting your filters to see more results'
                      : "We're curating the best spots for couples. Add your city to be notified."}
                  </p>
                </div>
                {hasActiveFilters ? (
                  <Button variant="outline" size="sm" onClick={clearAllFilters}>
                    Clear all filters
                  </Button>
                ) : !hasUserLocation && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/onboarding/my-profile">Add Your City</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedPlaces.map(place => (
                  <DirectoryPlaceCard 
                    key={place.id} 
                    place={place} 
                    onClick={() => handlePlaceClick(place)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6 mt-6">
            {/* Date Filters */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">When</p>
              <div className="flex flex-wrap gap-2">
                {DATE_FILTER_OPTIONS.map(option => (
                  <Badge
                    key={option.value}
                    variant={dateFilter === option.value ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/90 min-h-[44px] px-4 flex items-center"
                    onClick={() => setDateFilter(option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Results Count */}
            {!eventsLoading && (
              <p className="text-sm text-muted-foreground">
                {processedEvents.length} {processedEvents.length === 1 ? 'event' : 'events'} found
              </p>
            )}

            {/* Events Grid */}
            {eventsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-40 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            ) : processedEvents.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30" />
                <div className="space-y-2">
                  <p className="font-medium">
                    {hasActiveFilters ? 'No events match' : 'Events coming soon'}
                  </p>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    {hasActiveFilters
                      ? 'Try a different time range to see more events'
                      : 'This city is just getting started. New events are added weekly.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedEvents.map(event => (
                  <DirectoryEventCard 
                    key={event.id} 
                    event={event} 
                    onClick={() => handleEventClick(event)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <PlaceDetailModal 
        place={selectedPlace}
        open={placeModalOpen}
        onOpenChange={setPlaceModalOpen}
      />
      <EventDetailModal 
        event={selectedEvent}
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
      />
    </PageLayout>
  );
};

export default Places;