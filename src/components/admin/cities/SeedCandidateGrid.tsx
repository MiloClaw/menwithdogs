import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Star, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import type { SeedCandidate } from '@/hooks/useCitySeedWizard';
import { supabase } from '@/integrations/supabase/client';

interface SeedCandidateGridProps {
  candidates: SeedCandidate[];
  onToggle: (placeId: string) => void;
  onSelectAll: (select: boolean) => void;
  selectedCount: number;
  newCandidateCount: number;
}

export function SeedCandidateGrid({
  candidates,
  onToggle,
  onSelectAll,
  selectedCount,
  newCandidateCount,
}: SeedCandidateGridProps) {
  const [minRating, setMinRating] = useState<number>(0);
  const [hideDuplicates, setHideDuplicates] = useState(false);

  const filteredCandidates = candidates.filter((c) => {
    if (hideDuplicates && c.isDuplicate) return false;
    if (minRating > 0 && (c.rating || 0) < minRating) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="hide-duplicates"
              checked={hideDuplicates}
              onCheckedChange={setHideDuplicates}
            />
            <Label htmlFor="hide-duplicates" className="text-sm cursor-pointer">
              Hide duplicates
            </Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-sm">Min rating:</Label>
            <div className="flex gap-1">
              {[0, 3, 3.5, 4, 4.5].map((rating) => (
                <Button
                  key={rating}
                  type="button"
                  size="sm"
                  variant={minRating === rating ? 'default' : 'ghost'}
                  className="h-7 px-2"
                  onClick={() => setMinRating(rating)}
                >
                  {rating === 0 ? 'All' : `${rating}+`}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onSelectAll(true)}
          >
            Select All New
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onSelectAll(false)}
          >
            Deselect All
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">{selectedCount}</span> selected
        </span>
        <span>•</span>
        <span>
          <span className="font-medium text-foreground">{newCandidateCount}</span> new
        </span>
        <span>•</span>
        <span>
          <span className="font-medium text-foreground">{candidates.length - newCandidateCount}</span> already exist
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
        {filteredCandidates.map((candidate) => (
          <CandidateCard
            key={candidate.place_id}
            candidate={candidate}
            onToggle={() => onToggle(candidate.place_id)}
          />
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No places match the current filters.
        </div>
      )}
    </div>
  );
}

interface CandidateCardProps {
  candidate: SeedCandidate;
  onToggle: () => void;
}

function CandidateCard({ candidate, onToggle }: CandidateCardProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState(false);

  // Load photo on mount
  useState(() => {
    if (candidate.photos?.[0]?.name && !photoError) {
      supabase.functions
        .invoke('google-places-photo', {
          body: { photoName: candidate.photos[0].name, maxWidth: 200 },
        })
        .then(({ data }) => {
          if (data?.url) setPhotoUrl(data.url);
        })
        .catch(() => setPhotoError(true));
    }
  });

  const isDisabled = candidate.isDuplicate;

  return (
    <div
      className={`
        relative flex gap-3 p-3 rounded-lg border cursor-pointer transition-all
        ${isDisabled ? 'opacity-60 bg-muted/30' : 'hover:border-primary/50'}
        ${candidate.selected && !isDisabled ? 'border-primary bg-primary/5' : ''}
      `}
      onClick={() => !isDisabled && onToggle()}
    >
      {/* Checkbox */}
      <div className="flex items-start pt-1">
        <Checkbox
          checked={candidate.selected && !isDisabled}
          disabled={isDisabled}
          onCheckedChange={() => !isDisabled && onToggle()}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Photo */}
      <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-md overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={candidate.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <MapPin className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm truncate">{candidate.name}</h4>
          {candidate.isDuplicate && (
            <Badge variant="secondary" className="flex-shrink-0 text-xs">
              Exists
            </Badge>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {candidate.formatted_address}
        </p>

        <div className="flex items-center gap-2 mt-1.5">
          {candidate.rating && (
            <div className="flex items-center gap-1 text-xs">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{candidate.rating.toFixed(1)}</span>
              {candidate.user_ratings_total && (
                <span className="text-muted-foreground">
                  ({candidate.user_ratings_total.toLocaleString()})
                </span>
              )}
            </div>
          )}
          {candidate.primary_type_display && (
            <Badge variant="outline" className="text-xs capitalize">
              {candidate.primary_type_display}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
