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
import { MapPin, Globe } from 'lucide-react';

export type CityPickerMode = 'home' | 'exploration';

interface CityPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCitySelect: (details: PlaceDetails) => void;
  onSkip: () => void;
  mode?: CityPickerMode;
}

/**
 * Lightweight modal for city selection.
 * - "home" mode: Sets user's home city (saved to profile)
 * - "exploration" mode: Temporary city exploration (session only)
 */
const CityPickerModal = ({ 
  open, 
  onOpenChange, 
  onCitySelect,
  onSkip,
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

        <div className="space-y-6 pt-4">
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
