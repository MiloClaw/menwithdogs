import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLaunchedCities } from "@/hooks/useLaunchedCities";
import { useInterestsCatalog, Interest } from "@/hooks/useInterests";

interface BlogFiltersProps {
  selectedCityId: string;
  selectedInterestIds: string[];
  onCityChange: (cityId: string) => void;
  onInterestToggle: (interestId: string) => void;
  onClearFilters: () => void;
}

export const BlogFilters = ({
  selectedCityId,
  selectedInterestIds,
  onCityChange,
  onInterestToggle,
  onClearFilters,
}: BlogFiltersProps) => {
  const { data: cities = [] } = useLaunchedCities();
  const { data: catalog = [] } = useInterestsCatalog();

  // Flatten all interests from catalog
  const interests = catalog.flatMap(c => c.interests);
  
  const hasFilters = selectedCityId !== "" || selectedInterestIds.length > 0;

  // Group interests by category for display
  const interestsByCategory = interests.reduce((acc, interest: Interest) => {
    if (!acc[interest.category_id]) {
      acc[interest.category_id] = [];
    }
    acc[interest.category_id].push(interest);
    return acc;
  }, {} as Record<string, typeof interests>);

  // Get unique categories with their first interest for ordering
  const categories = Object.keys(interestsByCategory);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* City Filter */}
        <Select value={selectedCityId || "all"} onValueChange={(v) => onCityChange(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}{city.state ? `, ${city.state}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Interest Tags - Horizontal Scroll on Mobile */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex flex-wrap gap-2 min-w-max sm:min-w-0">
          {categories.map((categoryId) => (
            interestsByCategory[categoryId].slice(0, 5).map((interest) => {
              const isSelected = selectedInterestIds.includes(interest.id);
              return (
                <Badge
                  key={interest.id}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/20 transition-colors whitespace-nowrap"
                  onClick={() => onInterestToggle(interest.id)}
                >
                  {interest.label}
                </Badge>
              );
            })
          ))}
        </div>
      </div>

      {/* Selected Filters Summary */}
      {selectedInterestIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Filtering by:</span>
          {selectedInterestIds.map((id) => {
            const interest = interests.find((i) => i.id === id);
            return interest ? (
              <Badge 
                key={id} 
                variant="secondary"
                className="cursor-pointer"
                onClick={() => onInterestToggle(id)}
              >
                {interest.label}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};
