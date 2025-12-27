import { MapPin, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PlaceCardProps {
  name: string;
  category: string;
  location: string;
  rating: number;
}

const PlaceCard = ({ name, category, location, rating }: PlaceCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-[4/3] md:aspect-video bg-muted" />
      <div className="p-3 md:p-4">
        <span className="text-xs font-medium text-accent uppercase tracking-wide">
          {category}
        </span>
        <h3 className="font-serif text-base md:text-lg font-semibold text-primary mt-1">
          {name}
        </h3>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mt-2">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-0.5 md:gap-1 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-3.5 h-3.5 md:w-4 md:h-4",
                i < rating ? "fill-accent text-accent" : "text-muted"
              )}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default PlaceCard;
