import { useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GooglePlacesAutocomplete from '@/components/ui/google-places-autocomplete';
import { PlaceDetails } from '@/hooks/useGooglePlaces';
import { cn } from '@/lib/utils';

interface SessionLocation {
  city: string;
  state: string | null;
  lat: number;
  lng: number;
}

interface SessionLocationPickerProps {
  currentLocation: SessionLocation | null;
  onLocationSelect: (location: SessionLocation) => void;
  isUpdating?: boolean;
  className?: string;
}

export function SessionLocationPicker({
  currentLocation,
  onLocationSelect,
  isUpdating = false,
  className,
}: SessionLocationPickerProps) {
  const [isEditing, setIsEditing] = useState(!currentLocation);
  const [searchValue, setSearchValue] = useState('');

  const handlePlaceSelect = (place: PlaceDetails) => {
    // Extract city and state from PlaceDetails
    const city = place.city || place.name;
    const state = place.state;

    if (place.lat != null && place.lng != null) {
      onLocationSelect({
        city,
        state,
        lat: place.lat,
        lng: place.lng,
      });
    }

    setSearchValue('');
    setIsEditing(false);
  };

  const displayLocation = currentLocation
    ? currentLocation.state
      ? `${currentLocation.city}, ${currentLocation.state}`
      : currentLocation.city
    : null;

  if (isEditing) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          <span>Where are you exploring?</span>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <GooglePlacesAutocomplete
              value={searchValue}
              onChange={setSearchValue}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Search for a city..."
              types="(cities)"
              disabled={isUpdating}
              className="w-full"
            />
          </div>
          
          {currentLocation && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(false)}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-muted/50 border',
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <MapPin className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-medium truncate">
          Searching in: <span className="text-foreground">{displayLocation}</span>
        </span>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsEditing(true)}
        disabled={isUpdating}
        className="shrink-0"
      >
        Change
      </Button>
    </div>
  );
}
