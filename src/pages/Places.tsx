import { useState, useMemo, useEffect } from 'react';
import { Search, Calendar, MapPin, MapPinOff, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import PageLayout from '@/components/PageLayout';
import DirectoryPlaceCard, { DirectoryPlace } from '@/components/directory/DirectoryPlaceCard';
import DirectoryEventCard from '@/components/directory/DirectoryEventCard';
import PlaceDetailModal from '@/components/directory/PlaceDetailModal';
import EventDetailModal from '@/components/directory/EventDetailModal';
import CityPickerModal, { CityPickerMode } from '@/components/directory/CityPickerModal';
import PlaceSuggestionModal from '@/components/directory/PlaceSuggestionModal';
import { CitySuggestionModal } from '@/components/directory/CitySuggestionModal';
import PreferencePrompt from '@/components/preferences/PreferencePrompt';
import LocationContextBanner from '@/components/directory/LocationContextBanner';
import GooglePlacesAutocomplete from '@/components/ui/google-places-autocomplete';
import { usePublicPlaces } from '@/hooks/usePublicPlaces';
import { useEventsPublic, DateFilter, PublicEvent } from '@/hooks/useEventsPublic';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useEnsureRelationshipUnit } from '@/hooks/useEnsureRelationshipUnit';
import { usePreferencePrompts } from '@/hooks/usePreferencePrompts';
import { usePlaceSuggestion } from '@/hooks/usePlaceSuggestion';
import { useCitySuggestion } from '@/hooks/useCitySuggestion';
import { PlaceDetails } from '@/hooks/useGooglePlaces';
import { calculateDistanceMiles } from '@/lib/distance';
import { toast } from 'sonner';

