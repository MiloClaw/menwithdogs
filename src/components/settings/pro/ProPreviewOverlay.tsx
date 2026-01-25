import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';

interface ProPreviewOverlayProps {
  children: React.ReactNode;
}

/**
 * Wraps Pro settings content with a blur effect for non-subscribers.
 * Shows actual Pro options blurred to encourage upgrades.
 */
export function ProPreviewOverlay({ children }: ProPreviewOverlayProps) {
  const { hasPaidTuning, createCheckout, isCreatingCheckout } = useSubscription();

  if (hasPaidTuning) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div 
        className={cn(
          "blur-[2px] opacity-70 pointer-events-none select-none",
          "transition-all duration-300"
        )}
        aria-hidden="true"
      >
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-background/60 to-background/80 rounded-lg">
        <div className="text-center space-y-3 p-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">Pro Feature</span>
          </div>
          <Button
            variant="default"
            onClick={() => createCheckout()}
            disabled={isCreatingCheckout}
            className="min-h-[44px]"
          >
            {isCreatingCheckout ? 'Loading...' : 'Unlock Pro — $4.99/mo'}
          </Button>
        </div>
      </div>
    </div>
  );
}
