import { Calendar, MapPin, Clock, Heart, Zap, DollarSign } from 'lucide-react';
import { format, isSameDay, isPast } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistance } from '@/lib/distance';
import PresenceCountStrip from './PresenceCountStrip';
import { useEventPresenceAggregate } from '@/hooks/usePresenceAggregates';
import { useEventFavorites } from '@/hooks/useEventFavorites';
import { FEATURE_FLAGS } from '@/lib/feature-flags';
import { getEventTypeLabel, getCostTypeLabel } from '@/lib/event-taxonomy';
import type { PublicEvent } from '@/hooks/useEventsPublic';

interface DirectoryEventCardProps {
  event: PublicEvent;
  onClick?: () => void;
}

const formatEventDate = (startAt: string, endAt: string | null): string => {
  const start = new Date(startAt);
  const end = endAt ? new Date(endAt) : null;
  
  const dateStr = format(start, 'EEE, MMM d');
  const startTimeStr = format(start, 'h:mm a');
  
  if (end && !isSameDay(start, end)) {
    return `${dateStr} ${startTimeStr} - ${format(end, 'MMM d h:mm a')}`;
  } else if (end) {
    return `${dateStr} · ${startTimeStr} - ${format(end, 'h:mm a')}`;
  }
  
  return `${dateStr} · ${startTimeStr}`;
};

const DirectoryEventCard = ({ event, onClick }: DirectoryEventCardProps) => {
  const { data: presenceAgg } = useEventPresenceAggregate(event.id);
  const { isFavorited, toggleFavorite, isUpdating } = useEventFavorites();
  const location = [event.venue?.city, event.venue?.state].filter(Boolean).join(', ');
  const isPastEvent = isPast(new Date(event.end_at || event.start_at));
  const saved = isFavorited(event.id);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(event.id);
  };

  return (
    <Card 
      className={`overflow-hidden group hover:shadow-lg transition-shadow duration-200 cursor-pointer ${
        isPastEvent ? 'opacity-60' : ''
      }`}
      onClick={onClick}
    >
      {/* Header bar with badges - matching PlaceCard structure */}
      <div className="relative bg-muted/30 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Category badge */}
          <div className="flex flex-wrap gap-1.5 items-center flex-1">
            {event.event_type && (
              <Badge variant="secondary" className="text-xs">
                {getEventTypeLabel(event.event_type)}
              </Badge>
            )}
            {event.social_energy_level && (
              <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Zap className="h-3 w-3" />
                <span>{event.social_energy_level}/5</span>
              </div>
            )}
          </div>
          
          {/* Right: Save + Distance (matching PlaceCard) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveClick}
              disabled={isUpdating}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-background/90 hover:bg-background transition-colors"
              aria-label={saved ? 'Remove from saved' : 'Save event'}
            >
              <Heart 
                className={`h-4 w-4 transition-colors ${saved ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
              />
            </button>
            {event.distance !== undefined && (
              <Badge variant="outline" className="text-xs font-medium">
                {formatDistance(event.distance)}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-2">
        {/* Event Name */}
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {event.name}
        </h3>

        {/* Venue (secondary info - matching PlaceCard location) */}
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{event.venue?.name || location}</span>
        </div>

        {/* Date & Time (tertiary meta) */}
        <div className="flex items-center gap-3 flex-wrap text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="font-medium">
              {formatEventDate(event.start_at, event.end_at)}
            </span>
          </div>
          
          {/* Cost indicator */}
          {event.cost_type && event.cost_type !== 'unknown' && (
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              <span>{getCostTypeLabel(event.cost_type)}</span>
            </div>
          )}
        </div>

        {/* Presence Counts */}
        {FEATURE_FLAGS.PRESENCE_ENABLED && presenceAgg && (
          <PresenceCountStrip aggregate={presenceAgg} compact className="pt-1" />
        )}
      </CardContent>
    </Card>
  );
};

export default DirectoryEventCard;
