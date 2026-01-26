import { Sun } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { TIME_OF_DAY_OPTIONS } from '@/lib/profile-options';

interface TimeOfDaySectionProps {
  selected: string | null;
  onChange: (value: string) => void;
  isUpdating?: boolean;
}

/**
 * Primary Time-of-Day Section
 * Single-select for when user typically visits places.
 * Feeds getTimeRelevanceBoost() in personalization for opening hours matching.
 */
export function TimeOfDaySection({
  selected,
  onChange,
  isUpdating = false,
}: TimeOfDaySectionProps) {
  return (
    <section className="bg-muted/30 rounded-xl p-6 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sun className="h-4 w-4 text-muted-foreground/70" />
          <h3 className="text-base font-medium tracking-wide text-foreground">
            When do you usually head out?
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          We'll prioritize places that match your rhythm.
        </p>
      </div>

      <RadioGroup
        value={selected || ''}
        onValueChange={onChange}
        disabled={isUpdating}
        className="grid gap-3"
      >
        {TIME_OF_DAY_OPTIONS.map((option) => (
          <div key={option.key} className="flex items-center space-x-3">
            <RadioGroupItem
              value={option.key}
              id={`time-${option.key}`}
              className="h-5 w-5"
            />
            <Label
              htmlFor={`time-${option.key}`}
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
