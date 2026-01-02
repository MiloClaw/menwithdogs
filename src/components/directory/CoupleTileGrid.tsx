import { Users } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import CoupleTile from './CoupleTile';
import { useRevealedCouples, CouplePresenceInfo } from '@/hooks/useRevealedCouples';
import { FEATURE_FLAGS } from '@/lib/feature-flags';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CoupleTileGridProps {
  placeId?: string;
  eventId?: string;
  className?: string;
}

const CoupleTileGrid = ({ placeId, eventId, className }: CoupleTileGridProps) => {
  const { data: couples, isLoading } = useRevealedCouples(placeId, eventId);

  if (!FEATURE_FLAGS.PRESENCE_ENABLED) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        <h4 className="font-medium text-sm">Who's interested</h4>
        <div className="flex gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="w-12 h-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!couples?.length) {
    return (
      <div className={cn('space-y-3', className)}>
        <h4 className="font-medium text-sm">Who's interested</h4>
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
          <Users className="h-4 w-4" />
          <span>No other couples here yet. Be the first!</span>
        </div>
      </div>
    );
  }

  // Sort: open_to_hello first, then revealed, then others
  const sortedCouples = [...couples].sort((a, b) => {
    // Open to hello comes first
    if (a.status === 'open_to_hello' && b.status !== 'open_to_hello') return -1;
    if (b.status === 'open_to_hello' && a.status !== 'open_to_hello') return 1;
    
    // Then revealed couples
    if (a.is_revealed && !b.is_revealed) return -1;
    if (b.is_revealed && !a.is_revealed) return 1;
    
    return 0;
  });

  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="font-medium text-sm">
        Who's interested ({couples.length})
      </h4>
      
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-4">
          {sortedCouples.map(couple => (
            <CoupleTile
              key={couple.couple_id}
              couple={couple}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Reveal hint */}
      {FEATURE_FLAGS.REVEAL_ENABLED && FEATURE_FLAGS.OPEN_TO_HELLO_ENABLED && (
        <p className="text-xs text-muted-foreground">
          Set your status to "open to hello" to reveal profiles of others who are also open.
        </p>
      )}
    </div>
  );
};

export default CoupleTileGrid;
