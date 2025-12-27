import { Mail } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import BlogCard from "@/components/BlogCard";
import FilterChip from "@/components/FilterChip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const categories = ["All", "Relationships", "Travel", "Lifestyle", "Guides"];

const featuredPost = {
  title: "Building Stronger Connections: A Guide for Modern Couples",
  excerpt: "Discover practical strategies for deepening your relationship while navigating the complexities of contemporary life together.",
  category: "Relationships",
  date: "December 20, 2024",
};

const posts = [
  {
    title: "Weekend Getaways That Actually Bring You Closer",
    excerpt: "The best destinations for couples looking to reconnect and create lasting memories.",
    category: "Travel",
    date: "December 18, 2024",
  },
  {
    title: "The Art of Shared Hobbies",
    excerpt: "Finding activities you both love doesn't have to be complicated.",
    category: "Lifestyle",
    date: "December 15, 2024",
  },
  {
    title: "Communication 101: What They Don't Teach You",
    excerpt: "Essential communication skills every couple should master.",
    category: "Relationships",
    date: "December 12, 2024",
  },
  {
    title: "Planning Your First Couple Meetup",
    excerpt: "A step-by-step guide to hosting memorable gatherings.",
    category: "Guides",
    date: "December 10, 2024",
  },
  {
    title: "Balancing Independence and Togetherness",
    excerpt: "How successful couples maintain their individuality.",
    category: "Lifestyle",
    date: "December 8, 2024",
  },
  {
    title: "Date Night Ideas That Go Beyond Dinner",
    excerpt: "Creative ways to spend quality time together.",
    category: "Lifestyle",
    date: "December 5, 2024",
  },
];

const popularPosts = [
  "10 Signs of a Healthy Relationship",
  "The Science Behind Couple Friendships",
  "Why Routine Matters More Than Romance",
];

const Blog = () => {
  return (
    <PageLayout>
      <PageHeader 
        title="Stories & Insights" 
        subtitle="Tips, stories, and inspiration for couples"
      />
      
      <div className="container py-6 md:py-8">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 md:mb-8 border-b border-border -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {categories.map((category, index) => (
            <FilterChip key={category} label={category} active={index === 0} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Featured Post */}
            <BlogCard {...featuredPost} featured />

            {/* Post Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {posts.map((post) => (
                <BlogCard key={post.title} {...post} />
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
      </div>
    </PageLayout>
  );
};

export default Blog;
