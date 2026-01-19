import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import GooglePlacesAutocomplete from '@/components/ui/google-places-autocomplete';
import { PlaceDetails } from '@/hooks/useGooglePlaces';
import { MapPin, Globe, Navigation, Loader2 } from 'lucide-react';

export type CityPickerMode = 'home' | 'exploration';

interface CityPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCitySelect: (details: PlaceDetails) => void;
  onSkip: () => void;
  onRequestBrowserLocation?: () => void;
  isRequestingLocation?: boolean;
  mode?: CityPickerMode;
}

/**
 * Lightweight modal for city selection.
 * - "home" mode: Sets user's home city (saved to profile)
 * - "exploration" mode: Temporary city exploration (session only)
 * 
 * Features prominent "Use my location" option for immediate value.
 */
const CityPickerModal = ({ 
  open, 
  onOpenChange, 
  onCitySelect,
  onSkip,
  onRequestBrowserLocation,
  isRequestingLocation = false,
  mode = 'home',
}: CityPickerModalProps) => {
  const [cityInput, setCityInput] = useState('');
  
  const isExploration = mode === 'exploration';

  const handlePlaceSelect = (details: PlaceDetails) => {
    onCitySelect(details);
    onOpenChange(false);
  };

  const handleSkip = () => {
    onSkip();
    onOpenChange(false);
  };

  const handleUseLocation = () => {
    if (onRequestBrowserLocation) {
      onRequestBrowserLocation();
      onOpenChange(false);
    }
  };

  const title = isExploration 
    ? 'Explore another city' 
    : 'Where are you exploring?';
  
  const description = isExploration
    ? 'Browse places in a different city without changing your home location.'
    : "We'll use this to show places nearby.";
  
  const skipLabel = isExploration ? 'Cancel' : 'Skip for now';
  
  const IconComponent = isExploration ? Globe : MapPin;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md"
        onPointerDownOutside={(e) => {
          // Prevent dialog close when clicking the portaled autocomplete dropdown
          const target = e.target as HTMLElement;
          if (target.closest('[data-gp-autocomplete-dropdown="true"]')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto">
            <IconComponent className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center font-serif text-xl">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-4">
          {/* Primary action: Use current location */}
          {!isExploration && onRequestBrowserLocation && (
            <>
              <Button
                variant="outline"
                onClick={handleUseLocation}
                disabled={isRequestingLocation}
                className="w-full min-h-[56px] justify-start gap-3 px-4"
              >
                {isRequestingLocation ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <Navigation className="h-5 w-5 text-primary" />
                )}
                <div className="text-left">
                  <p className="font-medium">Use my current location</p>
                  <p className="text-xs text-muted-foreground">Find places nearby</p>
                </div>
              </Button>
              
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-x-0 top-1/2 border-t border-border" />
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs text-muted-foreground">
                    or search a city
                  </span>
                </div>
              </div>
            </>
          )}

          <GooglePlacesAutocomplete
            value={cityInput}
            onChange={setCityInput}
            onPlaceSelect={handlePlaceSelect}
            placeholder="Search a city..."
            types="(cities)"
          />

          <div className="flex flex-col gap-3">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              {skipLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CityPickerModal;
