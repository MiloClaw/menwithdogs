import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useInterestsCatalog } from '@/hooks/useInterests';

interface PostTagsStepProps {
  selectedTags: string[];
  onToggleTag: (interestId: string) => void;
}

export const PostTagsStep = ({ selectedTags, onToggleTag }: PostTagsStepProps) => {
  const { data: catalog = [], isLoading } = useInterestsCatalog();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Label>Select Tags (Optional)</Label>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-8 w-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Select Tags (Optional)</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Help users find this post by adding relevant interest tags.
        </p>
      </div>

      {catalog.map(({ category, interests }) => (
        <div key={category.id} className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">
            {category.label}
          </span>
          <div className="flex flex-wrap gap-2">
            {interests.map(interest => {
              const isSelected = selectedTags.includes(interest.id);
              return (
                <Badge
                  key={interest.id}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => onToggleTag(interest.id)}
                >
                  {interest.label}
                </Badge>
              );
            })}
          </div>
        </div>
      ))}

      {selectedTags.length > 0 && (
        <div className="pt-2 border-t">
          <span className="text-sm text-muted-foreground">
            Selected: {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
};
