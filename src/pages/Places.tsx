import { useState, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, MapPinOff, X, Sparkles, Map, List, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

// Lazy load MapView for bundle optimization
const MapView = lazy(() => import('@/components/map/MapView'));
import { MapLoadingSkeleton } from '@/components/map/MapLoadingSkeleton';
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
import { CategoryFilterSheet } from '@/components/directory/CategoryFilterSheet';
import { PlacesEmptyState } from '@/components/directory/PlacesEmptyState';

import GooglePlacesAutocomplete from '@/components/ui/google-places-autocomplete';
import { usePersonalizedPlaces } from '@/hooks/usePersonalizedPlaces';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useEnsureRelationshipUnit } from '@/hooks/useEnsureRelationshipUnit';
import { usePreferencePrompts } from '@/hooks/usePreferencePrompts';
import { usePlaceSuggestion } from '@/hooks/usePlaceSuggestion';
import { useCitySuggestion, MetroInfo } from '@/hooks/useCitySuggestion';
import { usePlaceFavorites } from '@/hooks/usePlaceFavorites';
import { usePlacesFilters, RADIUS_OPTIONS, MAX_RADIUS_MILES } from '@/hooks/usePlacesFilters';
import { PlaceDetails } from '@/hooks/useGooglePlaces';
import { calculateDistanceMiles } from '@/lib/distance';
import { recordSignal } from '@/hooks/useUserSignals';
import { toast } from 'sonner';
import { showAuthToast } from '@/lib/auth-toast';

// Types that indicate a geographic area (city) vs a business
const CITY_TYPES = ['locality', 'administrative_area_level_1', 'administrative_area_level_2', 'administrative_area_level_3', 'sublocality', 'postal_town'];
const BUSINESS_TYPES = ['establishment', 'point_of_interest'];

