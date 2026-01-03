import { format } from 'date-fns';
import { 
  Calendar, MapPin, Navigation, Heart
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
import { formatDistance } from '@/lib/distance';
import PresenceCountStrip from './PresenceCountStrip';
import PresenceControl from './PresenceControl';
import CoupleTileGrid from './CoupleTileGrid';
import { useEventPresenceAggregate } from '@/hooks/usePresenceAggregates';
import { useEventFavorites } from '@/hooks/useEventFavorites';
import { FEATURE_FLAGS } from '@/lib/feature-flags';
import type { PublicEvent } from '@/hooks/useEventsPublic';

interface EventDetailModalProps {
  event: PublicEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatEventDateTime = (startAt: string, endAt: string | null): string => {
  const start = new Date(startAt);
  const dateStr = format(start, 'EEEE, MMMM d, yyyy');
  const startTimeStr = format(start, 'h:mm a');
  
  if (endAt) {
    const end = new Date(endAt);
    return `${dateStr} · ${startTimeStr} - ${format(end, 'h:mm a')}`;
  }
  
  return `${dateStr} · ${startTimeStr}`;
};

const EventDetailModal = ({ event, open, onOpenChange }: EventDetailModalProps) => {
  const { data: presenceAgg } = useEventPresenceAggregate(event?.id);
  const { isFavorited, toggleFavorite, isUpdating } = useEventFavorites();
  
  if (!event) return null;

  const location = [event.venue?.city, event.venue?.state].filter(Boolean).join(', ');
  const eventEndTime = event.end_at ? new Date(event.end_at) : undefined;
  const saved = isFavorited(event.id);
  
  // Build Google Maps URL for venue
  const mapsUrl = event.venue?.formatted_address 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue.formatted_address)}`
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-4">
              {/* Category Tags */}
              {event.category_tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {event.category_tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <DialogTitle className="text-2xl">{event.name}</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavorite(event.id)}
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
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Future: AI-generated relevance text */}
          {/* <p className="text-sm text-muted-foreground italic">Why this may be relevant to you...</p> */}

          {/* Presence Counts */}
          {FEATURE_FLAGS.PRESENCE_ENABLED && presenceAgg && (
            <PresenceCountStrip aggregate={presenceAgg} />
          )}

          <Separator />

          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{formatEventDateTime(event.start_at, event.end_at)}</p>
            </div>
          </div>

          {/* Venue */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{event.venue?.name}</p>
              {event.venue?.formatted_address && (
                <p className="text-sm text-muted-foreground">{event.venue.formatted_address}</p>
              )}
              {location && !event.venue?.formatted_address && (
                <p className="text-sm text-muted-foreground">{location}</p>
              )}
            </div>
          </div>

          {/* Distance */}
          {event.distance !== undefined && (
            <div className="flex items-center gap-3">
              <Navigation className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span>{formatDistance(event.distance)} from you</span>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">About this event</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
              </div>
            </>
          )}

          {/* Presence Control */}
          {FEATURE_FLAGS.PRESENCE_ENABLED && (
            <>
              <Separator />
              <div className="space-y-3">
                <span className="font-medium">Your status</span>
                <PresenceControl 
                  eventId={event.id} 
                  eventEndTime={eventEndTime}
                />
              </div>
            </>
          )}

          {/* Couple Tiles */}
          {FEATURE_FLAGS.PRESENCE_ENABLED && (
            <>
              <Separator />
              <CoupleTileGrid eventId={event.id} />
            </>
          )}

          {/* Action Buttons */}
          {mapsUrl && (
            <div className="pt-2">
              <Button variant="outline" asChild className="w-full">
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailModal;
