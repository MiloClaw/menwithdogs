import { useState } from 'react';
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
 * - Fast transitions (100ms) for immediate feedback
 * - Subtle opacity and ring changes
 * - active:scale-95 for tactile press response
 */
export function ProOptionChips({ options }: ProOptionChipsProps) {
  const { select, isSelected, shouldShow } = useProSettings();
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  // Filter to only visible options
  const visibleOptions = options.filter(shouldShow);

  if (visibleOptions.length === 0) {
    return null;
  }

  const handleSelect = (option: ProSettingsOption) => {
    setPendingKey(option.key);
    select(option);
    // Clear pending after a short delay to allow animation
    setTimeout(() => setPendingKey(null), 150);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {visibleOptions.map((option) => {
        const selected = isSelected(option.key);
        const isPending = pendingKey === option.key;

        return (
          <Button
            key={option.key}
            variant={selected ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'rounded-full min-h-[44px] px-5 transition-all duration-100 ease-out gap-2',
              'active:scale-95',
              selected && 'ring-2 ring-primary/15 ring-offset-1 shadow-sm',
              !selected && 'hover:opacity-90'
            )}
            onClick={() => handleSelect(option)}
            disabled={isPending}
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