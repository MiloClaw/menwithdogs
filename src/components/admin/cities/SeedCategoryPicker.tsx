import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Heart, Info, Zap, DollarSign, MapPin, X, Plus, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { VENUE_CATEGORY_GROUPS, ANCHOR_VENUE_TYPES, EXTENDED_VENUE_TYPES, FOCUSED_VENUE_TYPES, INTEREST_ALIGNED_TYPES, DiscoveryPoint, KNOWN_NEIGHBORHOODS } from '@/hooks/useCitySeedWizard';
import GooglePlacesAutocomplete from '@/components/ui/google-places-autocomplete';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SeedCategoryPickerProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  radius: number;
  onRadiusChange: (radius: number) => void;
  searchKeywords?: string[];
  onKeywordsChange?: (keywords: string[]) => void;
  minRating?: number;
  onMinRatingChange?: (rating: number) => void;
  minReviewCount?: number;
  onMinReviewCountChange?: (count: number) => void;
  discoveryPoints?: DiscoveryPoint[];
  onAddDiscoveryPoint?: (point: Omit<DiscoveryPoint, 'id'>) => void;
  onRemoveDiscoveryPoint?: (id: string) => void;
  cityName?: string;
  cityLat?: number;
  cityLng?: number;
}

export function SeedCategoryPicker({
  selectedTypes,
  onTypesChange,
  radius,
  onRadiusChange,
  searchKeywords = [],
  onKeywordsChange,
  minRating = 4.0,
  onMinRatingChange,
  minReviewCount = 50,
  onMinReviewCountChange,
  discoveryPoints = [],
  onAddDiscoveryPoint,
  onRemoveDiscoveryPoint,
  cityName = '',
  cityLat,
  cityLng,
}: SeedCategoryPickerProps) {
  const { fetchDetails } = useGooglePlaces();
  const [neighborhoodSearch, setNeighborhoodSearch] = useState('');
  const [isAddingNeighborhood, setIsAddingNeighborhood] = useState(false);
  
  // Get known neighborhoods for this city
  const knownNeighborhoods = KNOWN_NEIGHBORHOODS[cityName] || [];
  // Filter out already-added neighborhoods
  const availableKnownNeighborhoods = knownNeighborhoods.filter(
    n => !discoveryPoints.some(p => p.label.includes(n))
  );

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const selectPreset = (preset: 'focused' | 'interest' | 'anchor' | 'extended' | 'none') => {
    switch (preset) {
      case 'focused':
        onTypesChange([...FOCUSED_VENUE_TYPES]);
        break;
      case 'interest':
        onTypesChange([...INTEREST_ALIGNED_TYPES]);
        break;
      case 'anchor':
        onTypesChange([...ANCHOR_VENUE_TYPES]);
        break;
      case 'extended':
        onTypesChange([...EXTENDED_VENUE_TYPES]);
        break;
      case 'none':
        onTypesChange([]);
        break;
    }
  };

  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    onKeywordsChange?.(keywords);
  };

  const handleNeighborhoodSelect = async (details: { place_id: string; lat?: number; lng?: number; formatted_address?: string; name?: string }) => {
    if (!onAddDiscoveryPoint || !details.lat || !details.lng) return;
    
    setIsAddingNeighborhood(true);
    try {
      onAddDiscoveryPoint({
        label: details.name || details.formatted_address || 'Unknown',
        lat: details.lat,
        lng: details.lng,
        placeId: details.place_id,
        isDefault: false,
      });
      setNeighborhoodSearch('');
    } finally {
      setIsAddingNeighborhood(false);
    }
  };

  const handleQuickAddNeighborhood = async (neighborhoodName: string) => {
    if (!onAddDiscoveryPoint) return;
    
    setIsAddingNeighborhood(true);
    try {
      // Search for the neighborhood to get its place_id
      const searchQuery = `${neighborhoodName}, ${cityName}`;
      
      const response = await supabase.functions.invoke('google-places-autocomplete', {
        body: {
          input: searchQuery,
          types: '(neighborhoods)',
          locationBias: cityLat && cityLng 
            ? { lat: cityLat, lng: cityLng, radius: 50000 }
            : undefined,
        },
      });
      
      if (response.error || !response.data?.predictions?.length) {
        toast.error(`Could not find "${neighborhoodName}"`);
        return;
      }
      
      const firstPrediction = response.data.predictions[0];
      
      // Fetch details to get coordinates
      const details = await fetchDetails(firstPrediction.place_id);
      
      if (!details?.lat || !details?.lng) {
        toast.error(`Could not get coordinates for "${neighborhoodName}"`);
        return;
      }
      
      // Add the discovery point
      onAddDiscoveryPoint({
        label: neighborhoodName,
        lat: details.lat,
        lng: details.lng,
        placeId: firstPrediction.place_id,
        isDefault: false,
      });
      
      toast.success(`Added ${neighborhoodName}`);
    } catch (error) {
      console.error('Error adding neighborhood:', error);
      toast.error(`Failed to add "${neighborhoodName}"`);
    } finally {
      setIsAddingNeighborhood(false);
    }
  };

  const radiusMiles = (radius / 1609.34).toFixed(1);
  const radiusOptions = [
    { meters: 8047, label: '5 mi' },
    { meters: 16093, label: '10 mi' },
    { meters: 24140, label: '15 mi' },
    { meters: 40234, label: '25 mi' },
  ];

  const ratingOptions = [
    { value: 0, label: 'Any' },
    { value: 3.5, label: '3.5★' },
    { value: 4.0, label: '4.0★' },
    { value: 4.5, label: '4.5★' },
  ];
  
  const reviewCountOptions = [
    { value: 0, label: 'Any' },
    { value: 25, label: '25+' },
    { value: 50, label: '50+' },
    { value: 100, label: '100+' },
  ];

  // Calculate estimated API cost - account for multiple discovery points
  const discoveryCalls = Math.ceil(selectedTypes.length / 5) * Math.max(discoveryPoints.length, 1);
  const estimatedPlaces = Math.min(discoveryCalls * 15, 100); // Rough estimate
  const discoveryCost = discoveryCalls * 0.04;
  const importCost = estimatedPlaces * 0.017;
  const totalEstimate = discoveryCost + importCost;

  return (
    <div className="space-y-6">
      {/* Discovery Points (Neighborhoods) */}
      {onAddDiscoveryPoint && onRemoveDiscoveryPoint && (
        <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <Label className="text-sm font-medium">Discovery Points</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    Search from specific neighborhoods for more targeted discovery. LGBTQ+ communities often cluster in specific areas.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Active discovery points */}
          <div className="flex flex-wrap gap-2">
            {discoveryPoints.map((point) => (
              <Badge
                key={point.id}
                variant={point.isDefault ? 'default' : 'secondary'}
                className="gap-1 pr-1"
              >
                <MapPin className="h-3 w-3" />
                {point.label}
                {point.isDefault && <span className="text-xs opacity-70">(center)</span>}
                <button
                  type="button"
                  onClick={() => onRemoveDiscoveryPoint(point.id)}
                  className="ml-1 p-0.5 rounded-full hover:bg-destructive/20 transition-colors"
                  title={`Remove ${point.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          {/* Known neighborhoods quick-add */}
          {availableKnownNeighborhoods.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Quick Add</Label>
              <div className="flex flex-wrap gap-1.5">
                {availableKnownNeighborhoods.slice(0, 6).map((name) => (
                  <Button
                    key={name}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => handleQuickAddNeighborhood(name)}
                    disabled={isAddingNeighborhood}
                  >
                    {isAddingNeighborhood ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                    {name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Neighborhood search */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Search Neighborhoods</Label>
            <GooglePlacesAutocomplete
              value={neighborhoodSearch}
              onChange={setNeighborhoodSearch}
              onPlaceSelect={handleNeighborhoodSelect}
              placeholder={`Search for neighborhoods in ${cityName || 'this city'}...`}
              types="(neighborhoods)"
              className="text-sm"
              disabled={isAddingNeighborhood}
              locationBias={cityLat && cityLng ? { lat: cityLat, lng: cityLng, radius: 50000 } : undefined}
            />
          </div>
        </div>
      )}

      {/* Presets */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Quick Presets</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={selectedTypes.length === FOCUSED_VENUE_TYPES.length && 
                     FOCUSED_VENUE_TYPES.every(t => selectedTypes.includes(t)) ? 'default' : 'outline'}
            onClick={() => selectPreset('focused')}
            className="gap-1"
          >
            <Zap className="h-3 w-3" />
            Focused ({FOCUSED_VENUE_TYPES.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={selectedTypes.length === INTEREST_ALIGNED_TYPES.length && 
                     INTEREST_ALIGNED_TYPES.every(t => selectedTypes.includes(t)) ? 'default' : 'outline'}
            onClick={() => selectPreset('interest')}
            className="gap-1"
          >
            <Heart className="h-3 w-3" />
            Interest-Aligned ({INTEREST_ALIGNED_TYPES.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={selectedTypes.length === ANCHOR_VENUE_TYPES.length && 
                     ANCHOR_VENUE_TYPES.every(t => selectedTypes.includes(t)) ? 'default' : 'outline'}
            onClick={() => selectPreset('anchor')}
          >
            Anchor ({ANCHOR_VENUE_TYPES.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={selectedTypes.length === EXTENDED_VENUE_TYPES.length && 
                     EXTENDED_VENUE_TYPES.every(t => selectedTypes.includes(t)) ? 'default' : 'outline'}
            onClick={() => selectPreset('extended')}
          >
            Extended ({EXTENDED_VENUE_TYPES.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => selectPreset('none')}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Category Groups */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Categories</Label>
        {VENUE_CATEGORY_GROUPS.map((group) => (
          <div key={group.label} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">{group.label}</span>
              <Badge variant="secondary" className="text-xs">
                {group.types.filter(t => selectedTypes.includes(t)).length}/{group.types.length}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {group.types.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => toggleType(type)}
                  />
                  <span className="text-sm capitalize">{type.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Radius */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Search Radius</Label>
          <span className="text-sm text-muted-foreground font-medium">{radiusMiles} mi</span>
        </div>
        <Slider
          value={[radius]}
          onValueChange={([value]) => onRadiusChange(value)}
          min={radiusOptions[0].meters}
          max={radiusOptions[radiusOptions.length - 1].meters}
          step={1609}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {radiusOptions.map((option) => (
            <button
              key={option.meters}
              type="button"
              className="hover:text-foreground transition-colors"
              onClick={() => onRadiusChange(option.meters)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quality Thresholds */}
      {onMinRatingChange && onMinReviewCountChange && (
        <div className="space-y-4 p-3 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Quality Threshold</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    Filter out low-quality venues before review. Reduces clutter by hiding places that don't meet your standards.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Min Rating</Label>
              <div className="flex gap-1">
                {ratingOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    size="sm"
                    variant={minRating === opt.value ? 'default' : 'outline'}
                    onClick={() => onMinRatingChange(opt.value)}
                    className="flex-1 text-xs px-2"
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Min Reviews</Label>
              <div className="flex gap-1">
                {reviewCountOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    size="sm"
                    variant={minReviewCount === opt.value ? 'default' : 'outline'}
                    onClick={() => onMinReviewCountChange(opt.value)}
                    className="flex-1 text-xs px-2"
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {(minRating === 0 && minReviewCount === 0) && (
            <p className="text-xs text-muted-foreground mt-2">
              💡 "Any" returns all discovered venues. Use filters in the review step to narrow down.
            </p>
          )}
        </div>
      )}

      {/* Keyword Configuration */}
      {onKeywordsChange && (
        <div className="space-y-3 p-3 border border-dashed rounded-lg">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-500" />
            <Label className="text-sm font-medium">Review Keywords (Optional)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    Configure keywords to scan for during the review step. You can scan individual places on-demand to find affirming venues.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="space-y-2">
            <Input
              placeholder="gay, LGBT, LGBTQ, affirming, queer, pride, inclusive"
              defaultValue={searchKeywords.join(', ')}
              onChange={(e) => handleKeywordsChange(e.target.value)}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated. Scan reviews on-demand during review step (~$0.008/place).
            </p>
          </div>
        </div>
      )}

      {/* Summary with Cost Estimate */}
      <div className="p-3 bg-muted/50 rounded-lg space-y-2">
        <p className="text-sm text-muted-foreground">
          Will search for <span className="font-medium text-foreground">{selectedTypes.length}</span> venue types
          within <span className="font-medium text-foreground">{radiusMiles} mi</span> of{' '}
          <span className="font-medium text-foreground">{discoveryPoints.length}</span> discovery point{discoveryPoints.length !== 1 ? 's' : ''}.
          {searchKeywords.length > 0 && (
            <span> <span className="font-medium text-foreground">{searchKeywords.length}</span> keywords ready for scanning.</span>
          )}
        </p>
        
        {/* Cost estimate */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
          <DollarSign className="h-3 w-3" />
          <span>
            Est. discovery: ~${totalEstimate.toFixed(2)}
            <span className="text-muted-foreground/70"> ({discoveryCalls} search + ~{estimatedPlaces} imports)</span>
          </span>
        </div>
        
        {discoveryPoints.length === 0 && (
          <p className="text-xs text-amber-600">
            ⚠️ Add at least one discovery point to begin searching.
          </p>
        )}
        
        {selectedTypes.length > 5 && discoveryPoints.length > 1 && (
          <p className="text-xs text-amber-600">
            ⚠️ {discoveryCalls} API calls needed. Consider fewer categories or points.
          </p>
        )}
      </div>
    </div>
  );
}
