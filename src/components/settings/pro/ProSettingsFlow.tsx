import { Separator } from '@/components/ui/separator';
import { useProSettings } from '@/hooks/useProSettings';
import { ProStepAboutYou } from './ProStepAboutYou';
import { ProStepComfort } from './ProStepComfort';
import { ProStepIntent } from './ProStepIntent';
import { ProStepSpacePreferences } from './ProStepSpacePreferences';
import { ProSettingsSummary } from './ProSettingsSummary';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Pro Settings 4-Step Flow
 * 
 * LOCKED UX (do not change order):
 * Step 1: About You (identity - overlap only, never ranks)
 * Step 2: Who You Feel Comfortable Around (seeking - boosts places)
 * Step 3: What You're Hoping to Find (intent - boosts places)
 * Step 4: How You Like to Spend Time Out (style - boosts places)
 * 
 * CRITICAL INVARIANTS:
 * - Step 1 options have influence_mode = 'overlap' and NEVER directly rank places
 * - All other steps have influence_mode = 'boost'
 * - Conditional logic (show_condition) is evaluated from DB, not hardcoded
 * - All selections are private and never exposed to admins
 */
export function ProSettingsFlow() {
  const { isLoading, stepMeta, getVisibleSections } = useProSettings();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-64" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-11 w-24 rounded-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Determine which steps have visible content
  const hasStep1Content = getVisibleSections(1).length > 0;
  const hasStep2Content = getVisibleSections(2).length > 0;
  const hasStep3Content = getVisibleSections(3).length > 0;
  const hasStep4Content = getVisibleSections(4).length > 0;

  // Track if any step has content to show (for separator logic)
  const visibleSteps = [
    hasStep1Content && 1,
    hasStep2Content && 2,
    hasStep3Content && 3,
    hasStep4Content && 4,
  ].filter(Boolean) as number[];

  return (
    <div className="space-y-6">
      {/* Step 1: About You */}
      {hasStep1Content && (
        <section className="space-y-4">
          <div>
            <h4 className="text-base font-medium text-foreground">
              {stepMeta[1]?.title}
            </h4>
            {stepMeta[1]?.helperText && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {stepMeta[1].helperText}
              </p>
            )}
          </div>
          <ProStepAboutYou />
        </section>
      )}

      {hasStep1Content && visibleSteps.length > 1 && visibleSteps[0] === 1 && (
        <Separator className="opacity-50" />
      )}

      {/* Step 2: Who You Feel Comfortable Around */}
      {hasStep2Content && (
        <section className="space-y-4">
          <div>
            <h4 className="text-base font-medium text-foreground">
              {stepMeta[2]?.title}
            </h4>
            {stepMeta[2]?.helperText && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {stepMeta[2].helperText}
              </p>
            )}
          </div>
          <ProStepComfort />
        </section>
      )}

      {hasStep2Content && (hasStep3Content || hasStep4Content) && (
        <Separator className="opacity-50" />
      )}

      {/* Step 3: What You're Hoping to Find */}
      {hasStep3Content && (
        <section className="space-y-4">
          <div>
            <h4 className="text-base font-medium text-foreground">
              {stepMeta[3]?.title}
            </h4>
            {stepMeta[3]?.helperText && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {stepMeta[3].helperText}
              </p>
            )}
          </div>
          <ProStepIntent />
        </section>
      )}

      {hasStep3Content && hasStep4Content && (
        <Separator className="opacity-50" />
      )}

      {/* Step 4: How You Like to Spend Time Out */}
      {hasStep4Content && (
        <section className="space-y-4">
          <div>
            <h4 className="text-base font-medium text-foreground">
              {stepMeta[4]?.title}
            </h4>
            {stepMeta[4]?.helperText && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {stepMeta[4].helperText}
              </p>
            )}
          </div>
          <ProStepSpacePreferences />
        </section>
      )}

      {visibleSteps.length > 0 && (
        <Separator className="opacity-50" />
      )}

      {/* Summary */}
      <ProSettingsSummary />

      {/* Privacy footer — place-centric trust line */}
      <p className="text-xs text-muted-foreground/70 leading-relaxed">
        Private by default. This works at the place level — not the person level. You can change these anytime.
      </p>
    </div>
  );
}

export default ProSettingsFlow;