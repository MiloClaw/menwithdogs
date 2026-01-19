import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { useOverlapSession } from '@/hooks/useOverlapSession';

interface SessionBannerProps {
  className?: string;
}

/**
 * Banner component that shows when an active overlap session exists.
 * Can be placed on the Places page or other relevant pages.
 */
export function SessionBanner({ className = '' }: SessionBannerProps) {
  const { activeSession, hasActiveSession, endSession, isEnding } = useOverlapSession();

  if (!hasActiveSession || !activeSession) {
    return null;
  }

  return (
    <div className={`bg-primary/10 border border-primary/20 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium truncate">
            Discovering with {activeSession.partner_name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button 
            asChild 
            size="sm" 
            variant="secondary"
            className="h-7 text-xs"
          >
            <Link to="/together">View Together</Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            onClick={endSession}
            disabled={isEnding}
          >
            {isEnding ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <X className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
