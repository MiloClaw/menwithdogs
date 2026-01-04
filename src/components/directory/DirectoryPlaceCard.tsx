import { Star, MapPin, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistance } from '@/lib/distance';
import { usePlaceFavorites } from '@/hooks/usePlaceFavorites';
import { usePlacePhotos, PhotoReference } from '@/hooks/usePlacePhotos';
import type { Json } from '@/integrations/supabase/types';

export interface DirectoryPlace {
  id: string;
  google_place_id: string;
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
  lat: number | null;
  lng: number | null;
  distance?: number;
}

interface DirectoryPlaceCardProps {
  place: DirectoryPlace;
  onClick?: () => void;
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

const DirectoryPlaceCard = ({ place, onClick }: DirectoryPlaceCardProps) => {
  const { isFavorited, toggleFavorite, isUpdating } = usePlaceFavorites();
  const photos = getPhotos(place.photos);
  const { photoUrls, isLoading: isLoadingPhoto } = usePlacePhotos(photos, { 
    maxWidth: 600, 
    maxHeight: 400, 
    maxPhotos: 1 
  });
  const photoUrl = photoUrls[0] || null;
  const location = [place.city, place.state].filter(Boolean).join(', ');
  const priceIndicator = getPriceIndicator(place.price_level);
  const saved = isFavorited(place.id);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(place.id);
  };

  return (
    <Card 
      className="overflow-hidden group hover:shadow-lg hover:border-primary/20 transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      {/* Photo Section */}
      <div className="aspect-[4/3] relative bg-muted overflow-hidden">
        {isLoadingPhoto ? (
          <Skeleton className="w-full h-full" />
        ) : photoUrl ? (
          <img
            src={photoUrl}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <MapPin className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        
        {/* Category Badge */}
        <Badge 
          variant="secondary" 
          className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-xs"
        >
          {place.primary_category}
        </Badge>

        {/* Save & Distance Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={handleSaveClick}
            disabled={isUpdating}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-colors"
            aria-label={saved ? 'Remove from saved' : 'Save place'}
          >
            <Heart 
              className={`h-4 w-4 transition-colors ${saved ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
            />
          </button>
          {place.distance !== undefined && (
            <Badge 
              variant="outline" 
              className="bg-background/90 backdrop-blur-sm text-xs font-medium"
            >
              {formatDistance(place.distance)}
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4 space-y-2">
        {/* Name */}
        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
          {place.name}
        </h3>

        {/* Location */}
        {location && (
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}

        {/* Rating & Price Row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Rating */}
          {place.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-sm">{place.rating}</span>
              {place.user_ratings_total && (
                <span className="text-muted-foreground text-sm">
                  ({place.user_ratings_total.toLocaleString()})
                </span>
              )}
            </div>
          )}

          {/* Price Level */}
          {priceIndicator && (
            <span className="text-sm text-muted-foreground font-medium">
              {priceIndicator}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DirectoryPlaceCard;