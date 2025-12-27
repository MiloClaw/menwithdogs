import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Share2, Bookmark } from "lucide-react";
import { format } from "date-fns";
import PageLayout from "@/components/PageLayout";
import CategoryBadge from "@/components/CategoryBadge";
import BlogCard from "@/components/BlogCard";
import { useBlogPost, useRelatedPosts } from "@/hooks/useBlogPosts";
import { Card } from "@/components/ui/card";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug || "");
  const { data: relatedPosts = [] } = useRelatedPosts(
    slug || "",
    post?.category || "",
    3
  );

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  // Parse content into sections for rendering
  const renderContent = (content: string) => {
    const sections = content.split("\n\n");
    return sections.map((section, index) => {
      const trimmed = section.trim();
      
      // Handle headers (lines starting with ##)
      if (trimmed.startsWith("## ")) {
        return (
          <h2 key={index} className="font-serif text-xl md:text-2xl font-semibold text-primary mt-8 md:mt-10 mb-3 md:mb-4">
            {trimmed.replace("## ", "")}
          </h2>
        );
      }
      
      // Handle blockquotes (lines starting with >)
      if (trimmed.startsWith("> ")) {
        return (
          <blockquote key={index} className="border-l-4 border-accent pl-4 md:pl-6 py-2 my-6 md:my-8">
            <p className="font-serif text-lg md:text-xl text-primary italic">
              {trimmed.replace("> ", "")}
            </p>
          </blockquote>
        );
      }
      
      // Handle lists (lines starting with -)
      if (trimmed.includes("\n- ") || trimmed.startsWith("- ")) {
        const items = trimmed.split("\n").filter(line => line.startsWith("- "));
        return (
          <ul key={index} className="list-disc list-inside text-sm md:text-base text-muted-foreground space-y-1.5 md:space-y-2 mb-5 md:mb-6 ml-2 md:ml-4">
            {items.map((item, i) => (
              <li key={i}>{item.replace("- ", "")}</li>
            ))}
          </ul>
        );
      }
      
      // Regular paragraphs
      if (trimmed) {
        return (
          <p key={index} className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5 md:mb-6">
            {trimmed}
          </p>
        );
      }
      
      return null;
    });
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container py-8 md:py-12">
          <Card className="h-96 animate-pulse bg-muted" />
        </div>
      </PageLayout>
    );
  }

  if (error || !post) {
    return (
      <PageLayout>
        <div className="container py-8 md:py-12 text-center">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-4">
            Post Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Hero Section */}
      <div className="border-b border-border">
        <div className="container py-6 md:py-8">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4 md:mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          
          <CategoryBadge label={post.category} />
          
          <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-primary mt-3 md:mt-4 mb-4 md:mb-6 max-w-4xl">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground mb-6 md:mb-8">
            <span>By <span className="text-primary font-medium">{post.author}</span></span>
            <span className="hidden md:inline">•</span>
            <span>{formatDate(post.published_at)}</span>
            <span>•</span>
            <span>{post.reading_time} min read</span>
          </div>

          {/* Hero Image */}
          <div 
            className="aspect-[16/9] md:aspect-[21/9] bg-muted rounded-card"
            style={post.hero_image_url ? { 
              backgroundImage: `url(${post.hero_image_url})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center' 
            } : undefined}
          />
        </div>
      </div>

      {/* Content */}
      <div className="container py-8 md:py-12">
        <div className="max-w-prose mx-auto px-0">
          {/* Body Content */}
          <div className="prose-custom">
            {post.excerpt && (
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-5 md:mb-6">
                {post.excerpt}
              </p>
            )}
            {renderContent(post.content)}
          </div>

          {/* Share Actions - Visual only, no functionality */}
          <div className="flex items-center gap-4 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border">
            <span className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground py-2">
              <Share2 className="w-4 h-4" />
              Share
            </span>
            <span className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground py-2">
              <Bookmark className="w-4 h-4" />
              Save
            </span>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 md:mt-16 pt-8 md:pt-12 border-t border-border">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-primary mb-6 md:mb-8">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {relatedPosts.map((relatedPost) => (
                <BlogCard 
                  key={relatedPost.id}
                  title={relatedPost.title}
                  excerpt={relatedPost.excerpt || ""}
                  category={relatedPost.category}
                  date={formatDate(relatedPost.published_at)}
                  slug={relatedPost.slug}
                  heroImageUrl={relatedPost.hero_image_url || undefined}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default BlogPost;