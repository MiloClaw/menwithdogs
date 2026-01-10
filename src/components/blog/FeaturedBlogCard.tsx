import { formatDistanceToNow } from "date-fns";
import { ExternalLink, MapPin, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BlogPost } from "@/hooks/useBlogPosts";

interface FeaturedBlogCardProps {
  post: BlogPost;
  onTagClick?: (interestId: string) => void;
}

export const FeaturedBlogCard = ({ post, onTagClick }: FeaturedBlogCardProps) => {
  const formattedDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  
  const locationText = post.city 
    ? `${post.city.name}${post.city.state ? `, ${post.city.state}` : ""}`
    : "";

  const hasImage = !!post.cover_image_url;

  return (
    <article className="group relative overflow-hidden rounded-xl border bg-card">
      {/* Image or gradient background */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden">
        {hasImage ? (
          <img
            src={post.cover_image_url!}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20" />
        )}
        
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
          {/* Location and date */}
          <div className="flex items-center gap-3 text-white/80 text-sm mb-3">
            {locationText && (
              <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider text-xs">
                <MapPin className="h-3.5 w-3.5" />
                {locationText}
              </span>
            )}
            <span className="text-white/60">·</span>
            <span className="font-mono uppercase tracking-wider text-xs">{formattedDate}</span>
          </div>
          
          {/* Title */}
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-bold tracking-tight leading-tight mb-3 text-balance drop-shadow-lg">
            {post.title}
          </h2>
          
          {/* Body preview */}
          {post.body && (
            <p className="text-white/90 text-sm sm:text-base line-clamp-2 max-w-2xl mb-4">
              {post.body}
            </p>
          )}
          
          {/* Tags and CTA */}
          <div className="flex flex-wrap items-center gap-3">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag.interest_id}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0 cursor-pointer backdrop-blur-sm"
                onClick={() => onTagClick?.(tag.interest_id)}
              >
                {tag.interest.label}
              </Badge>
            ))}
            
            {post.external_url && (
              <a 
                href={post.external_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium transition-colors group/link"
              >
                Read more
                <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
