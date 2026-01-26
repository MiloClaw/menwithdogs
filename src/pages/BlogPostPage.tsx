import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, MapPin, ExternalLink, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { useBlogPostBySlug } from "@/hooks/useBlogPostBySlug";
import { usePublicPostPlaces } from "@/hooks/usePostPlaces";
import { LinkedPlacesSection } from "@/components/blog/LinkedPlacesSection";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { queueSignal } from "@/hooks/useUserSignals";
import PlaceDetailModal, { PlaceDetail } from "@/components/directory/PlaceDetailModal";
import { supabase } from "@/integrations/supabase/client";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading, error } = useBlogPostBySlug(slug);
  const { isAuthenticated } = useAuth();
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetail | null>(null);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);

  // Fetch linked places for this post (public view - approved only)
  const { data: linkedPlaces = [] } = usePublicPostPlaces(post?.id ?? null);

  // Handle place click - fetch place details and open modal
  const handlePlaceClick = async (placeId: string) => {
    const { data } = await supabase
      .from('places')
      .select('*')
      .eq('id', placeId)
      .single();
    
    if (data) {
      setSelectedPlace({
        id: data.id,
        name: data.name,
        primary_category: data.primary_category,
        city: data.city,
        state: data.state,
        formatted_address: data.formatted_address,
        rating: data.rating,
        user_ratings_total: data.user_ratings_total,
        price_level: data.price_level,
        photos: data.photos,
        stored_photo_urls: data.stored_photo_urls,
        website_url: data.website_url,
        google_maps_url: data.google_maps_url,
        phone_number: data.phone_number,
        opening_hours: data.opening_hours,
        google_types: data.google_types,
      });
      setIsPlaceModalOpen(true);
    }
  };

  // Emit view_blog_post signal
  useEffect(() => {
    if (post && isAuthenticated) {
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
  }, [post?.id, isAuthenticated]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  if (error || !post) {
    return (
      <PageLayout>
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <h1 className="font-serif text-3xl font-bold mb-4">Post not found</h1>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/blog")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </PageLayout>
    );
  }

  const readingTime = post.body 
    ? Math.max(1, Math.ceil(post.body.split(/\s+/).length / 200))
    : 1;

  const metaDescription = post.meta_description || post.excerpt || (post.body?.slice(0, 160) + '...');
  const canonicalUrl = `https://mainstreet-landing-glow.lovable.app/blog/${post.slug}`;

  return (
    <PageLayout>
      <Helmet>
        <title>{post.title} | MainStreetIRL</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || metaDescription} />
        {post.cover_image_url && <meta property="og:image" content={post.cover_image_url} />}
        <meta property="og:type" content="article" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <article className="min-h-screen bg-background">
        {/* Cover Image */}
        {post.cover_image_url && (
          <div className="relative aspect-[21/9] max-h-[50vh] w-full overflow-hidden">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
        )}

        <div className="container max-w-3xl py-12 sm:py-16 px-4 sm:px-6">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/blog")}
            className="mb-8 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>

          {/* Title */}
          <header className="mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-6">
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
          </header>

          {/* Divider */}
          <div className="border-t border-border mb-10" />

          {/* Body Content - Markdown */}
          {post.body && (
            <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-serif prose-headings:!font-bold prose-headings:tracking-tight prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-5 prose-p:leading-relaxed prose-p:mb-6 prose-ul:my-6 prose-li:my-2 prose-blockquote:my-8 prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:border-l-4 prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold">
              <ReactMarkdown>{post.body}</ReactMarkdown>
            </div>
          )}

          {/* Linked Places Section */}
          <LinkedPlacesSection 
            places={linkedPlaces} 
            onPlaceClick={handlePlaceClick}
          />

          {/* External Link */}
          {post.external_url && (
            <div className="mt-12 pt-8 border-t border-border">
              <Button asChild variant="outline" size="lg">
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
            </div>
          )}
        </div>
      </article>

      {/* Place Detail Modal */}
      <PlaceDetailModal 
        place={selectedPlace}
        open={isPlaceModalOpen}
        onOpenChange={setIsPlaceModalOpen}
      />
    </PageLayout>
  );
};

export default BlogPostPage;