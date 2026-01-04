import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Star, MapPin, Heart, Search, Loader2, CheckCircle2, MessageSquareQuote } from 'lucide-react';
import type { SeedCandidate } from '@/hooks/useCitySeedWizard';
import { supabase } from '@/integrations/supabase/client';

interface SeedCandidateGridProps {
  candidates: SeedCandidate[];
  onToggle: (placeId: string) => void;
  onSelectAll: (select: boolean) => void;
  selectedCount: number;
  newCandidateCount: number;
  searchKeywords?: string[];
  onScanReviews?: (placeId: string) => void;
  onScanAllReviews?: (placeIds: string[]) => void;
  isScanningReviews?: boolean;
  categoryGroups?: string[];
  discoveryStats?: {
    totalApiResults: number;
    afterDedup: number;
    filteredByQuality: number;
    duplicatesInDb: number;
    byDiscoveryPoint: Record<string, number>;
    byCategory: Record<string, number>;
  } | null;
}

export function SeedCandidateGrid({
  candidates,
  onToggle,
  onSelectAll,
  selectedCount,
  newCandidateCount,
  searchKeywords = [],
  onScanReviews,
  onScanAllReviews,
  isScanningReviews = false,
  categoryGroups = ['All'],
  discoveryStats,
}: SeedCandidateGridProps) {
  const [minRating, setMinRating] = useState<number>(0);
  const [hideDuplicates, setHideDuplicates] = useState(true);
  const [showKeywordMatchesOnly, setShowKeywordMatchesOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const keywordMatchCount = candidates.filter(c => (c.keywordMatches?.length ?? 0) > 0).length;
  const scannedCount = candidates.filter(c => c.reviewsScanned).length;
  const hasKeywords = searchKeywords.length > 0;

  const filteredCandidates = candidates.filter((c) => {
    if (hideDuplicates && c.isDuplicate) return false;
    if (minRating > 0 && (c.rating || 0) < minRating) return false;
    if (showKeywordMatchesOnly && (!c.keywordMatches || c.keywordMatches.length === 0)) return false;
    if (selectedCategory !== 'All' && c.categoryGroup !== selectedCategory) return false;
    return true;
  });

  const unscannedVisibleIds = filteredCandidates
    .filter(c => !c.isDuplicate && !c.reviewsScanned && !c.isScanning)
    .map(c => c.place_id);

  const handleScanAll = () => {
    if (onScanAllReviews && unscannedVisibleIds.length > 0) {
      onScanAllReviews(unscannedVisibleIds);
    }
  };

  return (
    <div className="space-y-4">
      {/* Discovery Stats Summary */}
      {discoveryStats && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Discovery Complete
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">API Results:</span>{' '}
              <span className="font-medium">{discoveryStats.totalApiResults}</span>
            </div>
            <div>
              <span className="text-muted-foreground">After Dedup:</span>{' '}
              <span className="font-medium">{discoveryStats.afterDedup}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Quality Filtered:</span>{' '}
              <span className="font-medium text-amber-600">{discoveryStats.filteredByQuality}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Already in DB:</span>{' '}
              <span className="font-medium">{discoveryStats.duplicatesInDb}</span>
            </div>
          </div>
          
          {/* Category breakdown */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/50">
            {Object.entries(discoveryStats.byCategory).map(([cat, count]) => (
              <Badge key={cat} variant="outline" className="text-xs">
                {cat}: {count}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Review Summary Panel */}
      <div className="p-3 bg-muted/50 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium text-foreground">{candidates.length}</span> places found
            <span className="text-muted-foreground"> • </span>
            <span className="font-medium text-foreground">{newCandidateCount}</span> new
            <span className="text-muted-foreground"> • </span>
            <span className="font-medium text-foreground">{candidates.length - newCandidateCount}</span> exist
          </div>
          <Badge variant="secondary" className="text-xs">
            {selectedCount} selected
          </Badge>
        </div>
        
        {hasKeywords && (
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                <span className="font-medium text-foreground">{scannedCount}</span> scanned
              </span>
              {keywordMatchCount > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-pink-500 fill-pink-500" />
                    <span className="font-medium text-foreground">{keywordMatchCount}</span> matches
                  </span>
                </>
              )}
            </div>
            {unscannedVisibleIds.length > 0 && onScanAllReviews && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleScanAll}
                disabled={isScanningReviews}
                className="gap-1.5"
              >
                {isScanningReviews ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Search className="h-3.5 w-3.5" />
                )}
                Scan {unscannedVisibleIds.length} Visible
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Category Filter Tabs */}
      {categoryGroups.length > 2 && (
        <div className="flex flex-wrap gap-1.5">
          {categoryGroups.map((cat) => {
            const count = cat === 'All' 
              ? candidates.length 
              : candidates.filter(c => c.categoryGroup === cat).length;
            return (
              <Button
                key={cat}
                type="button"
                size="sm"
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
                className="h-7 text-xs gap-1"
              >
                {cat}
                <Badge variant="secondary" className="ml-1 text-xs h-4 px-1">
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-muted/30 rounded-lg">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="hide-duplicates"
              checked={hideDuplicates}
              onCheckedChange={setHideDuplicates}
            />
            <Label htmlFor="hide-duplicates" className="text-sm cursor-pointer">
              Hide existing
            </Label>
          </div>
          
          {keywordMatchCount > 0 && (
            <div className="flex items-center gap-2">
              <Switch
                id="keyword-matches"
                checked={showKeywordMatchesOnly}
                onCheckedChange={setShowKeywordMatchesOnly}
              />
              <Label htmlFor="keyword-matches" className="text-sm cursor-pointer flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-pink-500" />
                Matches only
              </Label>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Label className="text-sm">Rating:</Label>
            <div className="flex gap-1">
              {[0, 3.5, 4, 4.5].map((rating) => (
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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
        {filteredCandidates.map((candidate) => (
          <CandidateCard
            key={candidate.place_id}
            candidate={candidate}
            onToggle={() => onToggle(candidate.place_id)}
            onScanReviews={onScanReviews}
            hasKeywords={hasKeywords}
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
  onScanReviews?: (placeId: string) => void;
  hasKeywords: boolean;
}

function CandidateCard({ candidate, onToggle, onScanReviews, hasKeywords }: CandidateCardProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState(false);

  // Load photo on mount
  useState(() => {
    const photoName = candidate.photos?.[0]?.name;
    if (photoName && !photoError) {
      supabase.functions
        .invoke('google-places-photo', {
          body: { name: photoName, maxWidth: 200, maxHeight: 200 },
        })
        .then(({ data }) => {
          if (data?.url) setPhotoUrl(data.url);
        })
        .catch(() => setPhotoError(true));
    }
  });

  const isDisabled = candidate.isDuplicate;
  const showScanButton = hasKeywords && !candidate.reviewsScanned && !candidate.isScanning && !isDisabled;
  const hasMatches = (candidate.keywordMatches?.length ?? 0) > 0;
  const hasSnippets = (candidate.reviewSnippets?.length ?? 0) > 0;

  return (
    <div
      className={`
        relative flex flex-col gap-2 p-3 rounded-lg border cursor-pointer transition-all
        ${isDisabled ? 'opacity-60 bg-muted/30' : 'hover:border-primary/50'}
        ${candidate.selected && !isDisabled ? 'border-primary bg-primary/5' : ''}
        ${hasMatches ? 'ring-1 ring-pink-300 dark:ring-pink-700' : ''}
      `}
      onClick={() => !isDisabled && onToggle()}
    >
      <div className="flex gap-3">
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
        <div className="flex-shrink-0 w-14 h-14 bg-muted rounded-md overflow-hidden">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={candidate.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <MapPin className="h-5 w-5" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm truncate">{candidate.name}</h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              {candidate.isDuplicate && (
                <Badge variant="secondary" className="text-xs">
                  Exists
                </Badge>
              )}
              {candidate.reviewsScanned && !hasMatches && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Scanned
                </Badge>
              )}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {candidate.formatted_address}
          </p>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {candidate.discoveredFrom && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <MapPin className="h-2.5 w-2.5 mr-1" />
                {candidate.discoveredFrom.replace(/ \(City Center\)$/i, '')}
              </Badge>
            )}
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
            {hasMatches && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 text-xs cursor-help">
                      <Heart className="h-3 w-3 mr-1 fill-current" />
                      {candidate.keywordMatches!.length}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Found: {candidate.keywordMatches!.join(', ')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Scan button or loading */}
        {hasKeywords && (
          <div className="flex-shrink-0">
            {candidate.isScanning && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {showScanButton && onScanReviews && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onScanReviews(candidate.place_id);
                }}
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Review Snippets */}
      {hasSnippets && (
        <div className="ml-7 pl-3 border-l-2 border-pink-200 dark:border-pink-800 space-y-1">
          {candidate.reviewSnippets!.map((snippet, i) => (
            <p key={i} className="text-xs text-muted-foreground italic flex items-start gap-1.5">
              <MessageSquareQuote className="h-3 w-3 flex-shrink-0 mt-0.5 text-pink-500" />
              "{snippet}"
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
