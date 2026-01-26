import { MapPin } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DISTANCE_OPTIONS } from '@/lib/profile-options';

interface DistanceSectionProps {
  selected: string | null;
  onChange: (value: string) => void;
  isUpdating?: boolean;
}

/**
 * Distance Preference Section
 * Single-select for how far user is willing to travel.
 * Directly affects proximity weighting in personalization.
 */
export function DistanceSection({
  selected,
  onChange,
  isUpdating = false,
}: DistanceSectionProps) {
  return (
    <section className="bg-muted/30 rounded-xl p-6 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="h-4 w-4 text-muted-foreground/70" />
          <h3 className="text-base font-medium tracking-wide text-foreground">
            How far are you willing to travel?
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Helps us prioritize places at the right distance for you.
        </p>
      </div>

      <RadioGroup
        value={selected || ''}
        onValueChange={onChange}
        disabled={isUpdating}
        className="grid gap-3"
      >
        {DISTANCE_OPTIONS.map((option) => (
          <div key={option.key} className="flex items-center space-x-3">
            <RadioGroupItem
              value={option.key}
              id={`distance-${option.key}`}
              className="h-5 w-5"
            />
            <Label
              htmlFor={`distance-${option.key}`}
              className="text-sm font-normal cursor-pointer"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </section>
  );
}
