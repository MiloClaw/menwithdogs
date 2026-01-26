import { Compass } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ADVENTURE_STYLE_OPTIONS } from '@/lib/profile-options';

interface AdventureStyleSectionProps {
  selected: string | null;
  onChange: (value: string) => void;
  isUpdating?: boolean;
}

/**
 * Adventure Style Section
 * Single-select for comfort with remote vs. established trails.
 * Maps to uncertainty_tolerance column (repurposed for outdoor context).
 */
export function AdventureStyleSection({
  selected,
  onChange,
  isUpdating = false,
}: AdventureStyleSectionProps) {
  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Compass className="h-4 w-4 text-muted-foreground/70" />
          <h4 className="text-sm font-medium text-foreground">
            Trail comfort
          </h4>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Helps us suggest trails that match your style.
        </p>
      </div>

      <RadioGroup
        value={selected || ''}
        onValueChange={onChange}
        disabled={isUpdating}
        className="grid gap-2"
      >
        {ADVENTURE_STYLE_OPTIONS.map((option) => (
          <div key={option.key} className="flex items-center space-x-3">
            <RadioGroupItem
              value={option.key}
              id={`adventure-${option.key}`}
              className="h-5 w-5"
            />
            <Label
              htmlFor={`adventure-${option.key}`}
              className="text-sm font-normal cursor-pointer"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
