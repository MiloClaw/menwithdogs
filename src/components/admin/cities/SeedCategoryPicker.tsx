import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { VENUE_CATEGORY_GROUPS, ANCHOR_VENUE_TYPES, EXTENDED_VENUE_TYPES } from '@/hooks/useCitySeedWizard';

interface SeedCategoryPickerProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  radius: number;
  onRadiusChange: (radius: number) => void;
}

export function SeedCategoryPicker({
  selectedTypes,
  onTypesChange,
  radius,
  onRadiusChange,
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

  const radiusKm = radius / 1000;
  const radiusOptions = [5000, 10000, 15000, 25000];

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
          <span className="text-sm text-muted-foreground font-medium">{radiusKm} km</span>
        </div>
        <Slider
          value={[radius]}
          onValueChange={([value]) => onRadiusChange(value)}
          min={5000}
          max={25000}
          step={5000}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {radiusOptions.map((r) => (
            <button
              key={r}
              type="button"
              className="hover:text-foreground transition-colors"
              onClick={() => onRadiusChange(r)}
            >
              {r / 1000}km
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Will search for <span className="font-medium text-foreground">{selectedTypes.length}</span> venue types
          within <span className="font-medium text-foreground">{radiusKm}km</span> of the city center.
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
