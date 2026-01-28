import { MapPin, X } from 'lucide-react';
import { type PlaceReference } from '@/lib/trail-blazer-options';
import GooglePlacesAutocomplete from '@/components/ui/google-places-autocomplete';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlaceReferenceSearchProps {
  placeReference?: PlaceReference;
  onPlaceReferenceChange: (reference?: PlaceReference) => void;
  className?: string;
}

const PlaceReferenceSearch = ({
  placeReference,
  onPlaceReferenceChange,
  className,
}: PlaceReferenceSearchProps) => {
  const handlePlaceSelect = (place: {
    place_id: string;
    name: string;
    formatted_address?: string;
    types?: string[];
  }) => {
    onPlaceReferenceChange({
      googlePlaceId: place.place_id,
      placeName: place.name,
      formattedAddress: place.formatted_address,
      placeTypes: place.types,
    });
  };

  const handleClear = () => {
    onPlaceReferenceChange(undefined);
  };

  if (placeReference) {
    return (
      <div className={cn('p-4 bg-muted/30 border border-border rounded-lg', className)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-sm">{placeReference.placeName}</p>
              {placeReference.formattedAddress && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {placeReference.formattedAddress}
                </p>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive shrink-0"
            onClick={handleClear}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <GooglePlacesAutocomplete
        value=""
        onChange={() => {}}
        onPlaceSelect={handlePlaceSelect}
        placeholder="Search for a specific place you'd like to contribute to..."
        types="establishment"
      />
      <p className="text-xs text-muted-foreground">
        Optional. If the place isn't in our directory yet, we'll review it for inclusion.
      </p>
    </div>
  );
};

export default PlaceReferenceSearch;
