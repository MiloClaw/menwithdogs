import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProSettings, ProSettingsOption } from '@/hooks/useProSettings';

interface ProOptionChipsProps {
  options: ProSettingsOption[];
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
 * - Slow transitions (200-300ms)
 * - Subtle opacity and ring changes
 */
export function ProOptionChips({ options }: ProOptionChipsProps) {
  const { select, isSelected, shouldShow, isUpdating } = useProSettings();

  // Filter to only visible options
  const visibleOptions = options.filter(shouldShow);

  if (visibleOptions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {visibleOptions.map((option) => {
        const selected = isSelected(option.key);

        return (
          <Button
            key={option.key}
            variant={selected ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'rounded-full min-h-[44px] px-5 transition-all duration-200 ease-out gap-2',
              selected && 'ring-2 ring-primary/15 ring-offset-1 shadow-sm',
              !selected && 'hover:opacity-90'
            )}
            onClick={() => select(option)}
            disabled={isUpdating}
          >
            {option.icon && <span className="text-base">{option.icon}</span>}
            <span>{option.label || option.key}</span>
            {selected && <Check className="h-3 w-3 ml-0.5" />}
          </Button>
        );
      })}
    </div>
  );
}