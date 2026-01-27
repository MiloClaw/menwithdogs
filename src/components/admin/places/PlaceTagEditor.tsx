import { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePlaceNicheTags, useApplyPlaceTag, useRemovePlaceTag } from '@/hooks/usePlaceNicheTags';
import { useCanonicalTags } from '@/hooks/usePlaceTags';

interface PlaceTagEditorProps {
  placeId: string;
}

/**
 * Admin component for applying/removing niche tags on a place.
 * Uses place_niche_tags table with evidence_type='admin_approved'.
 */
const PlaceTagEditor = ({ placeId }: PlaceTagEditorProps) => {
  const [selectedTag, setSelectedTag] = useState<string>('');
  
  const { data: appliedTags, isLoading: tagsLoading } = usePlaceNicheTags(placeId);
  const { data: canonicalTags, isLoading: canonicalLoading } = useCanonicalTags();
  const { mutate: applyTag, isPending: applying } = useApplyPlaceTag();
  const { mutate: removeTag, isPending: removing } = useRemovePlaceTag();

  const appliedTagSlugs = new Set(appliedTags?.map(t => t.tag) ?? []);
  
  // Filter out already-applied tags
  const availableTags = canonicalTags?.filter(t => !appliedTagSlugs.has(t.slug)) ?? [];

  const handleApply = () => {
    if (!selectedTag) return;
    applyTag({ placeId, tag: selectedTag });
    setSelectedTag('');
  };

  const handleRemove = (tagId: string) => {
    removeTag({ tagId, placeId });
  };

  if (tagsLoading || canonicalLoading) {
    return <div className="text-sm text-muted-foreground">Loading tags...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Community Tags</span>
      </div>

      {/* Applied tags */}
      {appliedTags && appliedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {appliedTags.map(tag => {
            const canonical = canonicalTags?.find(c => c.slug === tag.tag);
            return (
              <Badge
                key={tag.id}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                {canonical?.label ?? tag.tag}
                <button
                  onClick={() => handleRemove(tag.id)}
                  disabled={removing}
                  className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Add new tag */}
      <div className="flex gap-2">
        <Select value={selectedTag} onValueChange={setSelectedTag}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select a tag to apply..." />
          </SelectTrigger>
          <SelectContent>
            {availableTags.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">
                All tags already applied
              </div>
            ) : (
              availableTags.map(tag => (
                <SelectItem key={tag.slug} value={tag.slug}>
                  <span className="flex items-center gap-2">
                    {tag.label}
                    <span className="text-xs text-muted-foreground">
                      ({tag.category})
                    </span>
                  </span>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          onClick={handleApply}
          disabled={!selectedTag || applying}
        >
          <Plus className="h-4 w-4 mr-1" />
          Apply
        </Button>
      </div>
    </div>
  );
};

export default PlaceTagEditor;
