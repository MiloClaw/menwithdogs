import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, AlertCircle, Building2, Loader2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePlaces } from '@/hooks/usePlaces';
import { useGooglePlaces, PlaceDetails, PlacePrediction } from '@/hooks/useGooglePlaces';
import { cn } from '@/lib/utils';

interface Place {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  status: 'approved' | 'pending' | 'rejected';
  google_primary_type: string | null;
  google_place_id?: string;
}

interface VenuePickerProps {
  value: string;
  onChange: (placeId: string, place?: Place) => void;
  onVenueTypeChange?: (googlePrimaryType: string | null) => void;
  defaultSearch?: string;
}

const statusColors: Record<string, string> = {
  approved: 'bg-green-500/10 text-green-700 border-green-500/20',
  pending: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  rejected: 'bg-red-500/10 text-red-700 border-red-500/20',
};

const VenuePicker = ({ value, onChange, onVenueTypeChange, defaultSearch }: VenuePickerProps) => {
  const { places, createPlace } = usePlaces();
  const { 
    predictions, 
    isLoading: isLoadingGoogle, 
    fetchAutocomplete, 
    fetchDetails, 
    clearPredictions 
  } = useGooglePlaces();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingVenue, setIsCreatingVenue] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const hasSetDefaultSearch = useRef(false);
  
  // Get selected place info
  const selectedPlace = places.find(p => p.id === value);
  
  // Group places by status for display
  const approvedPlaces = places.filter(p => p.status === 'approved');
  const pendingPlaces = places.filter(p => p.status === 'pending');
  
  // Filter local places based on search
  const filteredApproved = searchTerm.length > 0 
    ? approvedPlaces.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  const filteredPending = searchTerm.length > 0
    ? pendingPlaces.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Set default search on mount (only once)
  useEffect(() => {
    if (defaultSearch && !hasSetDefaultSearch.current && !value) {
      setSearchTerm(defaultSearch);
      hasSetDefaultSearch.current = true;
    }
  }, [defaultSearch, value]);

  // Fetch Google Places predictions when search changes
  const debouncedFetch = useCallback((term: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (term.length < 2) {
      clearPredictions();
      return;
    }
    
    debounceRef.current = setTimeout(() => {
      // Use 'establishment' type for venue search
      fetchAutocomplete(term, 'establishment');
    }, 200);
  }, [fetchAutocomplete, clearPredictions]);

  useEffect(() => {
    debouncedFetch(searchTerm);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, debouncedFetch]);

  // Reset default search flag when value is cleared
  useEffect(() => {
    if (!value) {
      hasSetDefaultSearch.current = false;
    }
  }, [value]);

  // Notify parent when venue type changes
  useEffect(() => {
    if (selectedPlace && onVenueTypeChange) {
      onVenueTypeChange(selectedPlace.google_primary_type);
    }
  }, [selectedPlace, onVenueTypeChange]);

  const handlePlaceSelect = (place: Place) => {
    onChange(place.id, place);
    setSearchTerm('');
    clearPredictions();
    if (onVenueTypeChange) {
      onVenueTypeChange(place.google_primary_type);
    }
  };

  const handleGooglePredictionSelect = async (prediction: PlacePrediction) => {
    // Check if this google_place_id already exists in our DB
    const existingPlace = places.find(p => p.google_place_id === prediction.place_id);
    if (existingPlace) {
      handlePlaceSelect(existingPlace as Place);
      return;
    }

    // Fetch full details and create new venue
    setIsCreatingVenue(true);
    try {
      const details = await fetchDetails(prediction.place_id);
      if (!details) {
        throw new Error('Failed to fetch place details');
      }

      // Create new place with pending status
      const result = await createPlace.mutateAsync({
        google_place_id: details.place_id,
        name: details.name,
        primary_category: 'general',
        formatted_address: details.formatted_address,
        city: details.city,
        state: details.state,
        country: details.country,
        lat: details.lat,
        lng: details.lng,
        phone_number: details.phone_number,
        website_url: details.website_url,
        google_maps_url: details.google_maps_url,
        rating: details.rating,
        user_ratings_total: details.user_ratings_total,
        price_level: details.price_level,
        google_primary_type: details.google_primary_type,
        google_primary_type_display: details.google_primary_type_display,
        opening_hours: details.opening_hours as any,
        photos: details.photos as any,
        status: 'pending',
      });

      // Select the newly created place
      onChange(result.id, {
        id: result.id,
        name: result.name,
        city: result.city,
        state: result.state,
        status: result.status as 'approved' | 'pending' | 'rejected',
        google_primary_type: result.google_primary_type,
        google_place_id: result.google_place_id,
      });
      
      if (onVenueTypeChange) {
        onVenueTypeChange(result.google_primary_type);
      }
      
      setSearchTerm('');
      clearPredictions();
    } catch (error) {
      console.error('Failed to create venue:', error);
    } finally {
      setIsCreatingVenue(false);
    }
  };

  // Filter out Google predictions that already exist in our DB
  const newGooglePredictions = predictions.filter(
    pred => !places.some(p => p.google_place_id === pred.place_id)
  );

  const hasLocalResults = filteredApproved.length > 0 || filteredPending.length > 0;
  const hasGoogleResults = newGooglePredictions.length > 0;
  const hasAnyResults = hasLocalResults || hasGoogleResults;
  const showDropdown = searchTerm.length > 0 && !selectedPlace;

  return (
    <div className="space-y-3">
      <Label>Venue</Label>
      
      {/* Selected venue display */}
      {selectedPlace ? (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{selectedPlace.name}</p>
              <p className="text-sm text-muted-foreground">
                {[selectedPlace.city, selectedPlace.state].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={statusColors[selectedPlace.status]}>
              {selectedPlace.status}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => onChange('')}>
              Change
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Unified search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search venues or add from Google..."
              className="pl-9 pr-9"
            />
            {(isLoadingGoogle || isCreatingVenue) && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          
          {/* Unified results */}
          {showDropdown && (
            <ScrollArea className="h-[280px] border rounded-lg">
              <div className="p-2 space-y-1">
                {/* Local approved places */}
                {filteredApproved.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                      Matching Venues
                    </p>
                    {filteredApproved.map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        className={cn(
                          'w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent text-left transition-colors',
                          value === place.id && 'bg-accent'
                        )}
                        onClick={() => handlePlaceSelect(place as Place)}
                      >
                        <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{place.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {[place.city, place.state].filter(Boolean).join(', ')}
                          </p>
                        </div>
                        <Badge variant="outline" className={cn('text-xs', statusColors.approved)}>
                          approved
                        </Badge>
                      </button>
                    ))}
                  </>
                )}
                
                {/* Local pending places */}
                {filteredPending.length > 0 && (
                  <>
                    {filteredApproved.length > 0 && <Separator className="my-2" />}
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Pending Venues
                    </p>
                    {filteredPending.map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        className={cn(
                          'w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent text-left transition-colors',
                          value === place.id && 'bg-accent'
                        )}
                        onClick={() => handlePlaceSelect(place as Place)}
                      >
                        <MapPin className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{place.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {[place.city, place.state].filter(Boolean).join(', ')}
                          </p>
                        </div>
                        <Badge variant="outline" className={statusColors.pending}>
                          pending
                        </Badge>
                      </button>
                    ))}
                  </>
                )}
                
                {/* Google Places results */}
                {hasGoogleResults && (
                  <>
                    {hasLocalResults && <Separator className="my-2" />}
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center gap-1">
                      <Plus className="h-3 w-3" />
                      Add from Google
                    </p>
                    {newGooglePredictions.map((prediction) => (
                      <button
                        key={prediction.place_id}
                        type="button"
                        disabled={isCreatingVenue}
                        className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent text-left transition-colors disabled:opacity-50"
                        onClick={() => handleGooglePredictionSelect(prediction)}
                      >
                        <Plus className="h-4 w-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {prediction.structured_formatting?.main_text || prediction.description}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {prediction.structured_formatting?.secondary_text || ''}
                          </p>
                        </div>
                      </button>
                    ))}
                    
                    {/* Google attribution */}
                    <div className="px-2 py-1 mt-2 border-t">
                      <p className="text-[10px] text-muted-foreground text-right">
                        Powered by Google
                      </p>
                    </div>
                  </>
                )}
                
                {/* No results */}
                {!hasAnyResults && !isLoadingGoogle && searchTerm.length >= 2 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No venues found
                  </p>
                )}
                
                {/* Searching indicator */}
                {searchTerm.length >= 2 && isLoadingGoogle && !hasAnyResults && (
                  <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </div>
                )}
                
                {/* Type more hint */}
                {searchTerm.length > 0 && searchTerm.length < 2 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Type at least 2 characters to search
                  </p>
                )}
              </div>
            </ScrollArea>
          )}
        </>
      )}
      
      {/* Warning for pending venue */}
      {selectedPlace?.status === 'pending' && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            This venue is pending approval. The event will remain pending until the venue is approved.
          </p>
        </div>
      )}
    </div>
  );
};

export default VenuePicker;
