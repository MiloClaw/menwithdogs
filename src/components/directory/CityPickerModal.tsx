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
import { MapPin, X } from 'lucide-react';

interface CityPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCitySelect: (details: PlaceDetails) => void;
  onSkip: () => void;
}

/**
 * Lightweight modal for optional city selection on first visit to /places.
 * "We'll use this to show places nearby."
 * Skippable - falls back to browser geolocation.
 */
const CityPickerModal = ({ 
  open, 
  onOpenChange, 
  onCitySelect,
  onSkip,
}: CityPickerModalProps) => {
  const [cityInput, setCityInput] = useState('');

  const handlePlaceSelect = (details: PlaceDetails) => {
    onCitySelect(details);
    onOpenChange(false);
  };

  const handleSkip = () => {
    onSkip();
    onOpenChange(false);
  };

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
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center font-serif text-xl">
            Where are you exploring?
          </DialogTitle>
          <DialogDescription className="text-center">
            We'll use this to show places nearby.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <GooglePlacesAutocomplete
            value={cityInput}
            onChange={setCityInput}
            onPlaceSelect={handlePlaceSelect}
            placeholder="Search your city..."
            types="(cities)"
          />

          <div className="flex flex-col gap-3">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CityPickerModal;
