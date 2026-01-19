import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, X, Loader2, Sparkles, ArrowRight, Star } from 'lucide-react';
import { useOverlapPlaces } from '@/hooks/useOverlapPlaces';
import { useUserLocation } from '@/hooks/useUserLocation';
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
  isEnding 
}: OverlapResultsProps) {
  const navigate = useNavigate();
  const { lat, lng } = useUserLocation();
  
  const { 
    places, 
    isLoading, 
    sharedCategories 
  } = useOverlapPlaces({ lat, lng });

  const expiresDate = new Date(expiresAt);
  const timeRemaining = formatDistanceToNow(expiresDate, { addSuffix: true });

  // Take top 12 places for preview
  const topPlaces = places?.slice(0, 12) || [];

  // Helper to get photo URL
  const getPhotoUrl = (place: typeof topPlaces[0]) => {
    if (place.stored_photo_urls?.length) {
      return place.stored_photo_urls[0];
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Discovering with {partnerName}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                Expires {timeRemaining}
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onEndSession}
              disabled={isEnding}
              className="text-muted-foreground hover:text-destructive"
            >
              {isEnding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {sharedCategories.length > 0 && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-2">You both enjoy:</p>
            <div className="flex flex-wrap gap-2">
              {sharedCategories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Places for both of you</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/places')}
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : topPlaces.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No shared places yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Save some places and build your preferences to see recommendations that work for both of you.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPlaces.map((place) => {
              const photoUrl = getPhotoUrl(place);
              return (
                <Card key={place.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  {/* Photo */}
                  <div className="aspect-[4/3] bg-muted relative">
                    {photoUrl ? (
                      <img 
                        src={photoUrl} 
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <Badge className="absolute top-2 left-2 text-xs">
                      {place.primary_category}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-3">
                    <h3 className="font-medium truncate">{place.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      {place.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {place.rating.toFixed(1)}
                        </span>
                      )}
                      {place.city && (
                        <span className="truncate">
                          {place.city}{place.state ? `, ${place.state}` : ''}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
