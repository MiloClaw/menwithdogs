import { Calendar, Megaphone, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCityPostsByName, Post } from '@/hooks/usePosts';
import { format } from 'date-fns';

interface WhatsHappeningProps {
  cityName: string | null;
  state: string | null;
}

const formatEventDate = (startDate: string | null, endDate: string | null): string => {
  if (!startDate) return '';
  
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  
  const dateStr = format(start, 'EEE MMM d');
  const timeStr = format(start, 'h:mm a');
  
  if (end && start.toDateString() === end.toDateString()) {
    return `${dateStr} · ${timeStr}`;
  }
  
  return `${dateStr} · ${timeStr}`;
};

const PostItem = ({ post }: { post: Post }) => {
  const isEvent = post.type === 'event';
  
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 border-b border-border last:border-0">
      <div className={`p-2 rounded-lg ${isEvent ? 'bg-accent/10' : 'bg-primary/10'}`}>
        {isEvent ? (
          <Calendar className="h-4 w-4 text-accent" />
        ) : (
          <Megaphone className="h-4 w-4 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <Badge variant="outline" className="text-xs">
            {isEvent ? 'Event' : 'Update'}
          </Badge>
          {isEvent && post.start_date && (
            <span className="text-xs text-muted-foreground">
              {formatEventDate(post.start_date, post.end_date)}
            </span>
          )}
        </div>
        <h4 className="font-medium text-sm truncate">{post.title}</h4>
        {isEvent && post.place && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            @ {post.place.name}
          </p>
        )}
        {post.body && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {post.body}
          </p>
        )}
      </div>
    </div>
  );
};

const WhatsHappening = ({ cityName, state }: WhatsHappeningProps) => {
  const { data: posts, isLoading } = useCityPostsByName(cityName, state);
  
  // Don't render anything if no posts (silence is acceptable)
  if (isLoading || !posts || posts.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-medium">
          What's happening in {cityName}
        </h3>
      </div>
      <div className="divide-y divide-border">
        {posts.map(post => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default WhatsHappening;
