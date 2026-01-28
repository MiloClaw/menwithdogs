import { type Acknowledgements } from '@/lib/trail-blazer-options';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AcknowledgementsChecklistProps {
  acknowledgements: Acknowledgements;
  onAcknowledgementsChange: (acknowledgements: Acknowledgements) => void;
  className?: string;
}

const ACKNOWLEDGEMENT_ITEMS = [
  {
    key: 'placeFocus' as const,
    label: 'My contributions will focus on places, not self-promotion',
  },
  {
    key: 'linkReview' as const,
    label: 'Links I submit are subject to review and may not be published',
  },
  {
    key: 'noPublicProfile' as const,
    label: 'There are no public Trail Blazer profiles or rankings',
  },
  {
    key: 'noPromotionRequired' as const,
    label: 'Participation does not require promoting ThickTimber',
  },
];

const AcknowledgementsChecklist = ({
  acknowledgements,
  onAcknowledgementsChange,
  className,
}: AcknowledgementsChecklistProps) => {
  const handleToggle = (key: keyof Acknowledgements) => {
    onAcknowledgementsChange({
      ...acknowledgements,
      [key]: !acknowledgements[key],
    });
  };

  const allChecked = Object.values(acknowledgements).every(Boolean);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-3">
        {ACKNOWLEDGEMENT_ITEMS.map((item) => (
          <div
            key={item.key}
            className={cn(
              'flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors',
              acknowledgements[item.key]
                ? 'border-accent bg-accent/5'
                : 'border-border hover:border-muted-foreground/30'
            )}
            onClick={() => handleToggle(item.key)}
          >
            <Checkbox
              id={`ack-${item.key}`}
              checked={acknowledgements[item.key]}
              onCheckedChange={() => handleToggle(item.key)}
              className="pointer-events-none mt-0.5"
            />
            <Label
              htmlFor={`ack-${item.key}`}
              className="cursor-pointer font-normal text-sm leading-relaxed flex-1"
            >
              {item.label}
            </Label>
          </div>
        ))}
      </div>

      {!allChecked && (
        <p className="text-xs text-muted-foreground">
          Please acknowledge all items to submit your application.
        </p>
      )}
    </div>
  );
};

export default AcknowledgementsChecklist;
