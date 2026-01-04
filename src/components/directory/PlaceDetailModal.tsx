import { useState, useEffect, useMemo } from 'react';
import { 
  Star, MapPin, Phone, Globe, Navigation, Clock, 
  ChevronLeft, ChevronRight, Heart, ChevronDown
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { usePlacePhotos, PhotoReference } from '@/hooks/usePlacePhotos';
import { formatDistance } from '@/lib/distance';
import PresenceCountStrip from './PresenceCountStrip';
import PresenceControl from './PresenceControl';
import { usePlacePresenceAggregate } from '@/hooks/usePresenceAggregates';
import { usePlaceFavorites } from '@/hooks/usePlaceFavorites';
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

interface OpeningHoursParsed {
  weekdayDescriptions: string[];
  openNow?: boolean;
}

const getOpeningHours = (hours: Json | null): OpeningHoursParsed => {
  if (!hours || typeof hours !== 'object') return { weekdayDescriptions: [] };
  const hoursObj = hours as Record<string, unknown>;
  return {
    weekdayDescriptions: Array.isArray(hoursObj.weekdayDescriptions) 
      ? hoursObj.weekdayDescriptions as string[]
      : [],
    openNow: typeof hoursObj.openNow === 'boolean' ? hoursObj.openNow : undefined,
  };
};

const PlaceDetailModal = ({ place, open, onOpenChange }: PlaceDetailModalProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [hoursExpanded, setHoursExpanded] = useState(false);
  const { data: presenceAgg } = usePlacePresenceAggregate(place?.id);
  const { isFavorited, toggleFavorite, isUpdating } = usePlaceFavorites();

  const photos = getPhotos(place?.photos ?? null);
  const { photoUrls, isLoading: photosLoading } = usePlacePhotos(photos, { 
    maxWidth: 800, 
    maxHeight: 600,
    maxPhotos: 5 
  });

  // Reset photo index when place changes
  useEffect(() => {
    setCurrentPhotoIndex(0);
    setHoursExpanded(false);
  }, [place?.id]);

  const openingHoursData = useMemo(() => 
    getOpeningHours(place?.opening_hours ?? null), 
    [place?.opening_hours]
  );

  if (!place) return null;

  const location = [place.city, place.state].filter(Boolean).join(', ');
  const priceIndicator = getPriceIndicator(place.price_level);
  const saved = isFavorited(place.id);
  const validPhotoUrls = photoUrls.filter((url): url is string => url !== null);

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % validPhotoUrls.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + validPhotoUrls.length) % validPhotoUrls.length);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Photo Gallery */}
        <div className="relative aspect-[16/9] bg-muted">
          {photosLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            </div>
          ) : validPhotoUrls.length > 0 ? (
            <>
              <img
                src={validPhotoUrls[currentPhotoIndex]}
                alt={`${place.name} - Photo ${currentPhotoIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Photo Navigation */}
              {validPhotoUrls.length > 1 && (
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
                    {currentPhotoIndex + 1} / {validPhotoUrls.length}
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
              <div className="space-y-1 flex-1">
                <Badge variant="secondary" className="mb-2">
                  {place.primary_category}
                </Badge>
                <DialogTitle className="text-2xl">{place.name}</DialogTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleFavorite(place.id)}
                disabled={isUpdating}
                className="flex-shrink-0"
              >
                <Heart 
                  className={`h-6 w-6 transition-colors ${
                    saved ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'
                  }`} 
                />
              </Button>
            </div>
            
            {/* Rating, Price & Open Status */}
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
              {openingHoursData.openNow !== undefined && (
                <Badge 
                  variant="outline" 
                  className={openingHoursData.openNow 
                    ? 'border-emerald-500/50 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' 
                    : 'border-muted text-muted-foreground'
                  }
                >
                  {openingHoursData.openNow ? 'Open now' : 'Closed'}
                </Badge>
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

          {/* Opening Hours - Collapsible */}
          {openingHoursData.weekdayDescriptions.length > 0 && (
            <>
              <Separator />
              <Collapsible open={hoursExpanded} onOpenChange={setHoursExpanded}>
                <CollapsibleTrigger className="flex items-center justify-between w-full group">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Hours</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${hoursExpanded ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  <div className="grid gap-1 text-sm pl-7">
                    {openingHoursData.weekdayDescriptions.map((day, index) => (
                      <div key={index} className="text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
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


          {/* Action Buttons - Sticky on mobile */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 sticky bottom-0 bg-background pb-1">
            {place.website_url && (
              <Button asChild className="flex-1 min-h-[48px]">
                <a href={place.website_url} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-2" />
                  Visit Website
                </a>
              </Button>
            )}
            {place.google_maps_url && (
              <Button variant="outline" asChild className="flex-1 min-h-[48px]">
                <a href={place.google_maps_url} target="_blank" rel="noopener noreferrer">
                  <Navigation className="h-4 w-4 mr-2" />
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