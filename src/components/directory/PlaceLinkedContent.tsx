import { Calendar, Megaphone, ExternalLink } from 'lucide-react';
import { usePlaceEvents } from '@/hooks/useCityEvents';
import { usePlacePosts, Post } from '@/hooks/usePosts';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface PlaceLinkedContentProps {
  placeId: string;
  placeName: string;
  placeWebsite?: string | null;
}

const formatEventDateTime = (startAt: string, isRecurring: boolean): string => {
  if (isRecurring) {
    const day = format(new Date(startAt), 'EEEE');
    const time = format(new Date(startAt), 'h:mm a');
    return `Every ${day} · ${time}`;
  }
  
  const start = new Date(startAt);
  return format(start, 'EEE MMM d · h:mm a');
};

const PlaceLinkedContent = ({ placeId, placeName, placeWebsite }: PlaceLinkedContentProps) => {
  // Fetch events from the events table
  const { data: events, isLoading: eventsLoading } = usePlaceEvents(placeId);
  // Fetch announcements from posts table (type='announcement' only)
  const { data: posts, isLoading: postsLoading } = usePlacePosts(placeId);
  
  const announcements = (posts || []).filter(p => p.type === 'announcement');
  const hasContent = (events && events.length > 0) || announcements.length > 0;
  
  // Don't render anything if no content
  if (eventsLoading || postsLoading || !hasContent) {
    return null;
  }
  
  return (
    <>
      <Separator />
      <div className="space-y-4">
        {/* Events section */}
        {events && events.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Upcoming at {placeName}</span>
            </div>
            <div className="space-y-3 pl-7">
              {events.map(event => {
                const externalUrl = placeWebsite;
                return (
                  <div key={event.id} className="space-y-1">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm truncate">{event.name}</span>
                      {event.start_at && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatEventDateTime(event.start_at, event.is_recurring)}
                        </span>
                      )}
                    </div>
                    {externalUrl && (
                      <a 
                        href={externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Confirm details
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Announcements section */}
        {announcements.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Updates</span>
            </div>
            <div className="space-y-2 pl-7">
              {announcements.slice(0, 2).map(announcement => {
                const externalUrl = announcement.external_url || placeWebsite;
                return (
                  <div key={announcement.id} className="text-sm">
                    {externalUrl ? (
                      <a 
                        href={externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {announcement.title}
                      </a>
                    ) : (
                      <span>{announcement.title}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PlaceLinkedContent;
