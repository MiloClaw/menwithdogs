import { formatDistanceToNow } from "date-fns";
import { Megaphone, ExternalLink, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <Megaphone className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">
              {post.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-muted-foreground">
              {locationText && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {locationText}
                </span>
              )}
              <span>·</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Place Badge */}
        {post.place && (
          <Badge variant="outline" className="text-xs">
            📍 {post.place.name}
          </Badge>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Badge
                key={tag.interest_id}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-secondary/80"
                onClick={() => onTagClick?.(tag.interest_id)}
              >
                #{tag.interest.label.toLowerCase().replace(/\s+/g, "")}
              </Badge>
            ))}
          </div>
        )}

        {/* Body */}
        {post.body && (
          <p className="text-muted-foreground text-sm line-clamp-3">
            {post.body}
          </p>
        )}

        {/* External Link */}
        {post.external_url && (
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            asChild
          >
            <a 
              href={post.external_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              Learn More
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
