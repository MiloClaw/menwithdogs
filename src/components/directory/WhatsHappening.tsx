import { Calendar, Megaphone, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCityEvents, CityEvent } from '@/hooks/useCityEvents';
import { useCityPostsByName, Post } from '@/hooks/usePosts';
import { format } from 'date-fns';

interface WhatsHappeningProps {
  cityName: string | null;
  state: string | null;
}

const formatEventDate = (event: CityEvent): string => {
  if (event.is_recurring) {
    // For recurring events, show a friendly pattern
    if (event.start_at) {
      const day = format(new Date(event.start_at), 'EEEE');
      const time = format(new Date(event.start_at), 'h:mm a');
      return `Every ${day} · ${time}`;
    }
    return 'Recurring';
  }
  
  if (!event.start_at) return '';
  
  const start = new Date(event.start_at);
  const dateStr = format(start, 'EEE MMM d');
  const timeStr = format(start, 'h:mm a');
  
  return `${dateStr} · ${timeStr}`;
};

const formatAnnouncementDate = (post: Post): string => {
  if (post.is_recurring && post.recurrence_text) {
    return post.recurrence_text;
  }
  return '';
};

const EventItem = ({ event }: { event: CityEvent }) => {
  const externalUrl = event.venue?.website_url;
  
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 border-b border-border last:border-0">
      <div className="p-2 rounded-lg bg-accent/10">
        <Calendar className="h-4 w-4 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <Badge variant="outline" className="text-xs">
            {event.is_recurring ? 'Recurring' : 'Event'}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatEventDate(event)}
          </span>
        </div>
        <h4 className="font-medium text-sm truncate">{event.name}</h4>
        {event.venue && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            @ {event.venue.name}
          </p>
        )}
        {event.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {event.description}
          </p>
        )}
        {externalUrl && (
          <a 
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1.5"
          >
            <ExternalLink className="h-3 w-3" />
            Visit website for details
          </a>
        )}
      </div>
    </div>
  );
};

const AnnouncementItem = ({ post }: { post: Post }) => {
  const externalUrl = post.external_url || post.place?.website_url;
  
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 border-b border-border last:border-0">
      <div className="p-2 rounded-lg bg-primary/10">
        <Megaphone className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <Badge variant="outline" className="text-xs">Update</Badge>
          {post.is_recurring && post.recurrence_text && (
            <span className="text-xs text-muted-foreground">
              {formatAnnouncementDate(post)}
            </span>
          )}
        </div>
        <h4 className="font-medium text-sm truncate">{post.title}</h4>
        {post.body && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {post.body}
          </p>
        )}
        {externalUrl && (
          <a 
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1.5"
          >
            <ExternalLink className="h-3 w-3" />
            Learn more
          </a>
        )}
      </div>
    </div>
  );
};

const WhatsHappening = ({ cityName, state }: WhatsHappeningProps) => {
  // Fetch events from events table
  const { data: events, isLoading: eventsLoading } = useCityEvents(cityName, state);
  // Fetch announcements from posts table (type='announcement' only now)
  const { data: posts, isLoading: postsLoading } = useCityPostsByName(cityName, state);
  
  const announcements = (posts || []).filter(p => p.type === 'announcement');
  const hasContent = (events && events.length > 0) || announcements.length > 0;
  
  // Don't render anything if no content (silence is acceptable)
  if (eventsLoading || postsLoading || !hasContent) {
    return null;
  }
  
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-medium">
          What's happening in {cityName}
        </h3>
      </div>
      <div>
        {/* Events first */}
        {events && events.map(event => (
          <EventItem key={event.id} event={event} />
        ))}
        {/* Then announcements */}
        {announcements.map(post => (
          <AnnouncementItem key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default WhatsHappening;
