import { Users } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { TRAIL_COMPANIONS_OPTIONS } from '@/lib/profile-options';

interface TrailCompanionsSectionProps {
  selected: string | null;
  onChange: (value: string) => void;
  isUpdating?: boolean;
}

/**
 * Trail Companions Section
 * Single-select for who users typically go outdoors with.
 * Maps to return_preference column (repurposed for outdoor context).
 */
export function TrailCompanionsSection({
  selected,
  onChange,
  isUpdating = false,
}: TrailCompanionsSectionProps) {
  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users className="h-4 w-4 text-muted-foreground/70" />
          <h4 className="text-sm font-medium text-foreground">
            Who you go with
          </h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Private — just for better suggestions.
        </p>
      </div>

      <RadioGroup
        value={selected || ''}
        onValueChange={onChange}
        disabled={isUpdating}
        className="grid gap-2"
      >
        {TRAIL_COMPANIONS_OPTIONS.map((option) => (
          <div key={option.key} className="flex items-center space-x-3">
            <RadioGroupItem
              value={option.key}
              id={`companions-${option.key}`}
              className="h-5 w-5"
            />
            <Label
              htmlFor={`companions-${option.key}`}
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
