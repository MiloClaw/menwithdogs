import { Badge } from '@/components/ui/badge';

interface PromoCodeStatusBadgeProps {
  slotsUsed: number;
  slotsTotal: number;
  isActive?: boolean;
}

export function PromoCodeStatusBadge({ slotsUsed, slotsTotal, isActive = true }: PromoCodeStatusBadgeProps) {
  const isSoldOut = slotsUsed >= slotsTotal;

  if (isSoldOut) {
    return (
      <Badge variant="secondary" className="bg-muted text-muted-foreground">
        Sold Out
      </Badge>
    );
  }

  if (!isActive) {
    return (
      <Badge variant="outline" className="border-amber-500 text-amber-600">
        Paused
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
      Active
    </Badge>
  );
}
