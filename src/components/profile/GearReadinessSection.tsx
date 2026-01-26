import { Backpack } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { GEAR_READINESS_OPTIONS } from '@/lib/profile-options';

interface GearReadinessSectionProps {
  selected: string | null;
  onChange: (value: string) => void;
  isUpdating?: boolean;
}

/**
 * Gear Readiness Section
 * Single-select for equipment level.
 * Uses new gear_readiness column.
 */
export function GearReadinessSection({
  selected,
  onChange,
  isUpdating = false,
}: GearReadinessSectionProps) {
  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Backpack className="h-4 w-4 text-muted-foreground/70" />
          <h4 className="text-sm font-medium text-foreground">
            Gear readiness
          </h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Matches you with trails that fit your setup.
        </p>
      </div>

      <RadioGroup
        value={selected || ''}
        onValueChange={onChange}
        disabled={isUpdating}
        className="grid gap-2"
      >
        {GEAR_READINESS_OPTIONS.map((option) => (
          <div key={option.key} className="flex items-center space-x-3">
            <RadioGroupItem
              value={option.key}
              id={`gear-${option.key}`}
              className="h-5 w-5"
            />
            <Label
              htmlFor={`gear-${option.key}`}
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
