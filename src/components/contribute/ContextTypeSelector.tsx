import { useContextTypes, ContextType } from '@/hooks/useContextTypes';
import { Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ContextTypeSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const MAX_SELECTIONS = 3;

export function ContextTypeSelector({ value, onChange }: ContextTypeSelectorProps) {
  const { contextTypes, loading } = useContextTypes();

  const toggleType = (key: string) => {
    if (value.includes(key)) {
      onChange(value.filter((k) => k !== key));
    } else if (value.length < MAX_SELECTIONS) {
      onChange([...value, key]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium mb-1">What kind of context are you sharing?</h2>
        <p className="text-sm text-muted-foreground">
          Select up to {MAX_SELECTIONS} types that best describe your contribution.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {contextTypes.map((type) => {
          const isSelected = value.includes(type.key);
          const isDisabled = !isSelected && value.length >= MAX_SELECTIONS;

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => toggleType(type.key)}
              disabled={isDisabled}
              className={cn(
                'relative text-left p-4 rounded-xl border transition-all min-h-[72px]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:bg-muted/50',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <span className="font-medium">{type.label}</span>
                  {type.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {type.description}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {value.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {value.length} of {MAX_SELECTIONS} selected
        </p>
      )}
    </div>
  );
}
