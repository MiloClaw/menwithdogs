import { Calendar, MapPin, Clock } from 'lucide-react';
import { format, isSameDay, isPast } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistance } from '@/lib/distance';
import PresenceCountStrip from './PresenceCountStrip';
import { useEventPresenceAggregate } from '@/hooks/usePresenceAggregates';
import { FEATURE_FLAGS } from '@/lib/feature-flags';
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
  const location = [event.venue?.city, event.venue?.state].filter(Boolean).join(', ');
  const isPastEvent = isPast(new Date(event.end_at || event.start_at));

  return (
    <Card 
      className={`overflow-hidden group hover:shadow-lg transition-shadow duration-200 cursor-pointer ${
        isPastEvent ? 'opacity-60' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Category Tags */}
        {event.category_tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.category_tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

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
