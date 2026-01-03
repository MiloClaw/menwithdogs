import { Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ImmutableFieldBadgeProps {
  className?: string;
}

const ImmutableFieldBadge = ({ className }: ImmutableFieldBadgeProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Lock className={`h-3 w-3 text-muted-foreground ${className || ''}`} />
        </TooltipTrigger>
        <TooltipContent>
          <p>Synced from Google Places</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ImmutableFieldBadge;
