import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Heart, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { VENUE_CATEGORY_GROUPS, ANCHOR_VENUE_TYPES, EXTENDED_VENUE_TYPES } from '@/hooks/useCitySeedWizard';

interface SeedCategoryPickerProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  radius: number;
  onRadiusChange: (radius: number) => void;
  scanReviews?: boolean;
  onScanReviewsChange?: (scan: boolean) => void;
  searchKeywords?: string[];
  onKeywordsChange?: (keywords: string[]) => void;
}

export function SeedCategoryPicker({
  selectedTypes,
  onTypesChange,
  radius,
  onRadiusChange,
  scanReviews = false,
  onScanReviewsChange,
  searchKeywords = [],
  onKeywordsChange,
}: SeedCategoryPickerProps) {
  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const selectPreset = (preset: 'anchor' | 'extended' | 'none') => {
    switch (preset) {
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

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Quick Presets</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={selectedTypes.length === ANCHOR_VENUE_TYPES.length ? 'default' : 'outline'}
            onClick={() => selectPreset('anchor')}
          >
            Anchor Venues ({ANCHOR_VENUE_TYPES.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={selectedTypes.length === EXTENDED_VENUE_TYPES.length ? 'default' : 'outline'}
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

      {/* Keyword Scanning */}
      {onScanReviewsChange && onKeywordsChange && (
        <div className="space-y-3 p-3 border border-dashed rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              <Label htmlFor="scan-reviews" className="text-sm font-medium cursor-pointer">
                Scan Reviews for Keywords
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      During import, scan Google reviews for keywords to help identify affirming venues. 
                      Additional API cost applies (~$0.025/place).
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              id="scan-reviews"
              checked={scanReviews}
              onCheckedChange={onScanReviewsChange}
            />
          </div>
          
          {scanReviews && (
            <div className="space-y-2">
              <Label htmlFor="keywords" className="text-sm text-muted-foreground">
                Keywords (comma-separated)
              </Label>
              <Input
                id="keywords"
                placeholder="gay, LGBT, LGBTQ, affirming, queer, pride, inclusive"
                defaultValue={searchKeywords.join(', ')}
                onChange={(e) => handleKeywordsChange(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Up to 5 reviews per place will be scanned for these terms.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Will search for <span className="font-medium text-foreground">{selectedTypes.length}</span> venue types
          within <span className="font-medium text-foreground">{radiusMiles} mi</span> of the city center.
          {scanReviews && searchKeywords.length > 0 && (
            <span> Reviews will be scanned for <span className="font-medium text-foreground">{searchKeywords.length}</span> keywords.</span>
          )}
        </p>
        {selectedTypes.length > 5 && (
          <p className="text-xs text-muted-foreground mt-1">
            Note: Multiple API calls will be made for larger category selections.
          </p>
        )}
      </div>
    </div>
  );
}
