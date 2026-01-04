import { Calendar } from 'lucide-react';
import { usePlaceEvents, Post } from '@/hooks/usePosts';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface PlaceUpcomingEventsProps {
  placeId: string;
  placeName: string;
}

const formatEventDateTime = (startDate: string | null, endDate: string | null): string => {
  if (!startDate) return '';
  
  const start = new Date(startDate);
  return format(start, 'EEE MMM d · h:mm a');
};

const PlaceUpcomingEvents = ({ placeId, placeName }: PlaceUpcomingEventsProps) => {
  const { data: events, isLoading } = usePlaceEvents(placeId);
  
  // Don't render anything if no events (section hidden entirely when empty)
  if (isLoading || !events || events.length === 0) {
    return null;
  }
  
  return (
    <>
      <Separator />
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Upcoming at {placeName}</span>
        </div>
        <div className="space-y-2 pl-7">
          {events.map(event => (
            <div key={event.id} className="flex items-center justify-between gap-4">
              <span className="text-sm truncate">{event.title}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatEventDateTime(event.start_date, event.end_date)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PlaceUpcomingEvents;
