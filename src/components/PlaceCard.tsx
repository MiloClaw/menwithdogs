import { MapPin, Star } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PlaceCardProps {
  name: string;
  category: string;
  location: string;
  rating: number;
}

const PlaceCard = ({ name, category, location, rating }: PlaceCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-muted" />
      <div className="p-4">
        <span className="text-xs font-medium text-accent uppercase tracking-wide">
          {category}
        </span>
        <h3 className="font-serif text-lg font-semibold text-primary mt-1">
          {name}
        </h3>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mt-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-1 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-4 h-4",
                i < rating ? "fill-accent text-accent" : "text-muted"
              )}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

import { cn } from "@/lib/utils";

export default PlaceCard;
