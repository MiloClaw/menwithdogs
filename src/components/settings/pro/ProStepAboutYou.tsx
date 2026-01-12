import { useProSettings } from '@/hooks/useProSettings';
import { ProOptionChips } from './ProOptionChips';

/**
 * Step 1: About You
 * 
 * CRITICAL: All options in this step have influence_mode = 'overlap'.
 * They NEVER directly rank places - only inform overlap modeling.
 * 
 * Sections:
 * - about.gender (single select)
 * - about.age (single select)
 * - about.relationship (single select)
 * - about.orientation (single select, optional, sensitive)
 */
export function ProStepAboutYou() {
  const { optionsByStep, getVisibleSections, sectionMeta } = useProSettings();
  
  const stepOptions = optionsByStep[1] ?? {};
  const visibleSections = getVisibleSections(1);

  if (visibleSections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {visibleSections.map((section) => {
        const options = stepOptions[section] ?? [];
        const meta = sectionMeta[section];

        return (
          <div key={section} className="space-y-2">
            {meta?.title && (
              <span className="text-xs font-medium text-muted-foreground">
                {meta.title}
              </span>
            )}
            <ProOptionChips options={options} />
          </div>
        );
      })}
    </div>
  );
}
