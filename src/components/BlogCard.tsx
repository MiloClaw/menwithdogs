import { Card } from "@/components/ui/card";
import CategoryBadge from "./CategoryBadge";

interface BlogCardProps {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  featured?: boolean;
}

const BlogCard = ({ title, excerpt, category, date, featured = false }: BlogCardProps) => {
  if (featured) {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-[16/9] md:aspect-[21/9] bg-muted" />
        <div className="p-4 md:p-6">
          <CategoryBadge label={category} />
          <h2 className="font-serif text-xl md:text-2xl lg:text-3xl font-semibold text-primary mt-2 md:mt-3 mb-2 md:mb-3">
            {title}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground line-clamp-2 mb-3 md:mb-4">
            {excerpt}
          </p>
          <span className="text-xs md:text-sm text-muted-foreground">{date}</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-[4/3] md:aspect-video bg-muted" />
      <div className="p-3 md:p-4">
        <CategoryBadge label={category} />
        <h3 className="font-serif text-base md:text-lg font-semibold text-primary mt-2 mb-1.5 md:mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2 md:mb-3">
          {excerpt}
        </p>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>
    </Card>
  );
};

export default BlogCard;
