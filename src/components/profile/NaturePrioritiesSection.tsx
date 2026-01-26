import { Mountain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { NATURE_PRIORITIES_OPTIONS } from '@/lib/profile-options';

interface NaturePrioritiesSectionProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  isUpdating?: boolean;
  maxSelections?: number;
}

/**
 * Nature Priorities Section
 * Multi-select (max 2) for what matters most when choosing a spot.
 * Maps to sensory_sensitivity column (repurposed for outdoor context).
 */
export function NaturePrioritiesSection({
  selected,
  onChange,
  isUpdating = false,
  maxSelections = 2,
}: NaturePrioritiesSectionProps) {
  const handleToggle = (key: string) => {
    if (isUpdating) return;
    
    if (selected.includes(key)) {
      onChange(selected.filter(k => k !== key));
    } else if (selected.length < maxSelections) {
      onChange([...selected, key]);
    }
    // Silently ignore if at max selections
  };

  const atMax = selected.length >= maxSelections;

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Mountain className="h-4 w-4 text-muted-foreground/70" />
          <h4 className="text-sm font-medium text-foreground">
            What matters most
          </h4>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Pick up to {maxSelections}. Helps us find the right spots.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {NATURE_PRIORITIES_OPTIONS.map((option) => {
          const isSelected = selected.includes(option.key);
          const isDisabled = isUpdating || (atMax && !isSelected);
          
          return (
            <label
              key={option.key}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all min-h-[44px]",
                isSelected 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/30",
                isDisabled && !isSelected && "opacity-50 cursor-not-allowed"
              )}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleToggle(option.key)}
                disabled={isDisabled && !isSelected}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
