import { Clock } from 'lucide-react';
import { TIMING_OPTIONS } from '@/lib/profile-options';
import { ProfileCheckboxGroup } from './ProfileCheckboxGroup';

interface TimingSectionProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  isUpdating?: boolean;
}

/**
 * Section 4: When do you usually head out?
 * Multi-select checkboxes for timing preferences
 */
export function TimingSection({
  selected,
  onChange,
  isUpdating = false,
}: TimingSectionProps) {
  return (
    <section className="bg-muted/30 rounded-xl p-6 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Clock className="h-4 w-4 text-muted-foreground/70" />
          <h3 className="text-base font-medium tracking-wide text-foreground">
            When do you usually head out?
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Multiple selections allowed.
        </p>
      </div>

      <ProfileCheckboxGroup
        options={TIMING_OPTIONS}
        selected={selected}
        onChange={onChange}
        disabled={isUpdating}
        columns={2}
      />
    </section>
  );
}
