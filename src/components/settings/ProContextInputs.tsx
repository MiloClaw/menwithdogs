import { useProContexts } from '@/hooks/useProContexts';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Pro Context inputs component.
 * 
 * Displays context options from pro_context_definitions, grouped by domain.
 * Selections emit 'pro_context' signals that feed into place context density.
 * 
 * UX RULES:
 * - Same interaction pattern as paid tuning inputs
 * - Selections are append-only (no "unselect" - calm, commitment-free)
 * - No urgency, no FOMO, no comparison to other users
 * - Context selections are NEVER exposed to admins or other users
 */
export function ProContextInputs() {
  const {
    groupedDefinitions,
    domainOrder,
    domainLabels,
    isLoading,
    toggle,
    isEnabled,
    isToggling,
    hasAnyContexts,
  } = useProContexts();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
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

  if (!hasAnyContexts) {
    return null; // No contexts defined yet - hide section
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-base font-medium text-foreground">
          Personalize Your Places
        </h3>
        <p className="text-sm text-muted-foreground">
          Tell us about the vibe you're looking for and we'll surface places that feel right.
        </p>
      </div>

      {domainOrder.map((domain) => {
        const definitions = groupedDefinitions[domain];
        if (!definitions?.length) return null;

        const domainMeta = domainLabels[domain] || {
          title: domain.charAt(0).toUpperCase() + domain.slice(1),
          description: '',
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
                const selected = isEnabled(def.key);

                return (
                  <Button
                    key={def.key}
                    variant={selected ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      'rounded-full min-h-[44px] px-4 transition-all',
                      selected && 'ring-2 ring-primary/20'
                    )}
                    onClick={() => toggle(def.key, def.domain)}
                    disabled={isToggling || selected} // Can't unselect (append-only)
                  >
                    {/* Format key as display label: snake_case -> Title Case */}
                    {def.key
                      .split('_')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}

      <p className="text-xs text-muted-foreground pt-2">
        This shapes which places feel right for you — never shared with anyone, never visible to others.
      </p>
    </div>
  );
}

export default ProContextInputs;
