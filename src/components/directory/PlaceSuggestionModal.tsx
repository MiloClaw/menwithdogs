import { MapPin, Star, Loader2, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import type { PlaceDetails } from '@/hooks/useGooglePlaces';

interface PlaceSuggestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeDetails: PlaceDetails | null;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
}

const PlaceSuggestionModal = ({
  open,
  onOpenChange,
  placeDetails,
  onConfirm,
  isSubmitting,
}: PlaceSuggestionModalProps) => {
  const isMobile = useIsMobile();

  if (!placeDetails) return null;

  const content = (
    <div className="space-y-4">
      {/* Place Preview */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
        <h3 className="font-medium text-foreground">{placeDetails.name}</h3>
        
        {placeDetails.formatted_address && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{placeDetails.formatted_address}</span>
          </div>
        )}
        
        {placeDetails.rating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span>{placeDetails.rating} rating</span>
          </div>
        )}
        
        {placeDetails.google_primary_type_display && (
          <span className="inline-block text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
            {placeDetails.google_primary_type_display}
          </span>
        )}
      </div>

      {/* Info Note */}
      <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          Your suggestion will be reviewed by our team before appearing in the directory. 
          We'll add it within a few days if it's a good fit.
        </p>
      </div>
    </div>
  );

  const footer = (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <Button
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting}
        className="flex-1 min-h-[44px]"
      >
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        disabled={isSubmitting}
        className="flex-1 min-h-[44px]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          'Suggest Place'
        )}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Suggest This Place?</DrawerTitle>
            <DrawerDescription>
              Help grow our directory with great spots
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">
            {content}
          </div>
          <DrawerFooter className="pt-0">
            {footer}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Suggest This Place?</DialogTitle>
          <DialogDescription>
            Help grow our directory with great spots
          </DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter className="flex-col sm:flex-row gap-3">
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceSuggestionModal;
