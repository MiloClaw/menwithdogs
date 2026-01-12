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
  const { isLoading, stepMeta } = useProSettings();

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

  return (
    <div className="space-y-6">
      {/* Step 1: About You */}
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

      <Separator className="opacity-50" />

      {/* Step 2: Who You Feel Comfortable Around */}
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

      <Separator className="opacity-50" />

      {/* Step 3: What You're Hoping to Find */}
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

      <Separator className="opacity-50" />

      {/* Step 4: How You Like to Spend Time Out */}
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

      <Separator className="opacity-50" />

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