import { useProSettings } from '@/hooks/useProSettings';
import { ProOptionChips } from './ProOptionChips';

/**
 * Step 4: How You Like to Spend Time Out
 * 
 * influence_mode = 'boost' - these options DO affect place rankings.
 * 
 * Sections:
 * - style.energy (single select)
 * - style.environment (multi select)
 * - style.timing (single select)
 */
export function ProStepSpacePreferences() {
  const { optionsByStep, getVisibleSections, sectionMeta } = useProSettings();
  
  const stepOptions = optionsByStep[4] ?? {};
  const visibleSections = getVisibleSections(4);

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
