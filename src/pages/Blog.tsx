import { useState } from "react";
import { Megaphone, Loader2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
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

  return (
    <PageLayout>
      <div className="min-h-screen bg-background">
        <div className="container max-w-3xl py-8 px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Megaphone className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
            </div>
            <p className="text-muted-foreground">
              Updates, announcements, and local happenings from cities we cover.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8">
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
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No announcements yet</h2>
              <p className="text-muted-foreground">
                {selectedCityId || selectedInterestIds.length > 0
                  ? "Try adjusting your filters to see more posts."
                  : "Check back soon for updates from our covered cities."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <BlogPostCard
                  key={post.id}
                  post={post}
                  onTagClick={handleInterestToggle}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Blog;
