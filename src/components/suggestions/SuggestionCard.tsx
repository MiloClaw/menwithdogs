import { MapPin } from 'lucide-react';

interface SuggestionCardProps {
  id: string;
  candidateCoupleId: string;
  displayName: string | null;
  city: string | null;
  surfacedReason: string | null;
  onClick: () => void;
}

/**
 * A calm, read-only card for displaying a single suggestion.
 * No action buttons - this is about recognition, not decision-making.
 */
const SuggestionCard = ({
  displayName,
  city,
  surfacedReason,
  onClick,
}: SuggestionCardProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <div className="space-y-2">
        {/* Display name */}
        <h3 className="font-medium text-foreground">
          {displayName || 'A couple nearby'}
        </h3>

        {/* City */}
        {city && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{city}</span>
          </div>
        )}

        {/* Surfaced reason */}
        {surfacedReason && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {surfacedReason}
          </p>
        )}
      </div>
    </button>
  );
};

export default SuggestionCard;
