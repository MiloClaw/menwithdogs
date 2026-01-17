import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Building2, ArrowRight, Loader2 } from 'lucide-react';
import { PlaceDetails } from '@/hooks/useGooglePlaces';
import { MetroInfo } from '@/hooks/useCitySuggestion';

interface CitySuggestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cityDetails: PlaceDetails | null;
  onConfirm: () => void;
  isSubmitting: boolean;
  // Metro redirect props
  metroInfo?: MetroInfo | null;
  isCheckingMetro?: boolean;
  onExploreMetro?: () => void;
}

export const CitySuggestionModal = ({
  open,
  onOpenChange,
  cityDetails,
  onConfirm,
  isSubmitting,
  metroInfo,
  isCheckingMetro = false,
  onExploreMetro,
}: CitySuggestionModalProps) => {
  if (!cityDetails) return null;

  const locationParts = [cityDetails.state, cityDetails.country].filter(Boolean);
  const locationString = locationParts.join(', ');

  // If we found a metro match, show the redirect UI
  if (metroInfo?.inMetro && onExploreMetro) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Part of {metroInfo.metroName}
            </DialogTitle>
            <DialogDescription>
              Great news! {cityDetails.name} is part of a metro area we already cover.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">You searched for</p>
                  <p className="font-medium">{cityDetails.name}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 text-right">
                  <p className="text-sm text-muted-foreground">Part of</p>
                  <p className="font-medium text-primary">{metroInfo.metroName}</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              You'll find places across the metro — including spots in {cityDetails.name}.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button onClick={onExploreMetro}>
              Explore {metroInfo.primaryCity || metroInfo.metroName}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Loading state while checking metro
  if (isCheckingMetro) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Checking if {cityDetails.name} is part of a metro we cover...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Default: city suggestion UI (not part of any metro)
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
