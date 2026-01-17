import { useEffect, useState } from "react";
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
import { usePublicPostPlaces } from "@/hooks/usePostPlaces";
import { LinkedPlacesSection } from "./LinkedPlacesSection";
import PlaceDetailModal from "@/components/directory/PlaceDetailModal";
import { supabase } from "@/integrations/supabase/client";
import type { BlogPost } from "@/hooks/useBlogPosts";

interface BlogPostDetailModalProps {
  post: BlogPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BlogPostDetailModal({ post, open, onOpenChange }: BlogPostDetailModalProps) {
  const { isAuthenticated } = useAuth();
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  
  const { data: linkedPlaces = [] } = usePublicPostPlaces(post?.id || null);
  
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

  const handlePlaceClick = async (placeId: string) => {
    const { data } = await supabase
      .from("places")
      .select("*")
      .eq("id", placeId)
      .single();
    
    if (data) {
      setSelectedPlace(data);
      setPlaceModalOpen(true);
    }
  };
  
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

          <div className="px-6 sm:px-10 py-10 sm:py-12 space-y-8">
            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
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
            <div className="border-t border-border mt-8" />

            {/* Body Content - Markdown */}
            {post.body && (
              <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-5 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:leading-relaxed prose-p:mb-6 prose-ul:my-5 prose-li:my-2 prose-blockquote:my-8 prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:border-l-4 prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold">
                <ReactMarkdown>{post.body}</ReactMarkdown>
              </div>
            )}

            {/* Linked Places */}
            <LinkedPlacesSection 
              places={linkedPlaces} 
              onPlaceClick={handlePlaceClick} 
            />

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

        {/* Place Detail Modal */}
        <PlaceDetailModal
          place={selectedPlace}
          open={placeModalOpen}
          onOpenChange={setPlaceModalOpen}
        />
      </DialogContent>
    </Dialog>
  );
}
