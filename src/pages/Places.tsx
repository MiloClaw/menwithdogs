import { useState, useMemo } from 'react';
import { Search, MapPinOff, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import PageLayout from '@/components/PageLayout';
import DirectoryPlaceCard, { DirectoryPlace } from '@/components/directory/DirectoryPlaceCard';
import DirectoryEventCard from '@/components/directory/DirectoryEventCard';
import PlaceDetailModal from '@/components/directory/PlaceDetailModal';
import EventDetailModal from '@/components/directory/EventDetailModal';
import { usePublicPlaces } from '@/hooks/usePublicPlaces';
import { useEventsPublic, DateFilter, PublicEvent } from '@/hooks/useEventsPublic';
import { useCoupleContext } from '@/contexts/CoupleContext';
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
  const { memberProfile } = useCoupleContext();
  
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

  // User location
  const userLat = memberProfile?.city_lat;
  const userLng = memberProfile?.city_lng;
  const hasUserLocation = userLat != null && userLng != null;

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

  return (
    <PageLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Discover Places</h1>
          <p className="text-muted-foreground">
            Find great spots and events for your next date
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'places' | 'events')}>
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="places" className="min-h-[44px]">Places</TabsTrigger>
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
              className="pl-9"
            />
          </div>

          {/* Location Notice */}
          {!hasUserLocation && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-3 rounded-lg mt-4">
              <MapPinOff className="h-4 w-4 flex-shrink-0" />
              <span>Add your city in your profile to see distance and filter by radius</span>
            </div>
          )}

          {/* Distance Filter (shared) */}
          {hasUserLocation && (
            <div className="space-y-2 mt-4">
              <p className="text-sm text-muted-foreground">Distance</p>
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
                <p className="text-sm text-muted-foreground">Category</p>
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

            {/* Results Count */}
            {!placesLoading && (
              <p className="text-sm text-muted-foreground">
                {processedPlaces.length} {processedPlaces.length === 1 ? 'place' : 'places'} found
              </p>
            )}

            {/* Places Grid */}
            {placesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : processedPlaces.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  {hasActiveFilters
                    ? 'Nothing here yet — try adjusting your filters'
                    : "We're curating spots for your area. Check back soon."}
                </p>
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
              <p className="text-sm text-muted-foreground">When</p>
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
              <div className="text-center py-16">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">
                  {hasActiveFilters
                    ? 'No events match right now — more are added weekly'
                    : 'This city is just getting started. New events coming soon.'}
                </p>
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
