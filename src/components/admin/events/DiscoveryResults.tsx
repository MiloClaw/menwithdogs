import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Eye, MapPin, Calendar, Zap, Sparkles } from 'lucide-react';
import { getEventTypeLabel, getSocialEnergyLabel } from '@/lib/event-taxonomy';
import type { EventCandidate, DiscoveryMeta } from '@/hooks/useEventDiscovery';

interface DiscoveryResultsProps {
  candidates: EventCandidate[];
  meta: DiscoveryMeta | null;
  onReview: (candidate: EventCandidate) => void;
  onDiscard: (candidateId: string) => void;
  onClear: () => void;
}

const confidenceColors = {
  high: 'bg-green-500/10 text-green-700 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  low: 'bg-muted text-muted-foreground border-border',
};

export function DiscoveryResults({
  candidates,
  meta,
  onReview,
  onDiscard,
  onClear,
}: DiscoveryResultsProps) {
  if (candidates.length === 0 && !meta) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-foreground">
            {candidates.length} Candidate{candidates.length !== 1 ? 's' : ''} Found
          </h3>
          {meta && (
            <p className="text-sm text-muted-foreground">
              {meta.city}{meta.state ? `, ${meta.state}` : ''} • Generated{' '}
              {new Date(meta.generated_at).toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear Results
        </Button>
      </div>

      {/* Empty state */}
      {candidates.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              No candidates found. Try adjusting your search parameters.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Candidate Cards */}
      <div className="grid gap-4">
        {candidates.map((candidate) => (
          <Card key={candidate.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-base">{candidate.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    {candidate.venue_name}
                    {candidate.venue_address_hint && (
                      <span className="text-muted-foreground/60">
                        • {candidate.venue_address_hint}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={confidenceColors[candidate.confidence]}
                >
                  {candidate.confidence}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {candidate.description}
              </p>

              {/* Metadata */}
              <div className="flex flex-wrap gap-2 text-xs">
                {candidate.suggested_date && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {candidate.suggested_date}
                  </span>
                )}
                {candidate.suggested_taxonomy.event_type && (
                  <Badge variant="secondary" className="text-xs">
                    {getEventTypeLabel(candidate.suggested_taxonomy.event_type)}
                  </Badge>
                )}
                {candidate.suggested_taxonomy.social_energy_level && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Zap className="h-3 w-3" />
                    {getSocialEnergyLabel(candidate.suggested_taxonomy.social_energy_level)}
                  </span>
                )}
              </div>

              {/* Source hint */}
              {candidate.source_hint && (
                <p className="text-xs text-muted-foreground/60 italic">
                  Source: {candidate.source_hint}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => onReview(candidate)}
                  className="flex-1"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Review
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDiscard(candidate.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
