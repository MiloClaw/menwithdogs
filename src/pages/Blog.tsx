import { useState } from "react";
import { Loader2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { FeaturedBlogCard } from "@/components/blog/FeaturedBlogCard";
import { BlogFilters } from "@/components/blog/BlogFilters";
import { BlogPostDetailModal } from "@/components/blog/BlogPostDetailModal";
import { useBlogPosts, type BlogPost } from "@/hooks/useBlogPosts";

const Blog = () => {
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const { data: posts = [], isLoading } = useBlogPosts({
    cityId: selectedCityId || undefined,
    interestIds: selectedInterestIds.length > 0 ? selectedInterestIds : undefined,
  });

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterestIds((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleClearFilters = () => {
    setSelectedCityId("");
    setSelectedInterestIds([]);
  };

  // Separate featured post (first post) from grid posts
  const featuredPost = posts.length > 0 ? posts[0] : null;
  const gridPosts = posts.length > 1 ? posts.slice(1) : [];

  const activeFilterCount = (selectedCityId ? 1 : 0) + selectedInterestIds.length;

  return (
    <PageLayout>
      <div className="min-h-screen bg-background">
        <div className="container max-w-5xl py-16 sm:py-20 px-4 sm:px-6">
          {/* Header */}
          <header className="mb-10">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              From the Streets
            </h1>
            <div className="mt-4 h-px bg-border" />
          </header>

          {/* Filters */}
          <div className="mb-12">
            <BlogFilters
              selectedCityId={selectedCityId}
              selectedInterestIds={selectedInterestIds}
              onCityChange={setSelectedCityId}
              onInterestToggle={handleInterestToggle}
              onClearFilters={handleClearFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/30 mb-6">
                <span className="text-4xl">📰</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold mb-3">No stories yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                {selectedCityId || selectedInterestIds.length > 0
                  ? "Try adjusting your filters to see more posts."
                  : "Check back soon for updates from our covered cities."}
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Featured Post */}
              {featuredPost && (
                <section>
                  <FeaturedBlogCard
                    post={featuredPost}
                    onTagClick={handleInterestToggle}
                    onClick={() => setSelectedPost(featuredPost)}
                  />
                </section>
              )}
              
              {/* Section Divider */}
              {gridPosts.length > 0 && (
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    More Stories
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}
              
              {/* Grid Posts */}
              {gridPosts.length > 0 && (
                <div className="grid gap-8 sm:grid-cols-2">
                  {gridPosts.map((post) => (
                    <BlogPostCard
                      key={post.id}
                      post={post}
                      onTagClick={handleInterestToggle}
                      onClick={() => setSelectedPost(post)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Detail Modal */}
      <BlogPostDetailModal
        post={selectedPost}
        open={!!selectedPost}
        onOpenChange={(open) => !open && setSelectedPost(null)}
      />
    </PageLayout>
  );
};

export default Blog;
