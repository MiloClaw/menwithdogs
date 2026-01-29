import { Textarea } from '@/components/ui/textarea';
import { useContextTypes } from '@/hooks/useContextTypes';
import { cn } from '@/lib/utils';

interface ContextEditorProps {
  value: string;
  onChange: (value: string) => void;
  selectedTypes: string[];
}

const MIN_CHARS = 100;
const MAX_CHARS = 1500;

// Guidance prompts by context type
const GUIDANCE_BY_TYPE: Record<string, string> = {
  seasonal: 'Best times of year, weather patterns, crowd levels',
  access_logistics: 'Parking, permits, approach routes, facilities',
  activity_insight: 'Difficulty, gear requirements, technique tips',
  planning: 'Day trips vs overnight, group size, time estimates',
  safety_conditions: 'Hazards, current conditions, preparedness',
};

export function ContextEditor({ value, onChange, selectedTypes }: ContextEditorProps) {
  const { contextTypes } = useContextTypes();
  const charCount = value.length;
  const isUnderMin = charCount > 0 && charCount < MIN_CHARS;
  const isOverMax = charCount > MAX_CHARS;

  // Get labels for selected types
  const selectedLabels = selectedTypes
    .map((key) => contextTypes.find((t) => t.key === key)?.label)
    .filter(Boolean);

  // Build guidance based on selected types
  const guidance = selectedTypes
    .map((key) => GUIDANCE_BY_TYPE[key])
    .filter(Boolean)
    .join('; ');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium mb-1">Share your knowledge</h2>
        {selectedLabels.length > 0 && (
          <p className="text-sm text-muted-foreground mb-2">
            Based on your selections: {selectedLabels.join(', ')}
          </p>
        )}
        {guidance && (
          <p className="text-sm text-muted-foreground">
            Consider including: {guidance}
          </p>
        )}
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Share what you know about this place..."
        className={cn(
          'min-h-[200px] resize-none',
          isOverMax && 'border-destructive focus-visible:ring-destructive'
        )}
      />

      <div className="flex items-center justify-between text-sm">
        <div>
          {isUnderMin && (
            <span className="text-amber-600 dark:text-amber-400">
              Minimum {MIN_CHARS} characters ({MIN_CHARS - charCount} more needed)
            </span>
          )}
          {isOverMax && (
            <span className="text-destructive">
              Maximum {MAX_CHARS} characters exceeded
            </span>
          )}
        </div>
        <span
          className={cn(
            'text-muted-foreground',
            isOverMax && 'text-destructive'
          )}
        >
          {charCount} / {MAX_CHARS}
        </span>
      </div>
    </div>
  );
}

export { MIN_CHARS, MAX_CHARS };
