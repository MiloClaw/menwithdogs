import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Heart, Info, Zap, DollarSign } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { VENUE_CATEGORY_GROUPS, ANCHOR_VENUE_TYPES, EXTENDED_VENUE_TYPES, FOCUSED_VENUE_TYPES } from '@/hooks/useCitySeedWizard';

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
}: SeedCategoryPickerProps) {
  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const selectPreset = (preset: 'focused' | 'anchor' | 'extended' | 'none') => {
    switch (preset) {
      case 'focused':
        onTypesChange([...FOCUSED_VENUE_TYPES]);
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

  const radiusMiles = (radius / 1609.34).toFixed(1);
  const radiusOptions = [
    { meters: 8047, label: '5 mi' },
    { meters: 16093, label: '10 mi' },
    { meters: 24140, label: '15 mi' },
    { meters: 40234, label: '25 mi' },
  ];

  const ratingOptions = [3.5, 4.0, 4.2, 4.5];

  // Calculate estimated API cost
  const discoveryCalls = Math.ceil(selectedTypes.length / 5);
  const estimatedPlaces = Math.min(discoveryCalls * 15, 60); // Rough estimate
  const discoveryCost = discoveryCalls * 0.04;
  const importCost = estimatedPlaces * 0.017;
  const totalEstimate = discoveryCost + importCost;

  return (
    <div className="space-y-6">
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
            variant={selectedTypes.length === ANCHOR_VENUE_TYPES.length ? 'outline' : 'outline'}
            onClick={() => selectPreset('anchor')}
          >
            Anchor ({ANCHOR_VENUE_TYPES.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={selectedTypes.length === EXTENDED_VENUE_TYPES.length ? 'outline' : 'outline'}
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
                {ratingOptions.map((r) => (
                  <Button
                    key={r}
                    type="button"
                    size="sm"
                    variant={minRating === r ? 'default' : 'outline'}
                    onClick={() => onMinRatingChange(r)}
                    className="flex-1 text-xs px-2"
                  >
                    {r}★
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Min Reviews</Label>
              <div className="flex gap-1">
                {[25, 50, 100, 200].map((count) => (
                  <Button
                    key={count}
                    type="button"
                    size="sm"
                    variant={minReviewCount === count ? 'default' : 'outline'}
                    onClick={() => onMinReviewCountChange(count)}
                    className="flex-1 text-xs px-2"
                  >
                    {count}+
                  </Button>
                ))}
              </div>
            </div>
          </div>
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
          within <span className="font-medium text-foreground">{radiusMiles} mi</span> of the city center.
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
        
        {selectedTypes.length > 5 && (
          <p className="text-xs text-amber-600">
            ⚠️ {discoveryCalls} API calls needed. Consider using "Focused" preset for fewer calls.
          </p>
        )}
      </div>
    </div>
  );
}
