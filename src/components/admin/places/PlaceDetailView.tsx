import { useState } from 'react';
import { Star, MapPin, Phone, Globe, Clock, ExternalLink, CalendarPlus, Calendar, Sun, Moon, MessageCircle, Zap, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Place, getOpeningHoursText, getPhotos } from '@/hooks/usePlaces';
import { useEvents } from '@/hooks/useEvents';
import SourceBadge from '../SourceBadge';
import ImmutableFieldBadge from './ImmutableFieldBadge';
import PlacePhotoGallery from './PlacePhotoGallery';
import PlaceEventForm from './PlaceEventForm';
import { getVibeEnergyLabel, getVibeFormalityLabel, hasVibeData } from '@/lib/place-taxonomy';
interface PlaceDetailViewProps {
  place: Place;
  onEdit: () => void;
  onStatusChange: (status: Place['status']) => void;
  isUpdating?: boolean;
}

const statusColors: Record<Place['status'], string> = {
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const PlaceDetailView = ({ place, onEdit, onStatusChange, isUpdating }: PlaceDetailViewProps) => {
  const [showEventForm, setShowEventForm] = useState(false);
  const { events } = useEvents();
  const photos = getPhotos(place.photos);
  const openingHours = getOpeningHoursText(place.opening_hours);
  const isManualEntry = place.google_place_id.startsWith('manual_');
  
  // Filter events for this venue
  const venueEvents = events.filter(e => e.venue_place_id === place.id);
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-semibold truncate">{place.name}</h2>
            <Badge className={statusColors[place.status]}>{place.status}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SourceBadge source={place.source} />
            {place.google_primary_type_display && (
              <>
                <span>•</span>
                <span>{place.google_primary_type_display}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowEventForm(true)} variant="outline" size="sm">
            <CalendarPlus className="h-4 w-4 mr-1" />
            Add Event
          </Button>
          <Button onClick={onEdit} variant="outline" size="sm">
            Edit
          </Button>
        </div>
      </div>

      <PlaceEventForm place={place} open={showEventForm} onOpenChange={setShowEventForm} />

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Photo Gallery */}
        {photos.length > 0 && (
          <PlacePhotoGallery photos={photos} placeName={place.name} />
        )}

        {/* Quick Actions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <div className="flex gap-2">
              <Button
                variant={place.status === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onStatusChange('approved')}
                disabled={isUpdating || place.status === 'approved'}
              >
                Approve
              </Button>
              <Button
                variant={place.status === 'pending' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => onStatusChange('pending')}
                disabled={isUpdating || place.status === 'pending'}
              >
                Pending
              </Button>
              <Button
                variant={place.status === 'rejected' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => onStatusChange('rejected')}
                disabled={isUpdating || place.status === 'rejected'}
              >
                Reject
              </Button>
            </div>
          </div>
          {place.status === 'approved' && place.approved_at && (
            <p className="text-xs text-muted-foreground">
              Approved on {format(new Date(place.approved_at), 'MMM d, yyyy \'at\' h:mm a')}
            </p>
          )}
        </div>

        {/* Venue Events */}
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events at this Venue ({venueEvents.length})
          </h3>
          {venueEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events scheduled.</p>
          ) : (
            <div className="space-y-2">
              {venueEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-2 rounded-md border bg-background"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{event.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.start_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <Badge
                    variant={event.status === 'approved' ? 'default' : 'secondary'}
                    className="ml-2 shrink-0"
                  >
                    {event.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Editorial Vibe Tags */}
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Editorial Vibe Tags
          </h3>
          {hasVibeData(place) ? (
            <div className="space-y-3">
              {/* Energy & Formality */}
              <div className="flex flex-wrap gap-2">
                {place.vibe_energy !== null && (
                  <Badge variant="outline" className="gap-1">
                    <Zap className="h-3 w-3" />
                    Energy: {getVibeEnergyLabel(place.vibe_energy)}
                  </Badge>
                )}
                {place.vibe_formality !== null && (
                  <Badge variant="outline" className="gap-1">
                    Formality: {getVibeFormalityLabel(place.vibe_formality)}
                  </Badge>
                )}
              </div>
              {/* Boolean vibes */}
              <div className="flex flex-wrap gap-2">
                {place.vibe_conversation && (
                  <Badge variant="secondary" className="gap-1">
                    <MessageCircle className="h-3 w-3" />
                    Conversation-friendly
                  </Badge>
                )}
                {place.vibe_daytime && (
                  <Badge variant="secondary" className="gap-1">
                    <Sun className="h-3 w-3" />
                    Daytime
                  </Badge>
                )}
                {place.vibe_evening && (
                  <Badge variant="secondary" className="gap-1">
                    <Moon className="h-3 w-3" />
                    Evening
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No vibe tags set. Edit to add editorial curation.
            </p>
          )}
        </div>

        <Separator />

        {/* Categories */}
        <div>
          <h3 className="text-sm font-medium mb-2">Categories</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{place.primary_category}</Badge>
            {place.secondary_categories?.map((cat) => (
              <Badge key={cat} variant="outline">{cat}</Badge>
            ))}
          </div>
        </div>

        {/* Google Data Section */}
        <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Google Places Data</h3>
            {!isManualEntry && <ImmutableFieldBadge />}
          </div>

          {/* Rating */}
          {place.rating && (
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{place.rating}</span>
              {place.user_ratings_total && (
                <span className="text-sm text-muted-foreground">
                  ({place.user_ratings_total.toLocaleString()} reviews)
                </span>
              )}
              {place.price_level && (
                <span className="text-muted-foreground ml-2">
                  {'$'.repeat(place.price_level)}
                </span>
              )}
            </div>
          )}

          {/* Address */}
          {place.formatted_address && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm">{place.formatted_address}</p>
                {place.google_maps_url && (
                  <a
                    href={place.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    View on Google Maps
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="flex flex-wrap gap-4">
            {place.phone_number && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{place.phone_number}</span>
              </div>
            )}
            {place.website_url && (
              <a
                href={place.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
          </div>

          {/* Opening Hours */}
          {openingHours.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Hours</span>
              </div>
              <div className="grid gap-1 text-sm text-muted-foreground pl-6">
                {openingHours.map((day, i) => (
                  <p key={i}>{day}</p>
                ))}
              </div>
            </div>
          )}

          {/* Coordinates */}
          {place.lat && place.lng && (
            <div className="text-xs text-muted-foreground">
              Coordinates: {place.lat.toFixed(6)}, {place.lng.toFixed(6)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailView;
