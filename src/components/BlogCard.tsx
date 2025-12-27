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
        <div className="aspect-[21/9] bg-muted" />
        <div className="p-6">
          <CategoryBadge label={category} />
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-primary mt-3 mb-3">
            {title}
          </h2>
          <p className="text-muted-foreground line-clamp-2 mb-4">
            {excerpt}
          </p>
          <span className="text-sm text-muted-foreground">{date}</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-muted" />
      <div className="p-4">
        <CategoryBadge label={category} />
        <h3 className="font-serif text-lg font-semibold text-primary mt-2 mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {excerpt}
        </p>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>
    </Card>
  );
};

export default BlogCard;
