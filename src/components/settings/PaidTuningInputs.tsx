import { usePaidTuning } from '@/hooks/usePaidTuning';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const DOMAIN_LABELS: Record<string, { title: string; description: string }> = {
  context: {
    title: 'Your Context',
    description: 'Help us understand what environments work best for you',
  },
  activity: {
    title: 'Activities',
    description: 'Tell us about your routines and hobbies',
  },
  environment: {
    title: 'Environment',
    description: 'Preferences for the spaces you visit',
  },
};

const DOMAIN_ORDER = ['context', 'activity', 'environment'];

/**
 * Paid tuning inputs component.
 * 
 * UX RULES (from project knowledge):
 * - Same interaction pattern as free Intent Preferences
 * - No urgency, no FOMO, no comparison to other users
 * - Selections emit signals, not stateful updates
 * - No tooltips or "why this helps" explanations yet
 */
export function PaidTuningInputs() {
  const { groupedDefinitions, isLoading, toggle, isEnabled, isToggling } = usePaidTuning();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-10 w-28 rounded-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {DOMAIN_ORDER.map((domain) => {
        const definitions = groupedDefinitions[domain];
        if (!definitions?.length) return null;

        const domainMeta = DOMAIN_LABELS[domain] || { 
          title: domain, 
          description: '' 
        };

        return (
          <div key={domain} className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-foreground">
                {domainMeta.title}
              </h4>
              {domainMeta.description && (
                <p className="text-xs text-muted-foreground mt-0.5">
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

      <p className="text-xs text-muted-foreground pt-2">
        These selections help personalize your recommendations. 
        You can change them anytime.
      </p>
    </div>
  );
}

export default PaidTuningInputs;