// Types that indicate a geographic area (city) vs a business
const CITY_TYPES = ['locality', 'administrative_area_level_1', 'administrative_area_level_2', 'administrative_area_level_3', 'sublocality', 'postal_town'];
const BUSINESS_TYPES = ['establishment', 'point_of_interest'];
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
  // Auth & relationship state
  const { isAuthenticated } = useAuth();
  const { memberProfile, updateMemberProfile, refetch } = useCouple();
  const { ensureRelationshipUnit } = useEnsureRelationshipUnit();
  
  // Preference prompts (behavioral onboarding)
  const {
    currentPrompt,
    isPromptOpen,
    setIsPromptOpen,
    handleAnswer,
    handleSkip,
  } = usePreferencePrompts();
  
  // City picker modal state
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [cityPickerMode, setCityPickerMode] = useState<CityPickerMode>('home');
  const [hasShownCityPicker, setHasShownCityPicker] = useState(() => {
    return sessionStorage.getItem('city_picker_shown') === 'true';
  });

  // User location (exploration > profile > browser geolocation)
  const { 
    lat: userLat, 
    lng: userLng, 
    source: locationSource,
    explorationCity,
    isLoading: locationLoading, 
    requestBrowserLocation,
    setExplorationCity,
    clearExplorationCity,
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
  
  // Place suggestion state
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const [selectedGooglePlace, setSelectedGooglePlace] = useState<PlaceDetails | null>(null);
  const { submitSuggestion, isSubmitting: isSuggesting } = usePlaceSuggestion();
  
  // City suggestion state
  const [citySuggestionModalOpen, setCitySuggestionModalOpen] = useState(false);
  const [selectedGoogleCity, setSelectedGoogleCity] = useState<PlaceDetails | null>(null);
  const { submitSuggestion: submitCitySuggestion, isSubmitting: isSuggestingCity } = useCitySuggestion();
  
  // Events state
  const [dateFilter, setDateFilter] = useState<DateFilter>('upcoming');
  const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  // Show city picker for authenticated users without location (once per session)
  useEffect(() => {
    if (isAuthenticated && !hasUserLocation && !hasShownCityPicker && !locationLoading) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setCityPickerMode('home');
        setShowCityPicker(true);
        setHasShownCityPicker(true);
        sessionStorage.setItem('city_picker_shown', 'true');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, hasUserLocation, hasShownCityPicker, locationLoading]);

  // Handle city selection from modal
  const handleCitySelect = async (details: PlaceDetails) => {
    if (cityPickerMode === 'exploration') {
      // Exploration mode: store city name + state for text-based filtering
      setExplorationCity({
        name: details.city || details.name,
        state: details.state,
        lat: details.lat,
        lng: details.lng,
      });
      return;
    }

    // Home mode: save to profile
    if (!isAuthenticated) return;

    // Ensure relationship unit exists (creates silently if needed)
    const coupleId = await ensureRelationshipUnit();
    if (!coupleId) {
      // Fall back to browser location if we can't save to profile
      requestBrowserLocation();
      return;
    }

    // Update member profile with city info
    try {
      await updateMemberProfile({
        city: details.city || details.name,
        city_place_id: details.place_id,
        city_lat: details.lat,
        city_lng: details.lng,
        state: details.state,
      });
      await refetch();
    } catch (error) {
      console.error('Failed to save city:', error);
      // Fall back to browser location
      requestBrowserLocation();
    }
  };

  const handleCityPickerSkip = () => {
    if (cityPickerMode === 'home') {
      // Try browser geolocation as fallback
      requestBrowserLocation();
    }
    // For exploration mode, just close the modal (no fallback needed)
  };

  // Open city picker in exploration mode
  const handleExploreCity = () => {
    setCityPickerMode('exploration');
    setShowCityPicker(true);
  };

  // Data fetching - use city/state for exploration, lat/lng for normal mode
  const { data: places, isLoading: placesLoading, isSwitchingLocation } = usePublicPlaces(
    locationSource === 'exploration' && explorationCity
      ? { city: explorationCity.name, state: explorationCity.state }
      : { lat: userLat, lng: userLng, radiusMiles: 100 }
  );
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

  // Helper to detect if a place is a city (geographic area) vs a business
  const isCity = (details: PlaceDetails): boolean => {
    const types = details.google_types || [];
    const hasGeoType = types.some(t => CITY_TYPES.includes(t));
    const hasBusinessType = types.some(t => BUSINESS_TYPES.includes(t));
    // It's a city if it has geographic types but NO business types
    return hasGeoType && !hasBusinessType;
  };

  // Handle search autocomplete place selection
  const handleSearchPlaceSelect = (details: PlaceDetails) => {
    // First check if this is a city rather than a business
    if (isCity(details)) {
      if (isAuthenticated) {
        setSelectedGoogleCity(details);
        setCitySuggestionModalOpen(true);
      } else {
        toast.info('Sign in to suggest this city');
      }
      return;
    }

    // Check if place exists in our database
    const matchingPlace = places?.find(
      p => p.google_place_id === details.place_id
    );
    
    if (matchingPlace) {
      // Place exists - open existing detail modal
      setSelectedPlace(matchingPlace as DirectoryPlace);
      setPlaceModalOpen(true);
    } else if (isAuthenticated) {
      // Place not in DB - offer to suggest it
      setSelectedGooglePlace(details);
      setSuggestionModalOpen(true);
    } else {
      // Not authenticated - prompt to sign in
      toast.info('Sign in to suggest this place');
    }
  };

  // Handle place suggestion confirmation
  const handleConfirmSuggestion = async () => {
    if (!selectedGooglePlace) return;
    
    const success = await submitSuggestion(selectedGooglePlace);
    if (success) {
      setSuggestionModalOpen(false);
      setSelectedGooglePlace(null);
      setSearchTerm('');
    }
  };

  // Handle city suggestion confirmation
  const handleConfirmCitySuggestion = async () => {
    if (!selectedGoogleCity) return;
    
    const success = await submitCitySuggestion(selectedGoogleCity);
    if (success) {
      setCitySuggestionModalOpen(false);
      setSelectedGoogleCity(null);
      setSearchTerm('');
    }
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
            Curated spots and community signals in your city
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
          <div className="max-w-md mt-6">
            {activeTab === 'places' ? (
              <GooglePlacesAutocomplete
                value={searchTerm}
                onChange={setSearchTerm}
                onPlaceSelect={handleSearchPlaceSelect}
                placeholder="Search places..."
                types="establishment"
                locationBias={hasUserLocation ? { lat: userLat!, lng: userLng! } : undefined}
              />
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search events..."
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9 pr-9"
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
            )}
          </div>

          {/* Location Context Banner */}
          <div className="mt-4">
            <LocationContextBanner
              hasLocation={hasUserLocation}
              locationSource={locationSource}
              explorationCity={explorationCity}
              profileCity={memberProfile?.city}
              isLoading={locationLoading}
              onRequestLocation={requestBrowserLocation}
              onExploreCity={handleExploreCity}
              onClearExploration={clearExplorationCity}
            />
          </div>

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
            ) : isSwitchingLocation ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">
                  Finding places in {explorationCity?.name || 'new location'}...
                </p>
              </div>
            ) : processedPlaces.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <MapPinOff className="h-12 w-12 mx-auto text-muted-foreground/30" />
                <div className="space-y-2">
                  <p className="font-medium">
                    {hasActiveFilters 
                      ? 'No matches found' 
                      : locationSource === 'exploration' 
                        ? `No places in ${explorationCity?.name} yet`
                        : 'Your area is coming soon'}
                  </p>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    {hasActiveFilters
                      ? 'Try adjusting your filters to see more results'
                      : locationSource === 'exploration'
                        ? 'Be the first to suggest a spot in this city!'
                        : "We're curating the best spots in your area. Add your city to be notified."}
                  </p>
                </div>
                {hasActiveFilters ? (
                  <Button variant="outline" size="sm" onClick={clearAllFilters}>
                    Clear all filters
                  </Button>
                ) : locationSource === 'exploration' ? (
                  <Button variant="outline" size="sm" onClick={clearExplorationCity}>
                    ← Back to your location
                  </Button>
                ) : !hasUserLocation && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowCityPicker(true)}
                  >
                    Add Your City
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
      <CityPickerModal
        open={showCityPicker}
        onOpenChange={setShowCityPicker}
        onCitySelect={handleCitySelect}
        onSkip={handleCityPickerSkip}
        mode={cityPickerMode}
      />
      <PlaceSuggestionModal
        open={suggestionModalOpen}
        onOpenChange={setSuggestionModalOpen}
        placeDetails={selectedGooglePlace}
        onConfirm={handleConfirmSuggestion}
        isSubmitting={isSuggesting}
      />
      <CitySuggestionModal
        open={citySuggestionModalOpen}
        onOpenChange={setCitySuggestionModalOpen}
        cityDetails={selectedGoogleCity}
        onConfirm={handleConfirmCitySuggestion}
        isSubmitting={isSuggestingCity}
      />
      
      {/* Behavioral Preference Prompt */}
      {currentPrompt && (
        <PreferencePrompt
          prompt={currentPrompt}
          open={isPromptOpen}
          onOpenChange={setIsPromptOpen}
          onAnswer={handleAnswer}
          onSkip={handleSkip}
        />
      )}
    </PageLayout>
  );
};

export default Places;