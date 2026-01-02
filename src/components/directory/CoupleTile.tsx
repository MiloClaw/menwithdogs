import { User2, Heart, Calendar, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FEATURE_FLAGS } from '@/lib/feature-flags';
import type { CouplePresenceInfo } from '@/hooks/useRevealedCouples';

interface CoupleTileProps {
  couple: CouplePresenceInfo;
  className?: string;
  onClick?: () => void;
}

const statusIcons = {
  interested: Heart,
  planning_to_attend: Calendar,
  open_to_hello: Sparkles,
};

const CoupleTile = ({ couple, className, onClick }: CoupleTileProps) => {
  const { display_name, photo_url, is_revealed, status } = couple;
  const StatusIcon = statusIcons[status];
  const showRevealed = FEATURE_FLAGS.REVEAL_ENABLED && is_revealed;

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 p-3 rounded-xl transition-all',
        'min-w-[100px] max-w-[120px]',
        onClick && 'cursor-pointer hover:bg-muted/50',
        className
      )}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="relative">
        <div 
          className={cn(
            'w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center',
            'ring-2 ring-offset-2 ring-offset-background',
            status === 'open_to_hello' ? 'ring-secondary' : 'ring-border'
          )}
        >
          {photo_url && showRevealed ? (
            <img
              src={photo_url}
              alt={display_name || 'Couple'}
              className="w-full h-full object-cover"
            />
          ) : photo_url && !showRevealed ? (
            // Blurred photo
            <img
              src={photo_url}
              alt="Couple"
              className="w-full h-full object-cover blur-lg scale-110"
            />
          ) : (
            // Placeholder
            <User2 className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        {/* Status indicator */}
        <div 
          className={cn(
            'absolute -bottom-1 -right-1 p-1.5 rounded-full',
            status === 'open_to_hello' 
              ? 'bg-secondary text-secondary-foreground' 
              : 'bg-muted text-muted-foreground'
          )}
        >
          <StatusIcon className="h-3 w-3" />
        </div>
      </div>

      {/* Name */}
      <div className="text-center w-full">
        {showRevealed && display_name ? (
          <p className="text-sm font-medium truncate">{display_name}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {status === 'open_to_hello' ? 'Open to hello' : 
             status === 'planning_to_attend' ? 'Going' : 'Interested'}
          </p>
        )}
      </div>
    </div>
  );
};

export default CoupleTile;
