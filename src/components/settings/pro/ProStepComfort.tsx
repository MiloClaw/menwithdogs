import { useProSettings } from '@/hooks/useProSettings';
import { ProOptionChips } from './ProOptionChips';

/**
 * Step 2: Who You Feel Comfortable Around
 * 
 * influence_mode = 'boost' - these options DO affect place rankings.
 * 
 * Sections:
 * - seeking.comfort (multi select) - always visible
 * - seeking.community (multi select) - conditional on lgbtq_friendly
 * - seeking.relationship_context (single select) - conditional on lgbtq_friendly + relationship
 */
export function ProStepComfort() {
  const { optionsByStep, getVisibleSections, sectionMeta } = useProSettings();
  
  const stepOptions = optionsByStep[2] ?? {};
  const visibleSections = getVisibleSections(2);

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
            <ProOptionChips options={options} inputType={options[0]?.input_type as 'single' | 'multi' ?? 'multi'} />
          </div>
        );
      })}
    </div>
  );
}
