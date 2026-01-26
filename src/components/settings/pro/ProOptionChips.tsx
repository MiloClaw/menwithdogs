import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProSettings, ProSettingsOption } from '@/hooks/useProSettings';
import {
  Sprout, Mountain, MountainSnow, User, Users, UsersRound,
  Snail, Scale, Flame, TreePine, Meh, PartyPopper, Handshake,
  Heart, PersonStanding, Sunrise, BookOpen, Trophy, Footprints,
  Bike, Dumbbell, Waves, Ship, Snowflake, Camera,
  type LucideIcon
} from 'lucide-react';

// Mapping from Lucide icon names (stored in DB) to actual components
const PRO_OPTION_ICONS: Record<string, LucideIcon> = {
  Sprout,
  Mountain,
  MountainSnow,
  User,
  Users,
  UsersRound,
  Snail,
  Scale,
  Flame,
  TreePine,
  Meh,
  PartyPopper,
  Handshake,
  Heart,
  PersonStanding,
  Sunrise,
  BookOpen,
  Trophy,
  Footprints,
  Bike,
  Dumbbell,
  Waves,
  Ship,
  Snowflake,
  Camera,
};

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

  // Render icon from Lucide mapping or fallback to text
  const renderIcon = (iconName: string | null) => {
    if (!iconName) return null;
    
    const IconComponent = PRO_OPTION_ICONS[iconName];
    if (IconComponent) {
      return <IconComponent className="h-4 w-4" />;
    }
    
    // Fallback for unmapped icons (e.g., legacy emoji strings)
    return <span className="text-base">{iconName}</span>;
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
              {renderIcon(option.icon)}
              <span>{option.label || option.key}</span>
              {selected && <Check className="h-3 w-3 ml-0.5" />}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
