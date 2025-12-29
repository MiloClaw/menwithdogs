import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CoupleCardProps {
  id: string;
  displayName: string | null;
  city: string | null;
  sharedInterestLabels: string[];
  isSaved: boolean;
  onSave: () => void;
  onUnsave: () => void;
  onClick: () => void;
}

export function CoupleCard({
  id,
  displayName,
  city,
  sharedInterestLabels,
  isSaved,
  onSave,
  onUnsave,
  onClick,
}: CoupleCardProps) {
  // Generate behavioral sentence from interests
  const displayInterests = sharedInterestLabels.slice(0, 3);
  
  const behavioralSentence = displayInterests.length > 0
    ? `We usually enjoy ${displayInterests.join(', ').toLowerCase()}.`
    : null;

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      onUnsave();
    } else {
      onSave();
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-5 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          {/* Couple name */}
          <h3 className="font-serif font-medium text-foreground truncate">
            {displayName || 'A couple nearby'}
          </h3>
          
          {/* City/neighborhood */}
          {city && (
            <p className="text-sm text-muted-foreground">
              {city}
            </p>
          )}
          
          {/* Behavioral sentence */}
          {behavioralSentence && (
            <p className="text-sm text-muted-foreground italic">
              {behavioralSentence}
            </p>
          )}
        </div>

        {/* Save button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSaveClick}
          className="shrink-0 h-10 w-10"
          aria-label={isSaved ? 'Remove from saved' : 'Save for later'}
        >
          {isSaved ? (
            <BookmarkCheck className="h-5 w-5 text-accent" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </Button>
      </div>
    </button>
  );
}
