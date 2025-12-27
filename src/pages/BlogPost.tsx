import { ArrowLeft, Share2, Bookmark } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import CategoryBadge from "@/components/CategoryBadge";
import BlogCard from "@/components/BlogCard";

const relatedPosts = [
  {
    title: "Weekend Getaways That Actually Bring You Closer",
    excerpt: "The best destinations for couples looking to reconnect.",
    category: "Travel",
    date: "December 18, 2024",
  },
  {
    title: "The Art of Shared Hobbies",
    excerpt: "Finding activities you both love.",
    category: "Lifestyle",
    date: "December 15, 2024",
  },
  {
    title: "Communication 101: What They Don't Teach You",
    excerpt: "Essential communication skills every couple should master.",
    category: "Relationships",
    date: "December 12, 2024",
  },
];

const tags = ["Relationships", "Communication", "Growth", "Couples"];

const BlogPost = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <div className="border-b border-border">
        <div className="container py-6 md:py-8">
          <a href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4 md:mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </a>
          
          <CategoryBadge label="Relationships" />
          
          <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-primary mt-3 md:mt-4 mb-4 md:mb-6 max-w-4xl">
            Building Stronger Connections: A Guide for Modern Couples
          </h1>
          
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground mb-6 md:mb-8">
            <span>By <span className="text-primary font-medium">Editorial Team</span></span>
            <span className="hidden md:inline">•</span>
            <span>December 20, 2024</span>
            <span>•</span>
            <span>8 min read</span>
          </div>

          {/* Hero Image */}
          <div className="aspect-[16/9] md:aspect-[21/9] bg-muted rounded-card" />
        </div>
      </div>

      {/* Content */}
      <div className="container py-8 md:py-12">
        <div className="max-w-prose mx-auto px-0">
          {/* Body Content */}
          <div className="prose-custom">
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-5 md:mb-6">
              In today's fast-paced world, maintaining meaningful connections with your partner requires intentionality and effort. This guide explores practical strategies for deepening your relationship while navigating the complexities of contemporary life together.
            </p>

            <h2 className="font-serif text-xl md:text-2xl font-semibold text-primary mt-8 md:mt-10 mb-3 md:mb-4">
              The Foundation of Connection
            </h2>
            
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5 md:mb-6">
              Strong relationships are built on a foundation of trust, communication, and shared experiences. Understanding these fundamental elements is the first step toward creating a lasting bond with your partner.
            </p>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5 md:mb-6">
              Research consistently shows that couples who prioritize quality time together—even in small, everyday moments—report higher levels of satisfaction and longevity in their relationships.
            </p>

            {/* Pull Quote */}
            <blockquote className="border-l-4 border-accent pl-4 md:pl-6 py-2 my-6 md:my-8">
              <p className="font-serif text-lg md:text-xl text-primary italic">
                "The greatest relationships are built not on grand gestures, but on consistent small acts of care and attention."
              </p>
            </blockquote>

            <h2 className="font-serif text-xl md:text-2xl font-semibold text-primary mt-8 md:mt-10 mb-3 md:mb-4">
              Practical Strategies for Daily Connection
            </h2>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5 md:mb-6">
              Implementing small rituals can transform your daily routine into opportunities for connection. Consider starting with these simple practices:
            </p>

            <ul className="list-disc list-inside text-sm md:text-base text-muted-foreground space-y-1.5 md:space-y-2 mb-5 md:mb-6 ml-2 md:ml-4">
              <li>Morning check-ins before the day begins</li>
              <li>Device-free dinner conversations</li>
              <li>Weekly planning sessions together</li>
              <li>Evening gratitude sharing</li>
            </ul>

            {/* Inline Image */}
            <div className="aspect-[4/3] md:aspect-video bg-muted rounded-card my-6 md:my-8" />

            <h2 className="font-serif text-xl md:text-2xl font-semibold text-primary mt-8 md:mt-10 mb-3 md:mb-4">
              Navigating Challenges Together
            </h2>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5 md:mb-6">
              Every relationship faces obstacles. The key is not avoiding challenges but developing the skills and resilience to work through them as a team. This section explores common challenges couples face and offers evidence-based approaches for addressing them.
            </p>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5 md:mb-6">
              Remember that seeking support—whether from friends, family, or professionals—is a sign of strength, not weakness. Building a network of supportive relationships around your partnership can provide valuable perspective and encouragement.
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border">
            {tags.map((tag) => (
              <span key={tag} className="px-2.5 md:px-3 py-1 md:py-1.5 bg-surface text-primary text-xs md:text-sm rounded-button border border-border">
                {tag}
              </span>
            ))}
          </div>

          {/* Share Actions */}
          <div className="flex items-center gap-4 mt-4 md:mt-6">
            <button className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors py-2">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors py-2">
              <Bookmark className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        {/* Related Posts */}
        <div className="mt-12 md:mt-16 pt-8 md:pt-12 border-t border-border">
          <h2 className="font-serif text-xl md:text-2xl font-semibold text-primary mb-6 md:mb-8">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {relatedPosts.map((post) => (
              <BlogCard key={post.title} {...post} />
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default BlogPost;
