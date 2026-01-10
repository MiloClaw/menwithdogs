import { format } from "date-fns";
import { MapPin, ExternalLink, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { BlogPost } from "@/hooks/useBlogPosts";

interface BlogPostDetailModalProps {
  post: BlogPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BlogPostDetailModal({ post, open, onOpenChange }: BlogPostDetailModalProps) {
  if (!post) return null;

  const readingTime = post.body 
    ? Math.max(1, Math.ceil(post.body.split(/\s+/).length / 200))
    : 1;

  const formattedDate = post.created_at 
    ? format(new Date(post.created_at), "MMMM d, yyyy")
    : null;

  const primaryTag = post.tags?.[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden max-h-[90vh]">
        <DialogTitle className="sr-only">{post.title}</DialogTitle>
        
        <ScrollArea className="max-h-[90vh]">
          {/* Cover Image */}
          {post.cover_image_url && (
            <div className="relative aspect-[16/9] w-full">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-8 space-y-6">
            {/* Category Label */}
            {primaryTag?.interest?.label && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-medium">
                {primaryTag.interest.label}
              </span>
            )}

            {/* Title */}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {(post.city?.name || post.place?.name) && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {post.place?.name || post.city?.name}
                  {post.city?.state && `, ${post.city.state}`}
                </span>
              )}
              {formattedDate && (
                <span>{formattedDate}</span>
              )}
              <span>{readingTime} min read</span>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Body Content */}
            {post.body && (
              <div className="prose prose-neutral dark:prose-invert max-w-none leading-relaxed text-foreground/90">
                {post.body.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  )
                ))}
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <>
                <div className="border-t border-border" />
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    tag.interest?.label && (
                      <Badge 
                        key={tag.interest_id || index} 
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag.interest.label}
                      </Badge>
                    )
                  ))}
                </div>
              </>
            )}

            {/* External Link */}
            {post.external_url && (
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a 
                  href={post.external_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Read More
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
