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
      <CardContent className="p-4 space-y-3">
        {/* Header: Type Badge + Energy + Save Button */}
        <div className="flex items-start justify-between gap-2">
          {/* Event Type & Energy */}
          <div className="flex flex-wrap gap-1.5 flex-1 items-center">
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
            {event.cost_type && event.cost_type !== 'unknown' && (
              <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                <span>{getCostTypeLabel(event.cost_type)}</span>
              </div>
            )}
          </div>
          
          {/* Save Button */}
          <button
            onClick={handleSaveClick}
            disabled={isUpdating}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors flex-shrink-0"
            aria-label={saved ? 'Remove from saved' : 'Save event'}
          >
            <Heart 
              className={`h-4 w-4 transition-colors ${saved ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
            />
          </button>
        </div>

        {/* Event Name */}
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {event.name}
        </h3>

        {/* Date & Time */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="font-medium">
            {formatEventDate(event.start_at, event.end_at)}
          </span>
        </div>

        {/* Venue */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{event.venue?.name}</p>
            {location && <p className="truncate">{location}</p>}
          </div>
        </div>

        {/* Distance */}
        {event.distance !== undefined && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{formatDistance(event.distance)} away</span>
          </div>
        )}

        {/* Presence Counts */}
        {FEATURE_FLAGS.PRESENCE_ENABLED && presenceAgg && (
          <PresenceCountStrip aggregate={presenceAgg} compact className="pt-1" />
        )}
      </CardContent>
    </Card>
  );
};

export default DirectoryEventCard;
