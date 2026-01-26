import { Compass } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { GEO_AFFINITY_OPTIONS } from '@/lib/profile-options';

interface GeoAffinitySectionProps {
  selected: string | null;
  onChange: (value: string) => void;
  isUpdating?: boolean;
}

/**
 * Geographic Affinity Section
 * Single-select for exploration scope preference.
 * Affects exploration radius in ranking.
 */
export function GeoAffinitySection({
  selected,
  onChange,
  isUpdating = false,
}: GeoAffinitySectionProps) {
  return (
    <section className="bg-muted/30 rounded-xl p-6 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Compass className="h-4 w-4 text-muted-foreground/70" />
          <h3 className="text-base font-medium tracking-wide text-foreground">
            How spread out are your favorite spots?
          </h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Helps us know whether to show places nearby or farther out.
        </p>
      </div>

      <RadioGroup
        value={selected || ''}
        onValueChange={onChange}
        disabled={isUpdating}
        className="grid gap-3"
      >
        {GEO_AFFINITY_OPTIONS.map((option) => (
          <div key={option.key} className="flex items-center space-x-3">
            <RadioGroupItem
              value={option.key}
              id={`geo-${option.key}`}
              className="h-5 w-5"
            />
            <Label
              htmlFor={`geo-${option.key}`}
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
