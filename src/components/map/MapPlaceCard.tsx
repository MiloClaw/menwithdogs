import { Star, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DirectoryPlace } from '@/components/directory/DirectoryPlaceCard';

interface MapPlaceCardProps {
  place: DirectoryPlace;
  isHighlighted: boolean;
  onClick: () => void;
}

const formatDistance = (miles: number | undefined): string => {
  if (!miles) return '';
  if (miles < 0.1) return 'Nearby';
  if (miles < 1) return `${(miles * 5280).toFixed(0)} ft`;
  return `${miles.toFixed(1)} mi`;
};

const getPriceIndicator = (priceLevel: number | null): string => {
  if (!priceLevel) return '';
  return '$'.repeat(priceLevel);
};

export function MapPlaceCard({ place, isHighlighted, onClick }: MapPlaceCardProps) {
  const photoUrl = place.stored_photo_urls?.[0] || '/placeholder.svg';
  const distance = formatDistance(place.distance);
  const price = getPriceIndicator(place.price_level);
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all",
        "hover:bg-accent/50 active:bg-accent",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isHighlighted && "bg-accent ring-2 ring-primary"
      )}
    >
      {/* Photo */}
      <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
        <img
          src={photoUrl}
          alt={place.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {distance && (
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[10px] font-medium bg-background/90 backdrop-blur-sm rounded">
            {distance}
          </span>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Name */}
        <h4 className="font-medium text-sm leading-tight truncate">
          {place.name}
        </h4>
        
        {/* Category */}
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {place.primary_category}
        </p>
        
        {/* Location */}
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">
            {place.city}{place.state ? `, ${place.state}` : ''}
          </span>
        </div>
        
        {/* Rating & Price */}
        {(place.rating || price) && (
          <div className="flex items-center gap-2 mt-1.5">
            {place.rating && (
              <div className="flex items-center gap-1 text-xs">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{place.rating.toFixed(1)}</span>
                {place.user_ratings_total && (
                  <span className="text-muted-foreground">
                    ({place.user_ratings_total > 999 
                      ? `${(place.user_ratings_total / 1000).toFixed(1)}k` 
                      : place.user_ratings_total})
                  </span>
                )}
              </div>
            )}
            {price && (
              <span className="text-xs text-muted-foreground">{price}</span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
