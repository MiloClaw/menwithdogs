import { Heart, Calendar, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PresenceAggregate } from '@/hooks/usePresenceAggregates';

interface PresenceCountStripProps {
  aggregate: PresenceAggregate;
  className?: string;
  compact?: boolean;
}

const PresenceCountStrip = ({ aggregate, className, compact = false }: PresenceCountStripProps) => {
  const { interested_count, planning_count, open_count } = aggregate;
  
  // Don't render if all counts are zero
  if (interested_count === 0 && planning_count === 0 && open_count === 0) {
    return null;
  }

  if (compact) {
    // Compact version for cards
    return (
      <div className={cn('flex items-center gap-3 text-xs text-muted-foreground', className)}>
        {interested_count > 0 && (
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {interested_count}
          </span>
        )}
        {planning_count > 0 && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {planning_count}
          </span>
        )}
        {open_count > 0 && (
          <span className="flex items-center gap-1 text-secondary">
            <Sparkles className="h-3 w-3" />
            {open_count}
          </span>
        )}
      </div>
    );
  }

  // Full version for detail views
  return (
    <div className={cn('flex flex-wrap items-center gap-4 text-sm', className)}>
      {interested_count > 0 && (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Heart className="h-4 w-4" />
          <span>{interested_count} interested</span>
        </div>
      )}
      {planning_count > 0 && (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{planning_count} going</span>
        </div>
      )}
      {open_count > 0 && (
        <div className="flex items-center gap-1.5 text-secondary font-medium">
          <Sparkles className="h-4 w-4" />
          <span>{open_count} open to hello</span>
        </div>
      )}
    </div>
  );
};

export default PresenceCountStrip;
