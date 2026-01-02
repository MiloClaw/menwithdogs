import { useState } from 'react';
import { 
  Star, MapPin, Phone, Globe, Navigation, Clock, 
  ChevronLeft, ChevronRight, X 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getAllPhotoUrls, PhotoReference } from '@/lib/google-places-photos';
import { formatDistance } from '@/lib/distance';
import PresenceCountStrip from './PresenceCountStrip';
import PresenceControl from './PresenceControl';
import CoupleTileGrid from './CoupleTileGrid';
import { usePlacePresenceAggregate } from '@/hooks/usePresenceAggregates';
import { FEATURE_FLAGS } from '@/lib/feature-flags';
import type { Json } from '@/integrations/supabase/types';

export interface PlaceDetail {
  id: string;
  name: string;
  primary_category: string;
  city: string | null;
  state: string | null;
  formatted_address: string | null;
  rating: number | null;
  user_ratings_total: number | null;
  price_level: number | null;
  photos: Json | null;
  website_url: string | null;
  google_maps_url: string | null;
  phone_number: string | null;
  opening_hours: Json | null;
  distance?: number;
}

interface PlaceDetailModalProps {
  place: PlaceDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getPhotos = (photos: Json | null): PhotoReference[] => {
  if (!photos || !Array.isArray(photos)) {
    return [];
  }
  return photos as unknown as PhotoReference[];
};

const getPriceIndicator = (priceLevel: number | null): string => {
  if (!priceLevel) return '';
  return '$'.repeat(priceLevel);
};

const getOpeningHours = (hours: Json | null): string[] => {
  if (!hours || typeof hours !== 'object') return [];
  const hoursObj = hours as Record<string, unknown>;
  if (Array.isArray(hoursObj.weekdayDescriptions)) {
    return hoursObj.weekdayDescriptions as string[];
  }
  return [];
};

const PlaceDetailModal = ({ place, open, onOpenChange }: PlaceDetailModalProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const { data: presenceAgg } = usePlacePresenceAggregate(place?.id);

  if (!place) return null;

  const photos = getPhotos(place.photos);
  const photoUrls = getAllPhotoUrls(photos, 800, 600);
  const location = [place.city, place.state].filter(Boolean).join(', ');
  const priceIndicator = getPriceIndicator(place.price_level);
  const openingHours = getOpeningHours(place.opening_hours);

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photoUrls.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photoUrls.length) % photoUrls.length);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Photo Gallery */}
        <div className="relative aspect-[16/9] bg-muted">
          {photoUrls.length > 0 ? (
            <>
              <img
                src={photoUrls[currentPhotoIndex]}
                alt={`${place.name} - Photo ${currentPhotoIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Photo Navigation */}
              {photoUrls.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                    onClick={prevPhoto}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                    onClick={nextPhoto}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  
                  {/* Photo Counter */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                    {currentPhotoIndex + 1} / {photoUrls.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="h-16 w-16 text-muted-foreground/40" />
            </div>
          )}

          {/* Distance Badge */}
          {place.distance !== undefined && (
            <Badge 
              variant="outline" 
              className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm"
            >
              {formatDistance(place.distance)}
            </Badge>
          )}
        </div>

        <div className="p-6 space-y-6">
          <DialogHeader className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Badge variant="secondary" className="mb-2">
                  {place.primary_category}
                </Badge>
                <DialogTitle className="text-2xl">{place.name}</DialogTitle>
              </div>
            </div>
            
            {/* Rating & Price */}
            <div className="flex items-center gap-4 flex-wrap">
              {place.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{place.rating}</span>
                  {place.user_ratings_total && (
                    <span className="text-muted-foreground">
                      ({place.user_ratings_total.toLocaleString()} reviews)
                    </span>
                  )}
                </div>
              )}
              {priceIndicator && (
                <span className="text-muted-foreground font-medium">
                  {priceIndicator}
                </span>
              )}
            </div>
          </DialogHeader>

          {/* Presence Counts */}
          {FEATURE_FLAGS.PRESENCE_ENABLED && presenceAgg && (
            <PresenceCountStrip aggregate={presenceAgg} className="pt-2" />
          )}

          <Separator />

          {/* Contact & Location Info */}
          <div className="space-y-3">
            {(place.formatted_address || location) && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span>{place.formatted_address || location}</span>
              </div>
            )}

            {place.phone_number && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <a 
                  href={`tel:${place.phone_number}`}
                  className="text-primary hover:underline"
                >
                  {place.phone_number}
                </a>
              </div>
            )}

            {place.website_url && (
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <a 
                  href={place.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate"
                >
                  {new URL(place.website_url).hostname}
                </a>
              </div>
            )}

            {place.google_maps_url && (
              <div className="flex items-center gap-3">
                <Navigation className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <a 
                  href={place.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Get directions
                </a>
              </div>
            )}
          </div>

          {/* Opening Hours */}
          {openingHours.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Hours</span>
                </div>
                <div className="grid gap-1 text-sm">
                  {openingHours.map((day, index) => (
                    <div key={index} className="text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Presence Control */}
          {FEATURE_FLAGS.PRESENCE_ENABLED && (
            <>
              <Separator />
              <div className="space-y-3">
                <span className="font-medium">Your status</span>
                <PresenceControl placeId={place.id} />
              </div>
            </>
          )}

          {/* Couple Tiles */}
          {FEATURE_FLAGS.PRESENCE_ENABLED && (
            <>
              <Separator />
              <CoupleTileGrid placeId={place.id} />
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {place.website_url && (
              <Button asChild className="flex-1">
                <a href={place.website_url} target="_blank" rel="noopener noreferrer">
                  Visit Website
                </a>
              </Button>
            )}
            {place.google_maps_url && (
              <Button variant="outline" asChild className="flex-1">
                <a href={place.google_maps_url} target="_blank" rel="noopener noreferrer">
                  Directions
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceDetailModal;
