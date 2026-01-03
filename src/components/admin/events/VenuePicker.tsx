import { useState, useEffect } from 'react';
import { MapPin, Plus, Search, AlertCircle, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import GooglePlaceSearch from '@/components/admin/places/GooglePlaceSearch';
import { usePlaces } from '@/hooks/usePlaces';
import { useGooglePlaces, PlaceDetails } from '@/hooks/useGooglePlaces';
import { cn } from '@/lib/utils';

interface Place {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  status: 'approved' | 'pending' | 'rejected';
  google_primary_type: string | null;
}

interface VenuePickerProps {
  value: string;
  onChange: (placeId: string, place?: Place) => void;
  onVenueTypeChange?: (googlePrimaryType: string | null) => void;
}

const statusColors: Record<string, string> = {
  approved: 'bg-green-500/10 text-green-700 border-green-500/20',
  pending: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  rejected: 'bg-red-500/10 text-red-700 border-red-500/20',
};

const VenuePicker = ({ value, onChange, onVenueTypeChange }: VenuePickerProps) => {
  const { places, createPlace } = usePlaces();
  const { fetchDetails } = useGooglePlaces();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [isCreatingVenue, setIsCreatingVenue] = useState(false);
  
  // Get selected place info
  const selectedPlace = places.find(p => p.id === value);
  
  // Group places by status for display
  const approvedPlaces = places.filter(p => p.status === 'approved');
  const pendingPlaces = places.filter(p => p.status === 'pending');
  
  const filteredApproved = approvedPlaces.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredPending = pendingPlaces.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Notify parent when venue type changes
  useEffect(() => {
    if (selectedPlace && onVenueTypeChange) {
      onVenueTypeChange(selectedPlace.google_primary_type);
    }
  }, [selectedPlace, onVenueTypeChange]);

  const handlePlaceSelect = (place: Place) => {
    onChange(place.id, place);
    setSearchTerm('');
    if (onVenueTypeChange) {
      onVenueTypeChange(place.google_primary_type);
    }
  };

  const handleGooglePlaceSelect = async (details: PlaceDetails) => {
    setIsCreatingVenue(true);
    try {
      // Check for duplicate
      const existingPlace = places.find(p => p.google_place_id === details.place_id);
      if (existingPlace) {
        handlePlaceSelect(existingPlace as Place);
        setShowCreateNew(false);
        return;
      }

      // Create new place with pending status (Option A)
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
        status: 'pending', // Option A: Create as pending
      });

      // Select the newly created place
      onChange(result.id, {
        id: result.id,
        name: result.name,
        city: result.city,
        state: result.state,
        status: result.status as 'approved' | 'pending' | 'rejected',
        google_primary_type: result.google_primary_type,
      });
      
      if (onVenueTypeChange) {
        onVenueTypeChange(result.google_primary_type);
      }
      
      setShowCreateNew(false);
    } catch (error) {
      console.error('Failed to create venue:', error);
    } finally {
      setIsCreatingVenue(false);
    }
  };

  // If showing create new view
  if (showCreateNew) {
    return (
      <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Venue
          </Label>
          <Button variant="ghost" size="sm" onClick={() => setShowCreateNew(false)}>
            Cancel
          </Button>
        </div>
        
        <GooglePlaceSearch
          onPlaceSelected={handleGooglePlaceSelect}
        />
        
        {isCreatingVenue && (
          <p className="text-sm text-muted-foreground">Creating venue...</p>
        )}
        
        <p className="text-xs text-muted-foreground">
          New venues will be created with <Badge variant="outline" className={statusColors.pending}>pending</Badge> status.
        </p>
      </div>
    );
  }

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
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search existing venues..."
              className="pl-9"
            />
          </div>
          
          {/* Venue list */}
          <ScrollArea className="h-[200px] border rounded-lg">
            <div className="p-2 space-y-1">
              {/* Approved places first */}
              {filteredApproved.length > 0 && (
                <>
                  <p className="text-xs font-medium text-muted-foreground px-2 py-1">Approved Venues</p>
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
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{place.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {[place.city, place.state].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </button>
                  ))}
                </>
              )}
              
              {/* Pending places */}
              {filteredPending.length > 0 && (
                <>
                  <Separator className="my-2" />
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
              
              {filteredApproved.length === 0 && filteredPending.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No venues found
                </p>
              )}
            </div>
          </ScrollArea>
          
          {/* Add new venue button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setShowCreateNew(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Can't find it? Add new venue
          </Button>
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
