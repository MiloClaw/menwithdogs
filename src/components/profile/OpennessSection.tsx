import { Users, Lock } from 'lucide-react';
import { OPENNESS_OPTIONS } from '@/lib/profile-options';
import { ProfileCheckboxGroup } from './ProfileCheckboxGroup';

interface OpennessSectionProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  isUpdating?: boolean;
}

/**
 * Section 5: Connection readiness — how open are you to meeting new people?
 * Distinct from "who you go with" (TrailCompanions) or PRO social energy.
 * Private preferences - never exposed to other users.
 */
export function OpennessSection({
  selected,
  onChange,
  isUpdating = false,
}: OpennessSectionProps) {
  return (
    <section className="bg-muted/30 rounded-xl p-6 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users className="h-4 w-4 text-muted-foreground/70" />
          <h3 className="text-base font-medium tracking-wide text-foreground">
            How open are you to meeting new people?
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <Lock className="h-3 w-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Private. Never shared. Can be changed anytime.
          </p>
        </div>
      </div>

      <ProfileCheckboxGroup
        options={OPENNESS_OPTIONS}
        selected={selected}
        onChange={onChange}
        disabled={isUpdating}
        columns={1}
      />
    </section>
  );
}
