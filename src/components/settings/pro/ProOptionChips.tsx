import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProSettings, ProSettingsOption } from '@/hooks/useProSettings';

interface ProOptionChipsProps {
  options: ProSettingsOption[];
  inputType?: 'single' | 'multi';
}

/**
 * Reusable chip component for Pro settings options.
 * Handles both single and multi select based on input_type.
 * 
 * Mobile-first:
 * - Minimum touch target 44px
 * - Pill/chip layout with wrapping
 * - Clear selected state
 * 
 * Micro-interaction principles:
 * - Gentle, not gamified ("the system noticed" not "you scored something")
 * - Fast transitions (100ms) for immediate feedback
 * - Subtle opacity and ring changes
 * - active:scale-95 for tactile press response
 * - Single-select sections show "Choose one" hint and disable during transition
 */
export function ProOptionChips({ options, inputType = 'multi' }: ProOptionChipsProps) {
  const { select, isSelected, shouldShow } = useProSettings();
  const [pendingSection, setPendingSection] = useState(false);
  const [previousKey, setPreviousKey] = useState<string | null>(null);

  // Filter to only visible options
  const visibleOptions = options.filter(shouldShow);

  if (visibleOptions.length === 0) {
    return null;
  }

  const handleSelect = (option: ProSettingsOption) => {
    // For single-select, track exit animation and disable section
    if (inputType === 'single') {
      const currentlySelected = visibleOptions.find(o => isSelected(o.key));
      if (currentlySelected && currentlySelected.key !== option.key) {
        setPreviousKey(currentlySelected.key);
        setTimeout(() => setPreviousKey(null), 150);
      }
      setPendingSection(true);
      setTimeout(() => setPendingSection(false), 200);
    }
    
    select(option);
  };

  return (
    <div className="space-y-1.5">
      {inputType === 'single' && (
        <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wide">
          Choose one
        </span>
      )}
      <div className="flex flex-wrap gap-2">
        {visibleOptions.map((option) => {
          const selected = isSelected(option.key);
          const isExiting = previousKey === option.key;
          const isDisabled = inputType === 'single' ? pendingSection : false;

          return (
            <Button
              key={option.key}
              variant={selected ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'rounded-full min-h-[44px] px-5 transition-all duration-100 ease-out gap-2',
                'active:scale-95',
                selected && 'ring-2 ring-primary/15 ring-offset-1 shadow-sm',
                !selected && 'hover:opacity-90',
                isExiting && 'opacity-50 transition-opacity duration-150'
              )}
              onClick={() => handleSelect(option)}
              disabled={isDisabled}
            >
              {option.icon && <span className="text-base">{option.icon}</span>}
              <span>{option.label || option.key}</span>
              {selected && <Check className="h-3 w-3 ml-0.5" />}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
