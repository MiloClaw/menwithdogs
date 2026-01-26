import { CloudRain } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { WEATHER_FLEXIBILITY_OPTIONS } from '@/lib/profile-options';

interface WeatherFlexibilitySectionProps {
  selected: string | null;
  onChange: (value: string) => void;
  isUpdating?: boolean;
}

/**
 * Weather Flexibility Section
 * Single-select for willingness to go out in various conditions.
 * Uses new weather_flexibility column.
 */
export function WeatherFlexibilitySection({
  selected,
  onChange,
  isUpdating = false,
}: WeatherFlexibilitySectionProps) {
  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <CloudRain className="h-4 w-4 text-muted-foreground/70" />
          <h4 className="text-sm font-medium text-foreground">
            Weather flexibility
          </h4>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Helps us suggest alternatives when conditions change.
        </p>
      </div>

      <RadioGroup
        value={selected || ''}
        onValueChange={onChange}
        disabled={isUpdating}
        className="grid gap-2"
      >
        {WEATHER_FLEXIBILITY_OPTIONS.map((option) => (
          <div key={option.key} className="flex items-center space-x-3">
            <RadioGroupItem
              value={option.key}
              id={`weather-${option.key}`}
              className="h-5 w-5"
            />
            <Label
              htmlFor={`weather-${option.key}`}
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
