import { useState, useMemo } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FEATURE_FLAGS } from '@/lib/feature-flags';
import { 
  useActiveCanonicalTags, 
  useUserTagSignals, 
  useSubmitTagSignal 
} from '@/hooks/usePlaceTags';
import TagSuggestionDialog from './TagSuggestionDialog';

interface PlaceTagSubmissionProps {
  placeId: string;
  placeGoogleTypes: string[] | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  culture: 'Culture & Identity',
  accessibility: 'Accessibility',
  social: 'Social & Vibe',
  outdoor: 'Outdoor & Nature',
};

/**
 * Allows users to add/remove tag signals on places they have saved.
 * Language guardrail: "Help others discover this place"
 */
const PlaceTagSubmission = ({ placeId, placeGoogleTypes }: PlaceTagSubmissionProps) => {
  const [expanded, setExpanded] = useState(false);
  const [suggestionOpen, setSuggestionOpen] = useState(false);

  const { data: tags, isLoading: tagsLoading } = useActiveCanonicalTags(placeGoogleTypes ?? undefined);
  const { data: userSignals, isLoading: signalsLoading } = useUserTagSignals(placeId);
  const { mutate: submitSignal, isPending } = useSubmitTagSignal();

  // Compute which tags the user has currently "added" based on their signal history
  const userActiveTags = useMemo(() => {
    if (!userSignals) return new Set<string>();
    
    // Group signals by tag, take most recent action
    const tagStates = new Map<string, 'add' | 'remove'>();
    
    // Signals are ordered by created_at desc, so first occurrence is most recent
    for (const signal of userSignals) {
      if (!tagStates.has(signal.tag_slug)) {
        tagStates.set(signal.tag_slug, signal.action);
      }
    }
    
    // Return set of tags where most recent action is "add"
    return new Set(
      Array.from(tagStates.entries())
        .filter(([, action]) => action === 'add')
        .map(([slug]) => slug)
    );
  }, [userSignals]);

  const handleTagToggle = (tagSlug: string) => {
    const isActive = userActiveTags.has(tagSlug);
    submitSignal({
      placeId,
      tagSlug,
      action: isActive ? 'remove' : 'add',
    });
  };

  if (!FEATURE_FLAGS.COMMUNITY_TAGS_ENABLED) return null;
  if (tagsLoading || signalsLoading) return null;
  if (!tags?.length) return null;

  // Group tags by category
  const grouped = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = [];
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, typeof tags>);

  const categoryOrder = ['culture', 'accessibility', 'social', 'outdoor'];

  return (
    <>
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger className="flex items-center justify-between w-full group py-2">
          <span className="text-sm font-medium text-muted-foreground">
            Help others discover this place
          </span>
          <ChevronDown 
            className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} 
          />
        </CollapsibleTrigger>
        
        <CollapsibleContent className="pt-3 space-y-4">
          {categoryOrder.map(category => {
            const categoryTags = grouped[category];
            if (!categoryTags?.length) return null;

            return (
              <div key={category} className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">
                  {CATEGORY_LABELS[category]}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {categoryTags.map(tag => {
                    const isActive = userActiveTags.has(tag.slug);
                    return (
                      <Badge
                        key={tag.slug}
                        variant={isActive ? 'default' : 'outline'}
                        className={`cursor-pointer transition-colors text-xs ${
                          isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-secondary'
                        } ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
                        onClick={() => handleTagToggle(tag.slug)}
                      >
                        {tag.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto"
            onClick={() => setSuggestionOpen(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Suggest a tag that's missing
          </Button>
        </CollapsibleContent>
      </Collapsible>

      <TagSuggestionDialog 
        open={suggestionOpen} 
        onOpenChange={setSuggestionOpen} 
      />
    </>
  );
};

export default PlaceTagSubmission;
