import { TrendingUp } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { EFFORT_PREFERENCE_OPTIONS } from '@/lib/profile-options';

interface EffortPreferenceSectionProps {
  selected: string | null;
  onChange: (value: string) => void;
  isUpdating?: boolean;
}

/**
 * Effort Preference Section
 * Single-select for intensity level preference.
 * Maps to planning_horizon column (repurposed for outdoor context).
 */
export function EffortPreferenceSection({
  selected,
  onChange,
  isUpdating = false,
}: EffortPreferenceSectionProps) {
  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-4 w-4 text-muted-foreground/70" />
          <h4 className="text-sm font-medium text-foreground">
            Effort level
          </h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Helps us match difficulty levels.
        </p>
      </div>

      <RadioGroup
        value={selected || ''}
        onValueChange={onChange}
        disabled={isUpdating}
        className="grid gap-2"
      >
        {EFFORT_PREFERENCE_OPTIONS.map((option) => (
          <div key={option.key} className="flex items-center space-x-3">
            <RadioGroupItem
              value={option.key}
              id={`effort-${option.key}`}
              className="h-5 w-5"
            />
            <Label
              htmlFor={`effort-${option.key}`}
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
