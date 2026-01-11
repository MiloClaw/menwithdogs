import { usePaidTuning } from '@/hooks/usePaidTuning';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import ProContextInputs from './ProContextInputs';

// Place-first domain labels - describe places, not user configuration
const DOMAIN_LABELS: Record<string, { title: string; description: string }> = {
  context: {
    title: 'Your rhythm',
    description: 'What kind of schedule fits your life?',
  },
  activity: {
    title: 'What you enjoy',
    description: 'Places that match your interests.',
  },
  environment: {
    title: 'Your vibe',
    description: 'The feel of places you prefer.',
  },
};

const DOMAIN_ORDER = ['context', 'activity', 'environment'];

/**
 * Paid tuning inputs component.
 * 
 * PHASE 2 UX RULES:
 * - Place-first, descriptive language (not configuration metaphors)
 * - Same interaction pattern as free preferences
 * - No urgency, no FOMO, no comparison to other users
 * - Selections emit signals, not stateful updates
 */
export function PaidTuningInputs() {
  const { groupedDefinitions, isLoading, toggle, isEnabled, isToggling } = usePaidTuning();

  if (isLoading) {
    return (
      <div className="space-y-6 pt-2">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-10 w-24 rounded-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Existing paid tuning inputs */}
      {DOMAIN_ORDER.map((domain) => {
        const definitions = groupedDefinitions[domain];
        if (!definitions?.length) return null;

        const domainMeta = DOMAIN_LABELS[domain] || { 
          title: domain, 
          description: '' 
        };

        return (
          <div key={domain} className="space-y-2">
            <div>
              <h4 className="text-sm font-medium text-foreground">
                {domainMeta.title}
              </h4>
              {domainMeta.description && (
                <p className="text-xs text-muted-foreground">
                  {domainMeta.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {definitions.map((def) => {
                const selected = isEnabled(def.tuning_key);

                return (
                  <Button
                    key={def.tuning_key}
                    variant={selected ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      'rounded-full min-h-[44px] px-4 transition-all',
                      selected && 'ring-2 ring-primary/20'
                    )}
                    onClick={() => toggle(def.tuning_key, def.domain)}
                    disabled={isToggling}
                  >
                    {def.icon && <span className="mr-1.5">{def.icon}</span>}
                    {def.label}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Separator before Pro Contexts */}
      <Separator />

      {/* Pro Context Inputs */}
      <ProContextInputs />

      <p className="text-xs text-muted-foreground">
        You can change these anytime.
      </p>
    </div>
  );
}

export default PaidTuningInputs;
