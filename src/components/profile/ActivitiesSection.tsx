import { Activity } from 'lucide-react';
import { ACTIVITY_OPTIONS } from '@/lib/profile-options';
import { ProfileCheckboxGroup } from './ProfileCheckboxGroup';

interface ActivitiesSectionProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  isUpdating?: boolean;
}

/**
 * Section 2: Which of these do you actually do?
 * Multi-select checkboxes for activity preferences
 */
export function ActivitiesSection({
  selected,
  onChange,
  isUpdating = false,
}: ActivitiesSectionProps) {
  return (
    <section className="bg-muted/30 rounded-xl p-6 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Activity className="h-4 w-4 text-muted-foreground/70" />
          <h3 className="text-base font-medium tracking-wide text-foreground">
            Which of these do you actually do?
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Select all that apply. Helps us recommend better places.
        </p>
      </div>

      <ProfileCheckboxGroup
        options={ACTIVITY_OPTIONS}
        selected={selected}
        onChange={onChange}
        disabled={isUpdating}
        columns={2}
      />
    </section>
  );
}
