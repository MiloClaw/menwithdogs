import { MapPin, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { CitySuggestion } from '@/hooks/useCitySuggestions';

interface CitySuggestionCardProps {
  suggestion: CitySuggestion;
  onApprove: (suggestion: CitySuggestion) => void;
  onReject: (id: string) => void;
  isProcessing?: boolean;
}

export const CitySuggestionCard = ({
  suggestion,
  onApprove,
  onReject,
  isProcessing,
}: CitySuggestionCardProps) => {
  const locationParts = [suggestion.state, suggestion.country].filter(Boolean);
  const locationString = locationParts.join(', ');

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{suggestion.name}</h3>
              <Badge variant="outline" className="text-xs shrink-0">
                Pending
              </Badge>
            </div>
            {locationString && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {locationString}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Suggested {formatDistanceToNow(new Date(suggestion.created_at), { addSuffix: true })}
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReject(suggestion.id)}
              disabled={isProcessing}
              className="h-8 w-8 p-0"
              title="Reject"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => onApprove(suggestion)}
              disabled={isProcessing}
              className="h-8"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Add City
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
