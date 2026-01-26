import { Compass } from 'lucide-react';
import { PLACE_USAGE_OPTIONS } from '@/lib/profile-options';
import { ProfileCheckboxGroup } from './ProfileCheckboxGroup';

interface PlaceUsageSectionProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  isUpdating?: boolean;
}

/**
 * Section 3: When you go to these places, it's usually for...
 * Multi-select checkboxes for usage patterns
 */
export function PlaceUsageSection({
  selected,
  onChange,
  isUpdating = false,
}: PlaceUsageSectionProps) {
  return (
    <section className="bg-muted/30 rounded-xl p-6 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Compass className="h-4 w-4 text-muted-foreground/70" />
          <h3 className="text-base font-medium tracking-wide text-foreground">
            When you head outdoors, it's usually for...
          </h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Select all that apply.
        </p>
      </div>

      <ProfileCheckboxGroup
        options={PLACE_USAGE_OPTIONS}
        selected={selected}
        onChange={onChange}
        disabled={isUpdating}
        columns={2}
      />
    </section>
  );
}
