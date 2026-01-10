import { useState } from "react";
import { Loader2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { FeaturedBlogCard } from "@/components/blog/FeaturedBlogCard";
import { BlogFilters } from "@/components/blog/BlogFilters";
import { useBlogPosts } from "@/hooks/useBlogPosts";

const Blog = () => {
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>([]);

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

  return (
    <PageLayout>
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl py-12 px-4 sm:px-6">
          {/* Header */}
          <header className="mb-10 text-center sm:text-left">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-balance">
              From the Streets
            </h1>
            <p className="text-muted-foreground mt-3 text-lg max-w-xl">
              Updates, announcements, and local happenings from cities we cover.
            </p>
          </header>

          {/* Filters */}
          <div className="mb-10">
            <BlogFilters
              selectedCityId={selectedCityId}
              selectedInterestIds={selectedInterestIds}
              onCityChange={setSelectedCityId}
              onInterestToggle={handleInterestToggle}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                <span className="text-3xl">📰</span>
              </div>
              <h2 className="font-serif text-2xl font-semibold mb-2">No stories yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {selectedCityId || selectedInterestIds.length > 0
                  ? "Try adjusting your filters to see more posts."
                  : "Check back soon for updates from our covered cities."}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Featured Post */}
              {featuredPost && (
                <FeaturedBlogCard
                  post={featuredPost}
                  onTagClick={handleInterestToggle}
                />
              )}
              
              {/* Grid Posts */}
              {gridPosts.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2">
                  {gridPosts.map((post) => (
                    <BlogPostCard
                      key={post.id}
                      post={post}
                      onTagClick={handleInterestToggle}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Blog;
