import { formatDistanceToNow } from "date-fns";
import { ExternalLink, MapPin, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BlogPost } from "@/hooks/useBlogPosts";

interface BlogPostCardProps {
  post: BlogPost;
  onTagClick?: (interestId: string) => void;
}

export const BlogPostCard = ({ post, onTagClick }: BlogPostCardProps) => {
  const formattedDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  
  const locationText = post.city 
    ? `${post.city.name}${post.city.state ? `, ${post.city.state}` : ""}`
    : "";

  const hasImage = !!post.cover_image_url;

  // Image card variant
  if (hasImage) {
    return (
      <article className="group overflow-hidden rounded-xl border bg-card hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative sm:w-48 lg:w-56 flex-shrink-0 overflow-hidden">
            <div className="aspect-video sm:aspect-square h-full">
              <img
                src={post.cover_image_url!}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
            <div>
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
                {locationText && (
                  <span className="flex items-center gap-1 font-mono uppercase tracking-wider">
                    <MapPin className="h-3 w-3" />
                    {locationText}
                  </span>
                )}
                <span>·</span>
                <span className="font-mono uppercase tracking-wider">{formattedDate}</span>
              </div>
              
              {/* Title */}
              <h3 className="font-serif text-lg font-semibold leading-snug tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              
              {/* Body */}
              {post.body && (
                <p className="text-muted-foreground text-sm line-clamp-2 mt-2">
                  {post.body}
                </p>
              )}
            </div>
            
            {/* Footer */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {post.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag.interest_id}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-secondary/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagClick?.(tag.interest_id);
                  }}
                >
                  {tag.interest.label}
                </Badge>
              ))}
              
              {post.external_url && (
                <a 
                  href={post.external_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-auto flex items-center gap-1.5 text-xs text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Read more
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Text-only quote-style variant
  return (
    <article className="group overflow-hidden rounded-xl border bg-card hover:shadow-lg transition-all duration-300 p-6 relative">
      {/* Decorative quote mark */}
      <Quote className="absolute top-4 right-4 h-12 w-12 text-muted/20 rotate-180" />
      
      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
        {locationText && (
          <span className="flex items-center gap-1 font-mono uppercase tracking-wider">
            <MapPin className="h-3 w-3" />
            {locationText}
          </span>
        )}
        <span>·</span>
        <span className="font-mono uppercase tracking-wider">{formattedDate}</span>
      </div>
      
      {/* Title */}
      <h3 className="font-serif text-xl font-semibold leading-snug tracking-tight line-clamp-2 group-hover:text-primary transition-colors pr-12">
        {post.title}
      </h3>
      
      {/* Body */}
      {post.body && (
        <p className="text-muted-foreground text-sm line-clamp-3 mt-3 leading-relaxed">
          {post.body}
        </p>
      )}
      
      {/* Place Badge */}
      {post.place && (
        <Badge variant="outline" className="text-xs mt-3">
          📍 {post.place.name}
        </Badge>
      )}
      
      {/* Footer */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
        {post.tags.slice(0, 3).map((tag) => (
          <Badge
            key={tag.interest_id}
            variant="secondary"
            className="text-xs cursor-pointer hover:bg-secondary/80"
            onClick={(e) => {
              e.stopPropagation();
              onTagClick?.(tag.interest_id);
            }}
          >
            {tag.interest.label}
          </Badge>
        ))}
        
        {post.external_url && (
          <a 
            href={post.external_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 text-xs text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Learn more
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </article>
  );
};
