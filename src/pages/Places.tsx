import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, MapPinOff, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PageLayout from '@/components/PageLayout';
import DirectoryPlaceCard, { DirectoryPlace } from '@/components/directory/DirectoryPlaceCard';
import PlaceDetailModal from '@/components/directory/PlaceDetailModal';
import CityPickerModal, { CityPickerMode } from '@/components/directory/CityPickerModal';
import PlaceSuggestionModal from '@/components/directory/PlaceSuggestionModal';
import { CitySuggestionModal } from '@/components/directory/CitySuggestionModal';
import PreferencePrompt from '@/components/preferences/PreferencePrompt';
import LocationContextBanner from '@/components/directory/LocationContextBanner';
import WhatsHappening from '@/components/directory/WhatsHappening';
import GooglePlacesAutocomplete from '@/components/ui/google-places-autocomplete';
import { usePersonalizedPlaces } from '@/hooks/usePersonalizedPlaces';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useEnsureRelationshipUnit } from '@/hooks/useEnsureRelationshipUnit';
import { usePreferencePrompts } from '@/hooks/usePreferencePrompts';
import { usePlaceSuggestion } from '@/hooks/usePlaceSuggestion';
import { useCitySuggestion } from '@/hooks/useCitySuggestion';
import { usePlaceFavorites } from '@/hooks/usePlaceFavorites';
import { PlaceDetails } from '@/hooks/useGooglePlaces';
import { calculateDistanceMiles } from '@/lib/distance';
import { recordSignal } from '@/hooks/useUserSignals';
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


const Places = () => {
  // URL params for exploration mode
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const exploringCity = searchParams.get('city');
  const exploringState = searchParams.get('state');
  const isExplorationMode = !!exploringCity;

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
  
  // City picker modal state (for setting home city only now)
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [hasShownCityPicker, setHasShownCityPicker] = useState(() => {
    return sessionStorage.getItem('city_picker_shown') === 'true';
  });

  // User location (profile > browser geolocation) - exploration is now via URL
  const { 
    lat: userLat, 
    lng: userLng, 
    source: locationSource,
    isLoading: locationLoading, 
    requestBrowserLocation,
  } = useUserLocation();
  const hasUserLocation = userLat != null && userLng != null;
  
  // Shared state
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
  
  // Place favorites (for QR code save flow)
  const { addFavorite, isFavorited } = usePlaceFavorites();

  // Show city picker for authenticated users without location (once per session)
  // Only show when NOT in exploration mode
  useEffect(() => {
    if (isAuthenticated && !hasUserLocation && !hasShownCityPicker && !locationLoading && !isExplorationMode) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setShowCityPicker(true);
        setHasShownCityPicker(true);
        sessionStorage.setItem('city_picker_shown', 'true');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, hasUserLocation, hasShownCityPicker, locationLoading, isExplorationMode]);

  // Handle pending save from QR code flow (?save=placeId)
  useEffect(() => {
    const saveParam = searchParams.get('save');
    if (saveParam && isAuthenticated) {
      // Clear the param from URL immediately
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('save');
      setSearchParams(newParams, { replace: true });
      
      // Check if already saved
      if (isFavorited(saveParam)) {
        toast.success('Already saved!', { description: 'This place is in your favorites.' });
        return;
      }
      
      // Save the place
      addFavorite(saveParam);
    }
  }, [searchParams, isAuthenticated, isFavorited, addFavorite, setSearchParams]);

  // Handle city selection from modal (home city only now)
  const handleCitySelect = async (details: PlaceDetails) => {
    // Save to profile
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
    // Try browser geolocation as fallback
    requestBrowserLocation();
  };

  // Navigate to explore cities page
  const handleExploreCity = () => {
    navigate('/places/explore');
  };

  // Clear exploration (remove URL params)
  const handleClearExploration = () => {
    setSearchParams({});
  };

  // Data fetching - use city/state from URL params for exploration, lat/lng for normal mode
  // PHASE 2: usePersonalizedPlaces applies affinity-weighted sorting for authenticated users
  const { data: places, isLoading: placesLoading, isSwitchingLocation } = usePersonalizedPlaces(
    isExplorationMode
      ? { city: exploringCity!, state: exploringState }
      : { lat: userLat, lng: userLng, radiusMiles: 100 }
  );
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

        {/* Search */}
        <div className="max-w-md">
          <GooglePlacesAutocomplete
            value={searchTerm}
            onChange={setSearchTerm}
            onPlaceSelect={handleSearchPlaceSelect}
            placeholder="Search places..."
            types="establishment"
            locationBias={hasUserLocation ? { lat: userLat!, lng: userLng! } : undefined}
          />
        </div>

        {/* Location Context Banner */}
        <LocationContextBanner
          hasLocation={hasUserLocation}
          locationSource={isExplorationMode ? 'exploration' : locationSource}
          exploringCity={exploringCity}
          exploringState={exploringState}
          profileCity={memberProfile?.city}
          isLoading={locationLoading}
          onRequestLocation={requestBrowserLocation}
          onExploreCity={handleExploreCity}
          onClearExploration={handleClearExploration}
        />

        {/* Distance Filter */}
        {hasUserLocation && (
          <div className="space-y-2">
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

        {/* What's Happening Section - City-scoped posts */}
        {(isExplorationMode || memberProfile?.city) && (
          <WhatsHappening 
            cityName={isExplorationMode ? exploringCity : memberProfile?.city || null}
            state={isExplorationMode ? exploringState : memberProfile?.state || null}
          />
        )}

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
                  onClick={() => {
                    const newCategory = selectedCategory === category ? null : category;
                    setSelectedCategory(newCategory);
                    // SIGNAL CAPTURE: Record filter_category selection (Rule 3.2)
                    if (newCategory && isAuthenticated) {
                      recordSignal('filter_category', newCategory, null, 'implicit', 0.4)
                        .catch(console.error);
                    }
                  }}
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
              Finding places in {exploringCity || 'new location'}...
            </p>
          </div>
        ) : processedPlaces.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <MapPinOff className="h-12 w-12 mx-auto text-muted-foreground/30" />
            <div className="space-y-2">
              <p className="font-medium">
                {hasActiveFilters 
                  ? 'No matches found' 
                  : isExplorationMode 
                    ? `No places in ${exploringCity} yet`
                    : 'Your area is coming soon'}
              </p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more results'
                  : isExplorationMode
                    ? 'Be the first to suggest a spot in this city!'
                    : "We're curating the best spots in your area. Add your city to be notified."}
              </p>
            </div>
            {hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Clear all filters
              </Button>
            ) : isExplorationMode ? (
              <Button variant="outline" size="sm" onClick={handleClearExploration}>
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

      </div>

      {/* Modals */}
      <PlaceDetailModal 
        place={selectedPlace}
        open={placeModalOpen}
        onOpenChange={setPlaceModalOpen}
      />
      <CityPickerModal
        open={showCityPicker}
        onOpenChange={setShowCityPicker}
        onCitySelect={handleCitySelect}
        onSkip={handleCityPickerSkip}
        mode="home"
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