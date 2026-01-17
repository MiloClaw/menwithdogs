import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LinkedPlace {
  id: string;
  place_id: string;
  name: string;
  city: string | null;
  state: string | null;
  primary_category: string;
  context_note: string | null;
  status?: "approved" | "pending" | "rejected";
}

interface LinkedPlacesSectionProps {
  places: LinkedPlace[];
  onPlaceClick?: (placeId: string) => void;
}

export const LinkedPlacesSection = ({
  places,
  onPlaceClick,
}: LinkedPlacesSectionProps) => {
  // Safety filter: only show approved places in public view
  const approvedPlaces = places.filter(
    (p) => !p.status || p.status === "approved"
  );

  if (!approvedPlaces || approvedPlaces.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        Places mentioned in this article
      </h2>

      <div className="grid gap-3">
        {approvedPlaces.map((place) => (
          <div
            key={place.id}
            className="group flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="min-w-0">
              <h3 className="font-medium truncate">{place.name}</h3>
              {place.context_note && (
                <p className="text-sm text-muted-foreground italic mt-0.5">
                  {place.context_note}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-0.5">
                {[place.city, place.state].filter(Boolean).join(", ")}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onPlaceClick?.(place.place_id)}
            >
              View
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};
