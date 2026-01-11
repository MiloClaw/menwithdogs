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
 * 
 * PHASE 3 UX RULES:
 * - Place-first language (describe places, not system state)
 * - Calm, minimal design
 * - No algorithm language
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
      <div className="flex items-center justify-between gap-4 text-sm bg-muted/30 px-4 py-3 rounded-lg">
        <div className="flex items-center gap-2 text-foreground">
          <Globe className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span>Browsing {displayName}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearExploration}
          className="h-auto py-1.5 px-3 text-muted-foreground hover:text-foreground"
        >
          ← Back
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
      <div className="flex items-center justify-between gap-4 text-sm bg-muted/30 px-4 py-3 rounded-lg">
        <div className="flex items-center gap-2 text-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span>{locationLabel}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onExploreCity}
          className="h-auto py-1.5 px-3 text-muted-foreground hover:text-foreground"
        >
          Browse elsewhere
        </Button>
      </div>
    );
  }

  // No location
  return (
    <div className="flex items-center justify-between gap-4 text-sm bg-muted/30 px-4 py-3 rounded-lg">
      <div className="flex items-center gap-2 text-muted-foreground">
        <MapPinOff className="h-4 w-4 flex-shrink-0" />
        <span>Set your city to see nearby places</span>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRequestLocation}
          disabled={isLoading}
          className="h-auto py-1.5 px-3 min-h-[44px]"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Use my location'
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onExploreCity}
          className="h-auto py-1.5 px-3 min-h-[44px] text-muted-foreground hover:text-foreground"
        >
          Set city
        </Button>
      </div>
    </div>
  );
};

export default LocationContextBanner;
