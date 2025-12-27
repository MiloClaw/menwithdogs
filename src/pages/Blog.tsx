import { useSearchParams } from "react-router-dom";
import { Mail } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import BlogCard from "@/components/BlogCard";
import FilterChip from "@/components/FilterChip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBlogPosts, useFeaturedPost, useCategories } from "@/hooks/useBlogPosts";
import { format } from "date-fns";

const popularPosts = [
  "10 Signs of a Healthy Relationship",
  "The Science Behind Couple Friendships",
  "Why Routine Matters More Than Romance",
];

const Blog = () => {
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "All";

  const { data: categories = ["All"], isLoading: categoriesLoading } = useCategories();
  const { data: posts = [], isLoading: postsLoading } = useBlogPosts(activeCategory);
  const { data: featuredPost, isLoading: featuredLoading } = useFeaturedPost();

  const isLoading = categoriesLoading || postsLoading || featuredLoading;

  // Filter out the featured post from the main grid if showing all posts
  const gridPosts = activeCategory === "All" && featuredPost
    ? posts.filter(p => p.id !== featuredPost.id)
    : posts;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  return (
    <PageLayout>
      <PageHeader 
        title="Stories & Insights" 
        subtitle="Tips, stories, and inspiration for couples"
      />
      
      <div className="container py-6 md:py-8">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 md:mb-8 border-b border-border -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {categories.map((category) => (
            <FilterChip 
              key={category} 
              label={category} 
              active={activeCategory === category}
              href={category === "All" ? "/blog" : `/blog?category=${category}`}
            />
          ))}
        </div>

        {isLoading ? (
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              <Card className="h-80 animate-pulse bg-muted" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="h-64 animate-pulse bg-muted" />
                ))}
              </div>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts found in this category.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* Featured Post */}
              {activeCategory === "All" && featuredPost && (
                <BlogCard 
                  title={featuredPost.title}
                  excerpt={featuredPost.excerpt || ""}
                  category={featuredPost.category}
                  date={formatDate(featuredPost.published_at)}
                  slug={featuredPost.slug}
                  heroImageUrl={featuredPost.hero_image_url || undefined}
                  featured 
                />
              )}

              {/* Post Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {gridPosts.map((post) => (
                  <BlogCard 
                    key={post.id} 
                    title={post.title}
                    excerpt={post.excerpt || ""}
                    category={post.category}
                    date={formatDate(post.published_at)}
                    slug={post.slug}
                    heroImageUrl={post.hero_image_url || undefined}
                  />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 md:space-y-6">
              {/* Newsletter Signup */}
              <Card className="p-4 md:p-6">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <div className="w-9 h-9 md:w-10 md:h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                  </div>
                  <h3 className="font-serif text-base md:text-lg font-semibold text-primary">
                    Newsletter
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3 md:mb-4">
                  Get weekly insights and stories delivered to your inbox.
                </p>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-surface border border-border rounded-button text-sm text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent mb-3"
                />
                <Button variant="accent" className="w-full" size="sm">
                  Subscribe
                </Button>
              </Card>

              {/* Popular Posts */}
              <Card className="p-4 md:p-6">
                <h3 className="font-serif text-base md:text-lg font-semibold text-primary mb-3 md:mb-4">
                  Popular Posts
                </h3>
                <ul className="space-y-2 md:space-y-3">
                  {popularPosts.map((title, index) => (
                    <li key={title} className="flex gap-2 md:gap-3">
                      <span className="text-accent font-semibold text-sm">{index + 1}.</span>
                      <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                        {title}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Blog;