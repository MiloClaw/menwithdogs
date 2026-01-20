import { useOverlapPlaces } from '@/hooks/useOverlapPlaces';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useOverlapSession, SessionLocation } from '@/hooks/useOverlapSession';
import { SessionLocationPicker } from './SessionLocationPicker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, X, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OverlapResultsProps {
  partnerName: string;
  expiresAt: string;
  onEndSession: () => void;
  isEnding: boolean;
}

export function OverlapResults({
  partnerName,
  expiresAt,
  onEndSession,
  isEnding,
}: OverlapResultsProps) {
  const { lat, lng } = useUserLocation();
  const { sessionLocation, updateLocation, isUpdatingLocation, activeSession } = useOverlapSession();
  
  // Use session location if set, otherwise fall back to user location
  const effectiveLat = sessionLocation?.lat ?? lat;
  const effectiveLng = sessionLocation?.lng ?? lng;
  
  const { places, isLoading, sharedCategories } = useOverlapPlaces({
    lat: effectiveLat,
    lng: effectiveLng,
  });

  const topPlaces = places.slice(0, 12);
  const timeRemaining = formatDistanceToNow(new Date(expiresAt), { addSuffix: true });

  const getPhotoUrl = (place: (typeof places)[0]) => {
    if (place.stored_photo_urls?.length) return place.stored_photo_urls[0];
    return null;
  };

  const handleLocationSelect = (location: SessionLocation) => {
    updateLocation(location);
  };

  return (
    <div className="space-y-6">
      {/* Session header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Discovering with {partnerName}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <Clock className="h-3.5 w-3.5" />
            Session expires {timeRemaining}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onEndSession}
          disabled={isEnding}
        >
          {isEnding ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <X className="h-4 w-4 mr-1" />
          )}
          End Session
        </Button>
      </div>

      {/* Location picker */}
      <SessionLocationPicker
        currentLocation={sessionLocation}
        onLocationSelect={handleLocationSelect}
        isUpdating={isUpdatingLocation}
      />

      {/* Shared categories */}
      {sharedCategories.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            You both love:
          </p>
          <div className="flex flex-wrap gap-2">
            {sharedCategories.map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !sessionLocation ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Select a city above to see shared recommendations</p>
        </div>
      ) : topPlaces.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No shared recommendations yet.</p>
          <p className="text-sm mt-1">
            Save more places to discover what you both love!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="font-medium">Places you'll both love</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topPlaces.map((place) => (
              <div
                key={place.id}
                className="rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow"
              >
                {getPhotoUrl(place) && (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={getPhotoUrl(place)!}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4 space-y-1">
                  <h3 className="font-medium line-clamp-1">{place.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {place.primary_category}
                  </p>
                  {place.rating && (
                    <p className="text-sm text-muted-foreground">
                      ⭐ {place.rating.toFixed(1)}
                    </p>
                  )}
                  {place.city && (
                    <p className="text-xs text-muted-foreground">
                      {place.city}
                      {place.state ? `, ${place.state}` : ''}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-center text-muted-foreground pt-4">
        Your preferences stay private — only shared recommendations are shown
      </p>
    </div>
  );
}
