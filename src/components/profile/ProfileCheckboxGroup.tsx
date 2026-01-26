import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { ProfileOption } from '@/lib/profile-options';

interface ProfileCheckboxGroupProps {
  options: ProfileOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
  columns?: 1 | 2;
}

/**
 * Reusable checkbox group for profile preferences
 * Touch-friendly, instant-save compatible
 */
export function ProfileCheckboxGroup({
  options,
  selected,
  onChange,
  disabled = false,
  columns = 2,
}: ProfileCheckboxGroupProps) {
  const handleToggle = (key: string) => {
    if (disabled) return;
    
    const newSelected = selected.includes(key)
      ? selected.filter(k => k !== key)
      : [...selected, key];
    
    onChange(newSelected);
  };

  return (
    <div className={cn(
      "grid gap-2",
      columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
    )}>
      {options.map(opt => {
        const isSelected = selected.includes(opt.key);
        return (
          <label
            key={opt.key}
            className={cn(
              "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all min-h-[52px]",
              isSelected 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/30",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <Checkbox 
              checked={isSelected} 
              onCheckedChange={() => handleToggle(opt.key)}
              disabled={disabled}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}
