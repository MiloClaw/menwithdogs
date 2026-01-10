import { X, Filter, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  const [topicsOpen, setTopicsOpen] = useState(false);
  const { data: cities = [] } = useLaunchedCities();
  const { data: catalog = [] } = useInterestsCatalog();

  // Flatten all interests from catalog
  const interests = catalog.flatMap(c => c.interests);
  
  const hasFilters = selectedCityId !== "" || selectedInterestIds.length > 0;

  // Get featured/popular interests for quick access (first 8)
  const quickInterests = interests.slice(0, 8);
  
  // Remaining interests for expandable section
  const moreInterests = interests.slice(8);

  return (
    <div className="space-y-4">
      {/* Primary filters row */}
      <div className="flex items-center gap-3">
        {/* City Filter */}
        <Select value={selectedCityId || "all"} onValueChange={(v) => onCityChange(v === "all" ? "" : v)}>
          <SelectTrigger className="w-auto min-w-[140px] bg-background">
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
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Quick topic pills - horizontal scroll on mobile */}
      <div className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        <div className="flex gap-2 min-w-max sm:flex-wrap sm:min-w-0">
          {quickInterests.map((interest) => {
            const isSelected = selectedInterestIds.includes(interest.id);
            return (
              <Badge
                key={interest.id}
                variant={isSelected ? "default" : "outline"}
                className={`
                  cursor-pointer whitespace-nowrap transition-all
                  ${isSelected 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "hover:bg-muted border-border"
                  }
                `}
                onClick={() => onInterestToggle(interest.id)}
              >
                {interest.label}
              </Badge>
            );
          })}
          
          {/* More topics trigger */}
          {moreInterests.length > 0 && (
            <Collapsible open={topicsOpen} onOpenChange={setTopicsOpen}>
              <CollapsibleTrigger asChild>
                <Badge
                  variant="outline"
                  className="cursor-pointer whitespace-nowrap hover:bg-muted border-dashed"
                >
                  <Filter className="h-3 w-3 mr-1" />
                  More topics
                  <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${topicsOpen ? 'rotate-180' : ''}`} />
                </Badge>
              </CollapsibleTrigger>
            </Collapsible>
          )}
        </div>
      </div>

      {/* Expanded topics section */}
      {moreInterests.length > 0 && (
        <Collapsible open={topicsOpen} onOpenChange={setTopicsOpen}>
          <CollapsibleContent className="pt-2">
            <div className="flex flex-wrap gap-2 p-4 rounded-lg bg-muted/30 border">
              {moreInterests.map((interest) => {
                const isSelected = selectedInterestIds.includes(interest.id);
                return (
                  <Badge
                    key={interest.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`
                      cursor-pointer transition-all
                      ${isSelected 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "hover:bg-muted border-border"
                      }
                    `}
                    onClick={() => onInterestToggle(interest.id)}
                  >
                    {interest.label}
                  </Badge>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Active filter summary */}
      {selectedInterestIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground font-mono text-xs uppercase tracking-wider">Active:</span>
          {selectedInterestIds.map((id) => {
            const interest = interests.find((i) => i.id === id);
            return interest ? (
              <Badge 
                key={id} 
                variant="secondary"
                className="cursor-pointer gap-1"
                onClick={() => onInterestToggle(id)}
              >
                {interest.label}
                <X className="h-3 w-3" />
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};
