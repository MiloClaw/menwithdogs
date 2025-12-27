import { INTEREST_OPTIONS, INTEREST_CATEGORIES, type Interest } from '@/lib/interests';
import { cn } from '@/lib/utils';

interface InterestPickerProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  max?: number;
  min?: number;
}

const InterestPicker = ({ 
  selected, 
  onChange, 
  max = 3, 
  min = 3 
}: InterestPickerProps) => {
  const handleToggle = (interest: Interest) => {
    if (selected.includes(interest.id)) {
      onChange(selected.filter(id => id !== interest.id));
    } else if (selected.length < max) {
      onChange([...selected, interest.id]);
    }
  };

  const getInterestsByCategory = (categoryId: string) => {
    return INTEREST_OPTIONS.filter(i => i.category === categoryId);
  };

  return (
    <div className="space-y-6">
      {/* Selection count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Select {min === max ? min : `${min}-${max}`} interests
        </span>
        <span className={cn(
          "font-medium",
          selected.length >= min ? "text-secondary" : "text-muted-foreground"
        )}>
          {selected.length} / {max} selected
        </span>
      </div>

      {/* Categories */}
      {INTEREST_CATEGORIES.map(category => (
        <div key={category.id} className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">
            {category.label}
          </h3>
          <div className="flex flex-wrap gap-2">
            {getInterestsByCategory(category.id).map(interest => {
              const isSelected = selected.includes(interest.id);
              const isDisabled = !isSelected && selected.length >= max;
              
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => handleToggle(interest)}
                  disabled={isDisabled}
                  className={cn(
                    "px-3 py-2 text-sm rounded-button border transition-colors min-h-[44px]",
                    isSelected 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-surface text-foreground border-border hover:border-primary/50",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {interest.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InterestPicker;
