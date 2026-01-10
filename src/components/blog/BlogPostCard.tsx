import { ExternalLink, MapPin } from "lucide-react";
import { format } from "date-fns";
import type { BlogPost } from "@/hooks/useBlogPosts";

interface BlogPostCardProps {
  post: BlogPost;
  onTagClick?: (interestId: string) => void;
  onClick?: () => void;
}

export const BlogPostCard = ({ post, onTagClick, onClick }: BlogPostCardProps) => {
  const hasImage = !!post.cover_image_url;
  const tags = post.tags?.slice(0, 2) || [];
  const primaryTag = tags[0];
  
  // Calculate reading time
  const wordCount = (post.body || "").split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Format date
  const formattedDate = post.created_at 
    ? format(new Date(post.created_at), "MMM d, yyyy")
    : null;

  if (hasImage) {
    return (
      <article 
        className="group relative overflow-hidden rounded-lg bg-card border border-border/50 hover:border-border transition-all hover:shadow-lg hover:shadow-black/5 cursor-pointer"
        onClick={onClick}
      >
        {/* Image */}
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={post.cover_image_url!}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        
        {/* Content */}
        <div className="p-5 sm:p-6">
          {/* Category Label */}
          {primaryTag && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTagClick?.(primaryTag.interest_id);
              }}
              className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold hover:text-accent/80 transition-colors mb-2 block"
            >
              {primaryTag.interest?.label}
            </button>
          )}
          
          {/* Title */}
          <h3 className="font-serif text-lg sm:text-xl font-semibold leading-tight mb-2 group-hover:text-primary/80 transition-colors">
            {post.title}
          </h3>
          
          {/* Body Preview */}
          {post.body && (
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-1 mb-4">
              {post.body}
            </p>
          )}
          
          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-3 text-muted-foreground/70 text-xs">
            {(post.city?.name || post.place?.name) && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{post.place?.name || post.city?.name}</span>
              </div>
            )}
            
            {formattedDate && (
              <>
                <span className="text-muted-foreground/30">·</span>
                <span>{formattedDate}</span>
              </>
            )}
            
            <span className="text-muted-foreground/30">·</span>
            <span>{readingTime} min read</span>
            
            {post.external_url && (
              <a
                href={post.external_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="ml-auto inline-flex items-center gap-1 text-foreground hover:text-accent transition-colors font-medium"
              >
                Read
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </article>
    );
  }

  // Text-only card with left border accent
  return (
    <article 
      className="group relative pl-5 border-l-2 border-accent/40 hover:border-accent transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Category Label */}
      {primaryTag && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTagClick?.(primaryTag.interest_id);
          }}
          className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold hover:text-accent/80 transition-colors mb-2 block"
        >
          {primaryTag.interest?.label}
        </button>
      )}
      
      {/* Title */}
      <h3 className="font-serif text-lg sm:text-xl font-semibold leading-tight mb-2 group-hover:text-primary/80 transition-colors">
        {post.title}
      </h3>
      
      {/* Body Preview */}
      {post.body && (
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">
          {post.body}
        </p>
      )}
      
      {/* Meta Row */}
      <div className="flex flex-wrap items-center gap-3 text-muted-foreground/70 text-xs">
        {(post.city?.name || post.place?.name) && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{post.place?.name || post.city?.name}</span>
          </div>
        )}
        
        {formattedDate && (
          <>
            <span className="text-muted-foreground/30">·</span>
            <span>{formattedDate}</span>
          </>
        )}
        
        <span className="text-muted-foreground/30">·</span>
        <span>{readingTime} min read</span>
        
        {post.external_url && (
          <a
            href={post.external_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="ml-auto inline-flex items-center gap-1 text-foreground hover:text-accent transition-colors font-medium"
          >
            Read
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </article>
  );
};
