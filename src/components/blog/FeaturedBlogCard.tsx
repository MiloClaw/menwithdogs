import { ExternalLink, MapPin } from "lucide-react";
import { format } from "date-fns";
import type { BlogPost } from "@/hooks/useBlogPosts";

interface FeaturedBlogCardProps {
  post: BlogPost;
  onTagClick?: (interestId: string) => void;
  onClick?: () => void;
}

export const FeaturedBlogCard = ({ post, onTagClick, onClick }: FeaturedBlogCardProps) => {
  const hasImage = !!post.cover_image_url;
  const tags = post.tags?.slice(0, 2) || [];
  const primaryTag = tags[0];
  
  // Calculate reading time (rough estimate: 200 words per minute)
  const wordCount = (post.body || "").split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Format date as "January 10, 2026"
  const formattedDate = post.created_at 
    ? format(new Date(post.created_at), "MMMM d, yyyy")
    : null;

  return (
    <article 
      className="group relative overflow-hidden rounded-xl cursor-pointer"
      onClick={onClick}
    >
      {/* Background Image or Gradient */}
      <div 
        className="aspect-[3/2] sm:aspect-[2/1] lg:aspect-[21/9] bg-cover bg-center relative"
        style={{
          backgroundImage: hasImage 
            ? `url(${post.cover_image_url})`
            : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.7) 100%)'
        }}
      >
        {/* Gradient Overlay - Lighter and more sophisticated */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-10">
          {/* Category Label */}
          {primaryTag && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTagClick?.(primaryTag.interest_id);
              }}
              className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-accent font-semibold mb-3 text-left hover:text-accent/80 transition-colors"
            >
              {primaryTag.interest?.label}
            </button>
          )}
          
          {/* Title */}
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-[1.1] mb-4 max-w-3xl">
            {post.title}
          </h2>
          
          {/* Body Preview */}
          {post.body && (
            <p className="text-white/80 text-sm sm:text-base leading-relaxed line-clamp-2 max-w-2xl mb-6">
              {post.body}
            </p>
          )}
          
          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-4 text-white/60 text-xs sm:text-sm">
            {/* Location */}
            {(post.city?.name || post.place?.name) && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>{post.place?.name || post.city?.name}</span>
              </div>
            )}
            
            {/* Date */}
            {formattedDate && (
              <>
                <span className="text-white/30">·</span>
                <span>{formattedDate}</span>
              </>
            )}
            
            {/* Reading Time */}
            <span className="text-white/30">·</span>
            <span>{readingTime} min read</span>
            
            {/* Read More Link */}
            {post.external_url && (
              <>
                <span className="text-white/30">·</span>
                <a
                  href={post.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 text-white hover:text-accent transition-colors font-medium"
                >
                  Read full story
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
