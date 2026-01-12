import { useProSettings } from '@/hooks/useProSettings';
import { ProOptionChips } from './ProOptionChips';

/**
 * Step 3: What You're Hoping to Find
 * 
 * influence_mode = 'boost' - these options DO affect place rankings.
 * 
 * Sections:
 * - intent.goal (multi select with icons)
 */
export function ProStepIntent() {
  const { optionsByStep, getVisibleSections, sectionMeta } = useProSettings();
  
  const stepOptions = optionsByStep[3] ?? {};
  const visibleSections = getVisibleSections(3);

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
