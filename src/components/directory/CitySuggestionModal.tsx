import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Building2 } from 'lucide-react';
import { PlaceDetails } from '@/hooks/useGooglePlaces';

interface CitySuggestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cityDetails: PlaceDetails | null;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export const CitySuggestionModal = ({
  open,
  onOpenChange,
  cityDetails,
  onConfirm,
  isSubmitting,
}: CitySuggestionModalProps) => {
  if (!cityDetails) return null;

  const locationParts = [cityDetails.state, cityDetails.country].filter(Boolean);
  const locationString = locationParts.join(', ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Request This City
          </DialogTitle>
          <DialogDescription>
            This looks like a city rather than a venue. Would you like to suggest we add this city to our directory?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-lg">{cityDetails.name}</h3>
            {locationString && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {locationString}
              </p>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Once approved, you'll be able to discover places and events in this city.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Request City'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