const Places = () => {
  // URL params for exploration mode and suburb bias
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const exploringCity = searchParams.get('city');
  const exploringState = searchParams.get('state');
  const biasLat = searchParams.get('bias_lat');
  const biasLng = searchParams.get('bias_lng');
  const isExplorationMode = !!exploringCity;
  
  // View mode: map (default) or list (from URL for back/forward support)
  const viewMode = searchParams.get('view') === 'list' ? 'list' : 'map';
  
  const toggleView = () => {
    const newParams = new URLSearchParams(searchParams);
    if (viewMode === 'map') {
      newParams.set('view', 'list');
    } else {
      newParams.delete('view');
    }
    setSearchParams(newParams);
  };

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
  
  // Extracted filter state (Priority 5)
  const {
    searchTerm,
    setSearchTerm,
    radiusFilter,
    setRadiusFilter,
    selectedCategory,
    setSelectedCategory,
    hasActiveFilters,
    clearAllFilters,
  } = usePlacesFilters();
  
  // Places state
  const [selectedPlace, setSelectedPlace] = useState<DirectoryPlace | null>(null);
  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  
  // Category filter collapse state (desktop)
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  
  // Place suggestion state
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const [selectedGooglePlace, setSelectedGooglePlace] = useState<PlaceDetails | null>(null);
  const { submitSuggestion, isSubmitting: isSuggesting } = usePlaceSuggestion();
  
  // City suggestion state
  const [citySuggestionModalOpen, setCitySuggestionModalOpen] = useState(false);
  const [selectedGoogleCity, setSelectedGoogleCity] = useState<PlaceDetails | null>(null);
  const [metroInfo, setMetroInfo] = useState<MetroInfo | null>(null);
  const { 
    submitSuggestion: submitCitySuggestion, 
    isSubmitting: isSuggestingCity,
    checkMetroMembership,
    isCheckingMetro,
  } = useCitySuggestion();
  
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

  // Parse suburb bias coordinates (from metro redirect)
  const biasCoords = useMemo(() => {
    if (biasLat && biasLng) {
      const lat = parseFloat(biasLat);
      const lng = parseFloat(biasLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    return null;
  }, [biasLat, biasLng]);

  // Data fetching - use city/state from URL params for exploration, lat/lng for normal mode
  // PHASE 2: usePersonalizedPlaces applies affinity-weighted sorting for authenticated users
  const { data: places, isLoading: placesLoading, isSwitchingLocation } = usePersonalizedPlaces(
    isExplorationMode
      ? { city: exploringCity!, state: exploringState, biasCoords }
      : { lat: userLat, lng: userLng, radiusMiles: MAX_RADIUS_MILES }
  );
  
  // Get unique place categories
  const placeCategories = useMemo(() => {
    if (!places) return [];
    const cats = [...new Set(places.map(p => p.primary_category))].filter(Boolean);
    return cats.sort();
  }, [places]);

  // Process places with filters (distance already computed by usePersonalizedPlaces)
  // PHASE 1 FIX: Distance is now calculated using explored city coords in exploration mode
  const processedPlaces = useMemo(() => {
    if (!places) return [];

    // Filter by search, category, and radius
    let filtered = places.filter(place => {
      const matchesSearch = !searchTerm || 
        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.city?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || 
        place.primary_category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Apply radius filter when we have user location OR in exploration mode
    // In exploration mode, distances are calculated from the explored city center
    if (radiusFilter !== null && (hasUserLocation || isExplorationMode)) {
      filtered = filtered.filter(place => 
        place.distance !== undefined && place.distance <= radiusFilter
      );
    }

    // usePersonalizedPlaces already handles sorting (personalized + distance)
    // Only re-sort if no personalization applied (fallback)
    return filtered;
  }, [places, searchTerm, selectedCategory, radiusFilter, hasUserLocation, isExplorationMode]);

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
  const handleSearchPlaceSelect = async (details: PlaceDetails) => {
    // First check if this is a city rather than a business
    if (isCity(details)) {
      if (isAuthenticated) {
        setSelectedGoogleCity(details);
        setCitySuggestionModalOpen(true);
        
        // Check metro membership in the background
        // Only check if we have county info
        if (details.county && details.state) {
          const metro = await checkMetroMembership(details.county, details.state);
          setMetroInfo(metro);
        } else {
          setMetroInfo(null);
        }
      } else {
        showAuthToast({
          title: 'Sign in to suggest this city',
          description: 'Help us expand to new areas.',
          onNavigate: () => navigate('/auth'),
        });
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
      // Not authenticated - prompt to sign in with action
      showAuthToast({
        title: 'Sign in to suggest this place',
        description: 'Share your favorite hidden gems.',
        onNavigate: () => navigate('/auth'),
      });
    }
  };

  // Handle place suggestion confirmation
  const handleConfirmSuggestion = async () => {
    if (!selectedGooglePlace) return;
    
    const result = await submitSuggestion(selectedGooglePlace);
    
    // Handle true boolean success (new place added)
    if (result === true) {
      setSuggestionModalOpen(false);
      setSelectedGooglePlace(null);
      setSearchTerm('');
      return;
    }
    
    // Handle duplicate case - close modal and optionally open existing place
    if (typeof result === 'object' && result.existingId) {
      setSuggestionModalOpen(false);
      setSelectedGooglePlace(null);
      setSearchTerm('');
      
      // Try to open the existing place detail modal if it's in current view
      const existingPlace = places?.find(p => p.id === result.existingId);
      if (existingPlace) {
        setSelectedPlace(existingPlace);
      }
      return;
    }
    
    // On false (other errors), modal stays open for retry
  };

  // Handle city suggestion confirmation
  const handleConfirmCitySuggestion = async () => {
    if (!selectedGoogleCity) return;
    
    const success = await submitCitySuggestion(selectedGoogleCity);
    if (success) {
      setCitySuggestionModalOpen(false);
      setSelectedGoogleCity(null);
      setMetroInfo(null);
      setSearchTerm('');
    }
  };

  // Handle metro redirect (when city is part of existing metro)
  const handleExploreMetro = () => {
    if (!metroInfo || !selectedGoogleCity) return;
    
    // Record signal that user was redirected (preserves original intent)
    if (isAuthenticated) {
      recordSignal(
        'city_suggestion_redirected', 
        selectedGoogleCity.name, 
        metroInfo.metroName || null, 
        'user', 
        1.0, 
        {
          original_input: selectedGoogleCity.name,
          original_state: selectedGoogleCity.state,
          interpreted_metro: metroInfo.metroName,
          suburb_lat: selectedGoogleCity.lat,
          suburb_lng: selectedGoogleCity.lng,
        }
      );
    }
    
    // Close modal and navigate with suburb bias
    setCitySuggestionModalOpen(false);
    setSelectedGoogleCity(null);
    setMetroInfo(null);
    setSearchTerm('');
    
    // Navigate to the metro's primary city with suburb bias for soft relevance boost
    const params = new URLSearchParams();
    if (metroInfo.primaryCity) params.set('city', metroInfo.primaryCity);
    if (metroInfo.primaryState) params.set('state', metroInfo.primaryState);
    if (selectedGoogleCity.lat) params.set('bias_lat', selectedGoogleCity.lat.toString());
    if (selectedGoogleCity.lng) params.set('bias_lng', selectedGoogleCity.lng.toString());
    
    navigate(`/places?${params.toString()}`);
  };

  // Handle category signal for filter selection
  const handleCategorySignal = (category: string) => {
    if (isAuthenticated) {
      recordSignal('filter_category', category, null, 'implicit', 0.4);
    }
  };

  // Determine empty state variant
  const getEmptyStateVariant = (): 'filters' | 'exploration' | 'no-location' => {
    if (hasActiveFilters) return 'filters';
    if (isExplorationMode) return 'exploration';
    return 'no-location';
  };

  // Hero parallax ref and scroll transform
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const ghostY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  return (
    <PageLayout>
      <div className="container space-y-8">
        {/* Editorial Hero Section with Ghost Typography */}
        <section 
          ref={heroRef}
          className="relative py-16 md:py-20 lg:py-24 overflow-hidden -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8"
        >
          {/* Ghost Parallax Element */}
          <motion.div
            style={{ y: ghostY }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          >
            <span className="text-[16rem] md:text-[22rem] font-serif font-bold text-foreground/[0.03] leading-none">
              &
            </span>
          </motion.div>
          
          <div className="relative z-10 max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4"
            >
              Directory
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight mb-4 text-balance"
            >
              Places
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty"
            >
              Browse spots worth knowing in your area.
            </motion.p>
            
            {/* Subtle personalization context - observational, not algorithmic */}
            {isAuthenticated && !placesLoading && processedPlaces.some(p => p.isRelevant) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-4 flex items-center gap-2 text-sm text-muted-foreground/70"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Personalized to your taste</span>
              </motion.div>
            )}
          </div>
        </section>

        {/* Search */}
        <div className="max-w-md md:max-w-lg">
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

        {/* Filters Row - Priority 1: Mobile category collapse */}
        <div className="flex flex-wrap items-start gap-4">
          {/* Distance Filter - Visible on all breakpoints when location is available or in exploration mode */}
          {(hasUserLocation || isExplorationMode) && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">How far?</p>
              <div className="flex flex-wrap gap-2">
                {RADIUS_OPTIONS.map(option => (
                  <button
                    key={option.label}
                    onClick={() => setRadiusFilter(option.value)}
                    className={`
                      min-h-[44px] px-4 rounded-full text-sm font-medium transition-all
                      ${radiusFilter === option.value 
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary/20' 
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'}
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter - Mobile: Sheet, Desktop: Inline */}
          {placeCategories.length > 0 && (
            <>
              {/* Mobile: Category Filter Sheet */}
              <div className="md:hidden space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">What kind?</p>
                <CategoryFilterSheet
                  categories={placeCategories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  onCategorySignal={handleCategorySignal}
                />
              </div>

              {/* Desktop: Collapsible Category Filters */}
              <div className="hidden md:block space-y-2">
                <Collapsible open={categoriesExpanded} onOpenChange={setCategoriesExpanded}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">What kind?</p>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-1 h-7 px-2 text-xs text-muted-foreground hover:text-foreground">
                        {categoriesExpanded ? 'Collapse' : 'Show all'}
                        <ChevronDown className={cn(
                          "h-3 w-3 transition-transform duration-200",
                          categoriesExpanded && "rotate-180"
                        )} />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  
                  {/* Always visible: "All" button and selected category when collapsed */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`
                        min-h-[44px] px-4 rounded-lg text-sm font-medium transition-all border
                        ${selectedCategory === null 
                          ? 'bg-foreground text-background border-foreground' 
                          : 'bg-transparent text-foreground border-border hover:border-foreground/50'}
                      `}
                    >
                      All
                    </button>
                    
                    {/* When collapsed, show only the selected category */}
                    {!categoriesExpanded && selectedCategory && (
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="min-h-[44px] px-4 rounded-lg text-sm font-medium transition-all border bg-foreground text-background border-foreground"
                      >
                        {selectedCategory}
                        <X className="inline-block ml-1 h-3 w-3" />
                      </button>
                    )}
                  </div>
                  
                  {/* Expandable: all category chips */}
                  <CollapsibleContent className="mt-2">
                    <div className="flex flex-wrap gap-2">
                      {placeCategories.map(category => (
                        <button
                          key={category}
                          onClick={() => {
                            const newCategory = selectedCategory === category ? null : category;
                            setSelectedCategory(newCategory);
                            if (newCategory) {
                              handleCategorySignal(newCategory);
                              setCategoriesExpanded(false); // Auto-collapse after selection
                            }
                          }}
                          className={`
                            min-h-[44px] px-4 rounded-lg text-sm font-medium transition-all border
                            ${selectedCategory === category 
                              ? 'bg-foreground text-background border-foreground' 
                              : 'bg-transparent text-foreground border-border hover:border-foreground/50'}
                          `}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </>
          )}
        </div>

        {/* Results Count, View Toggle & Clear Filters */}
        {!placesLoading && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {processedPlaces.length} {processedPlaces.length === 1 ? 'place' : 'places'} found
            </p>
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleView}
                className="gap-2"
              >
                {viewMode === 'list' ? (
                  <>
                    <Map className="h-4 w-4" />
                    <span className="hidden sm:inline">Map</span>
                  </>
                ) : (
                  <>
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">List</span>
                  </>
                )}
              </Button>
              {/* Clear filters */}
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
          </div>
        )}

        {/* Places Grid or Map View */}
        {viewMode === 'map' ? (
          <Suspense fallback={<MapLoadingSkeleton />}>
            <MapView
              places={processedPlaces}
              center={
                isExplorationMode && biasCoords 
                  ? biasCoords 
                  : hasUserLocation 
                    ? { lat: userLat!, lng: userLng! }
                    : null
              }
              onPlaceSelect={handlePlaceClick}
              isLoading={placesLoading || isSwitchingLocation}
              selectedCategory={selectedCategory}
            />
          </Suspense>
        ) : placesLoading ? (
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
          // Priority 4: Warmer loading copy
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Getting to know {exploringCity || 'your area'}...
            </p>
          </div>
        ) : processedPlaces.length === 0 ? (
          // Priority 2 & 5: Extracted empty state component with promoted CTA
          <PlacesEmptyState
            variant={getEmptyStateVariant()}
            exploringCity={exploringCity}
            onClearFilters={clearAllFilters}
            onClearExploration={handleClearExploration}
            onSetCity={() => setShowCityPicker(true)}
          />
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
        onRequestBrowserLocation={requestBrowserLocation}
        isRequestingLocation={locationLoading}
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
        onOpenChange={(open) => {
          setCitySuggestionModalOpen(open);
          if (!open) {
            setMetroInfo(null);
          }
        }}
        cityDetails={selectedGoogleCity}
        onConfirm={handleConfirmCitySuggestion}
        isSubmitting={isSuggestingCity}
        metroInfo={metroInfo}
        isCheckingMetro={isCheckingMetro}
        onExploreMetro={handleExploreMetro}
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
