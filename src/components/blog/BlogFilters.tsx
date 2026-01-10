import { useState } from "react";
import { Filter, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLaunchedCities } from "@/hooks/useLaunchedCities";
import { useInterestsCatalog } from "@/hooks/useInterests";

interface BlogFiltersProps {
  selectedCityId: string;
  selectedInterestIds: string[];
  onCityChange: (cityId: string) => void;
  onInterestToggle: (interestId: string) => void;
  onClearFilters: () => void;
  activeFilterCount?: number;
}

export const BlogFilters = ({
  selectedCityId,
  selectedInterestIds,
  onCityChange,
  onInterestToggle,
  onClearFilters,
  activeFilterCount = 0,
}: BlogFiltersProps) => {
  const [open, setOpen] = useState(false);
  const { data: cities = [] } = useLaunchedCities();
  const { data: catalog = [] } = useInterestsCatalog();

  const interests = catalog.flatMap(c => c.interests);

  return (
    <div className="flex items-center gap-4">
      {/* City Selector - Minimal inline style */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <Select value={selectedCityId || "all"} onValueChange={(v) => onCityChange(v === "all" ? "" : v)}>
          <SelectTrigger className="border-0 bg-transparent p-0 h-auto font-medium text-foreground hover:text-accent transition-colors focus:ring-0 focus:ring-offset-0 gap-1">
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}{city.state ? `, ${city.state}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="h-4 w-px bg-border" />

      {/* Filter Button - Opens Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-muted-foreground hover:text-foreground px-2"
          >
            <Filter className="h-4 w-4" />
            <span>Topics</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="h-5 min-w-5 p-0 justify-center text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader className="text-left">
            <SheetTitle className="font-serif text-xl">Filter by Topic</SheetTitle>
          </SheetHeader>
          
          <div className="mt-8 space-y-6">
            {/* Active Filters */}
            {selectedInterestIds.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                    Active Filters
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="text-xs h-auto py-1 px-2"
                  >
                    Clear all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedInterestIds.map((id) => {
                    const interest = interests.find((i) => i.id === id);
                    if (!interest) return null;
                    return (
                      <Badge
                        key={id}
                        variant="default"
                        className="cursor-pointer gap-1.5 pr-1.5"
                        onClick={() => onInterestToggle(id)}
                      >
                        {interest.label}
                        <X className="h-3 w-3" />
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Topics */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                All Topics
              </span>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => {
                  const isSelected = selectedInterestIds.includes(interest.id);
                  return (
                    <Badge
                      key={interest.id}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer transition-all hover:bg-accent/10"
                      onClick={() => onInterestToggle(interest.id)}
                    >
                      {interest.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Clear Button - Only when filters active */}
      {activeFilterCount > 0 && (
        <>
          <div className="h-4 w-px bg-border" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground gap-1.5 px-2"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        </>
      )}
    </div>
  );
};
