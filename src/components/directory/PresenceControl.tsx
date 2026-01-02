import { useState } from 'react';
import { Heart, Calendar, Sparkles, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePresence, PresenceStatus } from '@/hooks/usePresence';
import { FEATURE_FLAGS } from '@/lib/feature-flags';
import { cn } from '@/lib/utils';

interface PresenceControlProps {
  placeId?: string;
  eventId?: string;
  eventEndTime?: Date; // For events, to cap planning duration
  className?: string;
}

// Duration options in hours
const PLANNING_DURATIONS = [
  { label: '4 hours', hours: 4 },
  { label: '8 hours', hours: 8 },
  { label: '24 hours', hours: 24 },
  { label: '1 week', hours: 168 },
];

const OPEN_DURATIONS = [
  { label: '1 hour', hours: 1 },
  { label: '2 hours', hours: 2 },
  { label: '4 hours', hours: 4 },
];

const PresenceControl = ({ placeId, eventId, eventEndTime, className }: PresenceControlProps) => {
  const { presence, isLoading, setPresence, clearPresence, isUpdating } = usePresence(placeId, eventId);
  const [selectedDuration, setSelectedDuration] = useState<number>(2); // Default 2 hours for open_to_hello
  
  const currentStatus = presence?.status;
  
  // Check if presence has expired
  const isExpired = presence?.ends_at && new Date(presence.ends_at) < new Date();
  const effectiveStatus = isExpired ? undefined : currentStatus;

  const handleStatusChange = (status: PresenceStatus | null) => {
    if (!status) {
      clearPresence({ placeId, eventId });
      return;
    }

    let endsAt: Date;
    
    if (status === 'interested') {
      // Interested is indefinite - set far future
      endsAt = new Date();
      endsAt.setFullYear(endsAt.getFullYear() + 10);
    } else if (status === 'planning_to_attend') {
      // Use event end time if available, otherwise 24 hours
      if (eventEndTime) {
        endsAt = eventEndTime;
      } else {
        endsAt = new Date();
        endsAt.setHours(endsAt.getHours() + 24);
      }
    } else {
      // open_to_hello - use selected duration
      endsAt = new Date();
      endsAt.setHours(endsAt.getHours() + selectedDuration);
    }

    setPresence({ placeId, eventId, status, endsAt });
  };

  const handleDurationChange = (hours: string) => {
    const hoursNum = parseInt(hours, 10);
    setSelectedDuration(hoursNum);
    
    // If already open_to_hello, update with new duration
    if (effectiveStatus === 'open_to_hello') {
      const endsAt = new Date();
      endsAt.setHours(endsAt.getHours() + hoursNum);
      setPresence({ placeId, eventId, status: 'open_to_hello', endsAt });
    }
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-4', className)}>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Status Toggle */}
      <ToggleGroup
        type="single"
        value={effectiveStatus || ''}
        onValueChange={(val) => handleStatusChange(val as PresenceStatus || null)}
        className="flex flex-wrap gap-2"
        disabled={isUpdating}
      >
        <ToggleGroupItem
          value="interested"
          className="flex items-center gap-2 min-h-[44px] px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          <Heart className="h-4 w-4" />
          <span>We're Interested</span>
        </ToggleGroupItem>
        
        <ToggleGroupItem
          value="planning_to_attend"
          className="flex items-center gap-2 min-h-[44px] px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          <Calendar className="h-4 w-4" />
          <span>We're Going</span>
        </ToggleGroupItem>

        {FEATURE_FLAGS.OPEN_TO_HELLO_ENABLED && (
          <ToggleGroupItem
            value="open_to_hello"
            className="flex items-center gap-2 min-h-[44px] px-4 data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground"
          >
            <Sparkles className="h-4 w-4" />
            <span>We're Open to Saying Hello</span>
          </ToggleGroupItem>
        )}
      </ToggleGroup>

      {/* Duration selector for open_to_hello */}
      {effectiveStatus === 'open_to_hello' && FEATURE_FLAGS.OPEN_TO_HELLO_ENABLED && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">For</span>
          <Select
            value={selectedDuration.toString()}
            onValueChange={handleDurationChange}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-[120px] min-h-[44px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPEN_DURATIONS.map(opt => (
                <SelectItem key={opt.hours} value={opt.hours.toString()}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Clear button when active */}
      {effectiveStatus && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => clearPresence({ placeId, eventId })}
          disabled={isUpdating}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4 mr-1" />
          Clear status
        </Button>
      )}

      {/* Helper text */}
      {effectiveStatus === 'open_to_hello' && (
        <p className="text-xs text-muted-foreground">
          Other couples who are also open to saying hello here will see your profile.
        </p>
      )}
    </div>
  );
};

export default PresenceControl;
