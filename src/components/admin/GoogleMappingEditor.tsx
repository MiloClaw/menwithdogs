import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  GOOGLE_PLACE_TYPES, 
  PLACE_TYPE_CATEGORIES,
  getPlaceTypeLabel,
  getPlaceTypesByCategory,
} from '@/lib/google-places-types';
import type { GoogleMapping } from '@/hooks/useAdminInterests';

interface GoogleMappingEditorProps {
  mappings: GoogleMapping[];
  onChange: (mappings: GoogleMapping[]) => void;
  disabled?: boolean;
}

/**
 * Editor component for managing Google Places mappings
 * Allows adding, editing, and removing mapping entries
 */
export function GoogleMappingEditor({ mappings, onChange, disabled }: GoogleMappingEditorProps) {
  const handleAddMapping = () => {
    onChange([...mappings, { type: '', weight: 1.0 }]);
  };

  const handleRemoveMapping = (index: number) => {
    onChange(mappings.filter((_, i) => i !== index));
  };

  const handleUpdateMapping = (index: number, updates: Partial<GoogleMapping>) => {
    onChange(
      mappings.map((mapping, i) => 
        i === index ? { ...mapping, ...updates } : mapping
      )
    );
  };

  const hasEmptyMappings = mappings.some(m => !m.type);
  const hasDuplicateTypes = new Set(mappings.map(m => m.type)).size !== mappings.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Google Places Mappings</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddMapping}
          disabled={disabled}
          className="h-8"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Mapping
        </Button>
      </div>

      {mappings.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-center">
          <p className="text-sm text-muted-foreground">
            No mappings configured. Add mappings to connect this interest to Google Places.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {mappings.map((mapping, index) => (
            <MappingRow
              key={index}
              mapping={mapping}
              index={index}
              disabled={disabled}
              onUpdate={(updates) => handleUpdateMapping(index, updates)}
              onRemove={() => handleRemoveMapping(index)}
            />
          ))}
        </div>
      )}

      {/* Validation warnings */}
      {(hasEmptyMappings || hasDuplicateTypes) && (
        <div className="flex items-start gap-2 text-amber-600 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            {hasEmptyMappings && <p>Some mappings are missing a type.</p>}
            {hasDuplicateTypes && <p>Duplicate types detected.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

interface MappingRowProps {
  mapping: GoogleMapping;
  index: number;
  disabled?: boolean;
  onUpdate: (updates: Partial<GoogleMapping>) => void;
  onRemove: () => void;
}

function MappingRow({ mapping, index, disabled, onUpdate, onRemove }: MappingRowProps) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
      {/* Type selector */}
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor={`mapping-type-${index}`} className="text-xs text-muted-foreground">
            Place Type
          </Label>
          <Select
            value={mapping.type}
            onValueChange={(value) => onUpdate({ type: value })}
            disabled={disabled}
          >
            <SelectTrigger id={`mapping-type-${index}`} className="h-9">
              <SelectValue placeholder="Select type...">
                {mapping.type ? getPlaceTypeLabel(mapping.type) : 'Select type...'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {PLACE_TYPE_CATEGORIES.map((category) => {
                const types = getPlaceTypesByCategory(category.value);
                if (types.length === 0) return null;
                return (
                  <SelectGroup key={category.value}>
                    <SelectLabel className="text-xs font-semibold text-muted-foreground">
                      {category.label}
                    </SelectLabel>
                    {types.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={disabled}
          className="h-9 w-9 mt-6 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Weight and Keyword row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Weight slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor={`mapping-weight-${index}`} className="text-xs text-muted-foreground">
              Weight
            </Label>
            <span className="text-xs font-mono text-muted-foreground">
              {mapping.weight.toFixed(1)}
            </span>
          </div>
          <Slider
            id={`mapping-weight-${index}`}
            value={[mapping.weight]}
            onValueChange={([value]) => onUpdate({ weight: value })}
            min={0}
            max={1}
            step={0.1}
            disabled={disabled}
            className="mt-2"
          />
        </div>

        {/* Keyword input */}
        <div className="space-y-1.5">
          <Label htmlFor={`mapping-keyword-${index}`} className="text-xs text-muted-foreground">
            Keyword (optional)
          </Label>
          <Input
            id={`mapping-keyword-${index}`}
            value={mapping.keyword ?? ''}
            onChange={(e) => onUpdate({ keyword: e.target.value || undefined })}
            placeholder="e.g., trail, brunch"
            disabled={disabled}
            className="h-9"
            maxLength={50}
          />
        </div>
      </div>
    </div>
  );
}

export default GoogleMappingEditor;
