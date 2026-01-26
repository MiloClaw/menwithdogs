import { usePlaceTagAggregates, useCanonicalTags } from '@/hooks/usePlaceTags';
import { FEATURE_FLAGS } from '@/lib/feature-flags';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Users } from 'lucide-react';

interface PlaceTagDisplayProps {
  placeId: string;
}

/**
 * Displays community-assigned tags that meet k-anonymity threshold.
 * Language guardrail: Uses "Community tagged as" framing.
 * Hidden when no tags meet threshold (no empty state shown).
 */
const PlaceTagDisplay = ({ placeId }: PlaceTagDisplayProps) => {
  const { data: aggregates, isLoading } = usePlaceTagAggregates(placeId);
  const { data: allTags } = useCanonicalTags();

  if (!FEATURE_FLAGS.COMMUNITY_TAGS_ENABLED) return null;
  if (isLoading) return null;

  // Only show tags that meet k-threshold
  const visibleAggregates = aggregates?.filter(a => a.meets_k_threshold) ?? [];
  
  if (visibleAggregates.length === 0) return null;

  // Create a map for quick tag lookup
  const tagMap = new Map(allTags?.map(t => [t.slug, t]) ?? []);

  // Group by category
  const grouped = visibleAggregates.reduce((acc, agg) => {
    const tag = tagMap.get(agg.tag_slug);
    if (!tag) return acc;
    const category = tag.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push({ aggregate: agg, tag });
    return acc;
  }, {} as Record<string, Array<{ aggregate: typeof visibleAggregates[0]; tag: NonNullable<typeof allTags>[0] }>>);

  const categoryOrder = ['culture', 'accessibility', 'social', 'outdoor'];

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
          <Users className="h-3 w-3" />
          Community tagged as
        </p>
        <div className="flex flex-wrap gap-1.5">
          {categoryOrder.map(category => {
            const items = grouped[category];
            if (!items?.length) return null;
            
            return items.map(({ aggregate, tag }) => (
              <Tooltip key={aggregate.id}>
                <TooltipTrigger asChild>
                  <Badge
                    variant="secondary"
                    className="text-xs cursor-default bg-secondary/60 hover:bg-secondary/80"
                  >
                    {tag.label}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <p className="text-sm">{tag.description || tag.label}</p>
                </TooltipContent>
              </Tooltip>
            ));
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PlaceTagDisplay;
