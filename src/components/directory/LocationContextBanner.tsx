import { MapPin, MapPinOff, Loader2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationContextBannerProps {
  hasLocation: boolean;
  locationSource: 'profile' | 'browser' | 'exploration' | null;
  // URL-based exploration props
  exploringCity?: string | null;
  exploringState?: string | null;
  profileCity?: string | null;
  isLoading: boolean;
  onRequestLocation: () => void;
  onExploreCity: () => void;
  onClearExploration: () => void;
}

/**
 * Unified location context banner for the directory.
 * Shows current location state with appropriate actions:
 * - Exploration mode: City name + "Back to my location"
 * - Home mode with location: City name + "Explore another city"
 * - No location: Enable location UI
 */
const LocationContextBanner = ({
  hasLocation,
  locationSource,
  exploringCity,
  exploringState,
  profileCity,
  isLoading,
  onRequestLocation,
  onExploreCity,
  onClearExploration,
}: LocationContextBannerProps) => {
  // Exploration mode (based on URL params)
  if (locationSource === 'exploration' && exploringCity) {
    const displayName = exploringState 
      ? `${exploringCity}, ${exploringState}` 
      : exploringCity;
    
    return (
      <div className="flex items-center justify-between gap-4 text-sm bg-accent/50 border border-accent px-4 py-3 rounded-lg">
        <div className="flex items-center gap-2 text-accent-foreground">
          <Globe className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium">Exploring: {displayName}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearExploration}
          className="h-auto py-1.5 px-3 text-accent-foreground hover:text-foreground"
        >
          ← Back to my location
        </Button>
      </div>
    );
  }

  // Has location (profile or browser)
  if (hasLocation) {
    const locationLabel = locationSource === 'profile' && profileCity 
      ? profileCity 
      : 'Near you';
    
    return (
      <div className="flex items-center justify-between gap-4 text-sm bg-muted/50 px-4 py-3 rounded-lg">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span>{locationLabel}</span>
        </div>
        <Button 
          variant="link" 
          size="sm" 
          onClick={onExploreCity}
          className="h-auto py-1.5 px-3 text-muted-foreground hover:text-foreground"
        >
          Explore another city
        </Button>
      </div>
    );
  }

  // No location
  return (
    <div className="flex items-center justify-between gap-4 text-sm bg-muted/50 px-4 py-3 rounded-lg">
      <div className="flex items-center gap-2 text-muted-foreground">
        <MapPinOff className="h-4 w-4 flex-shrink-0" />
        <span>Enable location to see nearby places</span>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRequestLocation}
          disabled={isLoading}
          className="h-auto py-1.5 px-3"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Use my location'
          )}
        </Button>
        <Button 
          variant="link" 
          size="sm" 
          onClick={onExploreCity}
          className="h-auto py-1.5 px-3"
        >
          Add City
        </Button>
      </div>
    </div>
  );
};

export default LocationContextBanner;
