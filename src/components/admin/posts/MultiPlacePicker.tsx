import { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  Search,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Loader2,
  GripVertical,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlaces } from "@/hooks/usePlaces";
import { useGooglePlaces, PlacePrediction } from "@/hooks/useGooglePlaces";
import { cn } from "@/lib/utils";

export interface LinkedPlaceInput {
  place_id: string;
  name: string;
  city: string | null;
  sort_order: number;
  context_note?: string;
}

interface MultiPlacePickerProps {
  value: LinkedPlaceInput[];
  onChange: (places: LinkedPlaceInput[]) => void;
  disabled?: boolean;
  initialSearchTerm?: string;
  onSearchTermChange?: (term: string) => void;
}

const statusColors: Record<string, string> = {
  approved: "bg-green-500/10 text-green-700 border-green-500/20",
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
};

export const MultiPlacePicker = ({
  value,
  onChange,
  disabled,
  initialSearchTerm,
  onSearchTermChange,
}: MultiPlacePickerProps) => {
  const { places, createPlace } = usePlaces();
  const {
    predictions,
    isLoading: isLoadingGoogle,
    fetchAutocomplete,
    fetchDetails,
    clearPredictions,
  } = useGooglePlaces();

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || "");
  const [isCreatingVenue, setIsCreatingVenue] = useState(false);
  const [editingContextIndex, setEditingContextIndex] = useState<number | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Sync initial search term when it changes
  useEffect(() => {
    if (initialSearchTerm && initialSearchTerm !== searchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  // Notify parent of search term changes
  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
    onSearchTermChange?.(term);
  };

  const approvedPlaces = places.filter((p) => p.status === "approved");

  // Filter out already selected places
  const selectedPlaceIds = value.map((p) => p.place_id);

  const filteredPlaces =
    searchTerm.length >= 2
      ? approvedPlaces.filter(
          (p) =>
            !selectedPlaceIds.includes(p.id) &&
            (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.city?.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : [];

  // Fetch Google predictions
  const debouncedFetch = useCallback(
    (term: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (term.length < 2) {
        clearPredictions();
        return;
      }

      debounceRef.current = setTimeout(() => {
        fetchAutocomplete(term, "establishment");
      }, 200);
    },
    [fetchAutocomplete, clearPredictions]
  );

  useEffect(() => {
    debouncedFetch(searchTerm);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, debouncedFetch]);

  // Filter out Google predictions already in our DB or selected
  const newGooglePredictions = predictions.filter(
    (pred) =>
      !places.some((p) => p.google_place_id === pred.place_id) &&
      !selectedPlaceIds.includes(pred.place_id)
  );

  const handleAddPlace = (place: {
    id: string;
    name: string;
    city: string | null;
  }) => {
    const newPlace: LinkedPlaceInput = {
      place_id: place.id,
      name: place.name,
      city: place.city,
      sort_order: value.length,
    };
    onChange([...value, newPlace]);
    setSearchTerm("");
    clearPredictions();
  };

  const handleGooglePredictionSelect = async (prediction: PlacePrediction) => {
    // Check if exists in DB
    const existingPlace = places.find(
      (p) => p.google_place_id === prediction.place_id
    );
    if (existingPlace) {
      handleAddPlace({
        id: existingPlace.id,
        name: existingPlace.name,
        city: existingPlace.city,
      });
      return;
    }

    setIsCreatingVenue(true);
    try {
      const details = await fetchDetails(prediction.place_id);
      if (!details) throw new Error("Failed to fetch details");

      const result = await createPlace.mutateAsync({
        google_place_id: details.place_id,
        name: details.name,
        primary_category: "general",
        formatted_address: details.formatted_address,
        city: details.city,
        state: details.state,
        country: details.country,
        lat: details.lat,
        lng: details.lng,
        phone_number: details.phone_number,
        website_url: details.website_url,
        google_maps_url: details.google_maps_url,
        rating: details.rating,
        user_ratings_total: details.user_ratings_total,
        price_level: details.price_level,
        google_primary_type: details.google_primary_type,
        google_primary_type_display: details.google_primary_type_display,
        opening_hours: details.opening_hours as any,
        photos: details.photos as any,
        status: "pending",
      });

      handleAddPlace({
        id: result.id,
        name: result.name,
        city: result.city,
      });
    } catch (error) {
      console.error("Failed to create venue:", error);
    } finally {
      setIsCreatingVenue(false);
    }
  };

  const handleRemove = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    // Re-index sort_order
    onChange(updated.map((p, i) => ({ ...p, sort_order: i })));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...value];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated.map((p, i) => ({ ...p, sort_order: i })));
  };

  const handleMoveDown = (index: number) => {
    if (index === value.length - 1) return;
    const updated = [...value];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated.map((p, i) => ({ ...p, sort_order: i })));
  };

  const handleContextChange = (index: number, note: string) => {
    const updated = value.map((p, i) =>
      i === index ? { ...p, context_note: note } : p
    );
    onChange(updated);
  };

  const showDropdown = searchTerm.length >= 2;
  const hasLocalResults = filteredPlaces.length > 0;
  const hasGoogleResults = newGooglePredictions.length > 0;

  return (
    <div className="space-y-3">
      <Label>Featured Places (optional)</Label>
      <p className="text-xs text-muted-foreground -mt-2">
        Add places mentioned in this post for readers to explore
      </p>

      {/* Selected places list */}
      {value.length > 0 && (
        <div className="border rounded-lg divide-y">
          {value.map((place, index) => (
            <div
              key={place.place_id}
              className="p-3 flex items-start gap-3 group"
            >
              <div className="flex flex-col items-center gap-1 pt-1">
                <span className="text-xs text-muted-foreground font-medium w-5 text-center">
                  {index + 1}
                </span>
                <GripVertical className="h-4 w-4 text-muted-foreground/40" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{place.name}</p>
                {place.city && (
                  <p className="text-sm text-muted-foreground truncate">
                    {place.city}
                  </p>
                )}
                {editingContextIndex === index ? (
                  <Input
                    value={place.context_note || ""}
                    onChange={(e) => handleContextChange(index, e.target.value)}
                    onBlur={() => setEditingContextIndex(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setEditingContextIndex(null);
                    }}
                    placeholder="Add context (e.g., 'Best for brunch')"
                    className="mt-2 h-8 text-sm"
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingContextIndex(index)}
                    className="text-xs text-muted-foreground hover:text-foreground mt-1 italic"
                  >
                    {place.context_note || "+ Add context"}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === value.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => handleRemove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => handleSearchTermChange(e.target.value)}
          placeholder="Search places to add..."
          className="pl-9 pr-9"
          disabled={disabled}
        />
        {(isLoadingGoogle || isCreatingVenue) && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Search results */}
      {showDropdown && (
        <ScrollArea className="h-[200px] border rounded-lg">
          <div className="p-2 space-y-1">
            {/* Local results */}
            {hasLocalResults && (
              <>
                <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                  Matching Venues
                </p>
                {filteredPlaces.slice(0, 10).map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent text-left transition-colors"
                    onClick={() =>
                      handleAddPlace({
                        id: place.id,
                        name: place.name,
                        city: place.city,
                      })
                    }
                  >
                    <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{place.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {[place.city, place.state].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", statusColors.approved)}
                    >
                      approved
                    </Badge>
                  </button>
                ))}
              </>
            )}

            {/* Google results */}
            {hasGoogleResults && (
              <>
                {hasLocalResults && <Separator className="my-2" />}
                <p className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center gap-1">
                  <Plus className="h-3 w-3" />
                  Add from Google
                </p>
                {newGooglePredictions.slice(0, 5).map((prediction) => (
                  <button
                    key={prediction.place_id}
                    type="button"
                    disabled={isCreatingVenue}
                    className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent text-left transition-colors disabled:opacity-50"
                    onClick={() => handleGooglePredictionSelect(prediction)}
                  >
                    <Plus className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {prediction.structured_formatting?.main_text ||
                          prediction.description}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {prediction.structured_formatting?.secondary_text || ""}
                      </p>
                    </div>
                  </button>
                ))}
                <div className="px-2 py-1 mt-2 border-t">
                  <p className="text-[10px] text-muted-foreground text-right">
                    Powered by Google
                  </p>
                </div>
              </>
            )}

            {!hasLocalResults &&
              !hasGoogleResults &&
              !isLoadingGoogle &&
              searchTerm.length >= 2 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No places found
                </p>
              )}

            {searchTerm.length >= 2 && isLoadingGoogle && !hasLocalResults && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
