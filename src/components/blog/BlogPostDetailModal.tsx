import { useEffect } from "react";
import { MapPin, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { queueSignal } from "@/hooks/useUserSignals";
import type { BlogPost } from "@/hooks/useBlogPosts";

interface BlogPostDetailModalProps {
  post: BlogPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BlogPostDetailModal({ post, open, onOpenChange }: BlogPostDetailModalProps) {
  const { isAuthenticated } = useAuth();
  
  // Emit view_blog_post signal when modal opens
  useEffect(() => {
    if (post && open && isAuthenticated) {
      queueSignal(
        'view_blog_post',
        post.id,
        null,
        'implicit',
        0.2,
        { 
          place_id: post.place?.id || null, 
          city_id: post.city?.id || null 
        }
      );
    }
  }, [post?.id, open, isAuthenticated]);
  
  if (!post) return null;

  const readingTime = post.body 
    ? Math.max(1, Math.ceil(post.body.split(/\s+/).length / 200))
    : 1;

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
              <span>{readingTime} min read</span>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Body Content - Markdown */}
            {post.body && (
              <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-serif prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-p:mb-5 prose-ul:my-4 prose-li:my-1 prose-blockquote:my-6 prose-blockquote:border-l-primary prose-blockquote:italic prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
                <ReactMarkdown>{post.body}</ReactMarkdown>
              </div>
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
