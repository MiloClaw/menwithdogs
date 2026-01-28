import { EXPERTISE_AREAS, type ExpertiseArea } from '@/lib/trail-blazer-options';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ExpertiseAreaSelectorProps {
  selectedAreas: ExpertiseArea[];
  onAreasChange: (areas: ExpertiseArea[]) => void;
  otherDescription?: string;
  onOtherDescriptionChange?: (description: string) => void;
  className?: string;
}

const ExpertiseAreaSelector = ({
  selectedAreas,
  onAreasChange,
  otherDescription = '',
  onOtherDescriptionChange,
  className,
}: ExpertiseAreaSelectorProps) => {
  const handleToggle = (value: ExpertiseArea) => {
    if (selectedAreas.includes(value)) {
      onAreasChange(selectedAreas.filter((a) => a !== value));
    } else {
      onAreasChange([...selectedAreas, value]);
    }
  };

  const showOtherInput = selectedAreas.includes('other');

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {EXPERTISE_AREAS.map((area) => (
          <div
            key={area.value}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
              selectedAreas.includes(area.value)
                ? 'border-accent bg-accent/5'
                : 'border-border hover:border-muted-foreground/30'
            )}
            onClick={() => handleToggle(area.value)}
          >
            <Checkbox
              id={`expertise-${area.value}`}
              checked={selectedAreas.includes(area.value)}
              onCheckedChange={() => handleToggle(area.value)}
              className="pointer-events-none"
            />
            <Label
              htmlFor={`expertise-${area.value}`}
              className="cursor-pointer font-normal text-sm flex-1"
            >
              {area.label}
            </Label>
          </div>
        ))}
      </div>

      {showOtherInput && onOtherDescriptionChange && (
        <div className="pt-2">
          <Input
            placeholder="Please describe your expertise area..."
            value={otherDescription}
            onChange={(e) => onOtherDescriptionChange(e.target.value)}
            className="max-w-md"
          />
        </div>
      )}
    </div>
  );
};

export default ExpertiseAreaSelector;
