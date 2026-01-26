import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSubmitTagSuggestion } from '@/hooks/usePlaceTags';

interface TagSuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  { value: 'culture', label: 'Culture & Identity' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'social', label: 'Social & Vibe' },
  { value: 'outdoor', label: 'Outdoor & Nature' },
] as const;

/**
 * Simple dialog for users to suggest new canonical tags.
 * Language guardrail: "Suggest a tag that's missing"
 */
const TagSuggestionDialog = ({ open, onOpenChange }: TagSuggestionDialogProps) => {
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<'culture' | 'accessibility' | 'social' | 'outdoor' | ''>('');
  const [rationale, setRationale] = useState('');
  
  const { mutate: submitSuggestion, isPending } = useSubmitTagSuggestion();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!label.trim()) return;

    submitSuggestion({
      suggestedLabel: label.trim(),
      suggestedCategory: category || undefined,
      rationale: rationale.trim() || undefined,
    }, {
      onSuccess: () => {
        setLabel('');
        setCategory('');
        setRationale('');
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Suggest a tag that's missing</DialogTitle>
          <DialogDescription>
            Help improve community insights by suggesting a new tag.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tag-label">Tag name *</Label>
            <Input
              id="tag-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Dog-friendly patio"
              required
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tag-category">Category (optional)</Label>
            <Select 
              value={category} 
              onValueChange={(v) => setCategory(v as typeof category)}
            >
              <SelectTrigger id="tag-category">
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tag-rationale">Why is this tag useful? (optional)</Label>
            <Textarea
              id="tag-rationale"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Help us understand why this tag would be valuable..."
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !label.trim()}>
              {isPending ? 'Submitting...' : 'Submit suggestion'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TagSuggestionDialog;
