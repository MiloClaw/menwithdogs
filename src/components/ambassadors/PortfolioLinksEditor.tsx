import { Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import { CONTENT_TYPES, type PortfolioLink, type ContentType } from '@/lib/trail-blazer-options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PortfolioLinksEditorProps {
  links: PortfolioLink[];
  onLinksChange: (links: PortfolioLink[]) => void;
  maxLinks?: number;
  className?: string;
}

const emptyLink: PortfolioLink = {
  url: '',
  contentType: 'article_essay',
  notes: '',
};

const PortfolioLinksEditor = ({
  links,
  onLinksChange,
  maxLinks = 5,
  className,
}: PortfolioLinksEditorProps) => {
  const addLink = () => {
    if (links.length < maxLinks) {
      onLinksChange([...links, { ...emptyLink }]);
    }
  };

  const removeLink = (index: number) => {
    onLinksChange(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: keyof PortfolioLink, value: string) => {
    const updated = links.map((link, i) => {
      if (i === index) {
        return { ...link, [field]: value };
      }
      return link;
    });
    onLinksChange(updated);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {links.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-border rounded-lg">
          <LinkIcon className="w-8 h-8 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Add links to your existing writing, guides, or photography
          </p>
          <Button type="button" variant="outline" size="sm" onClick={addLink}>
            <Plus className="w-4 h-4 mr-2" />
            Add Portfolio Link
          </Button>
        </div>
      ) : (
        <>
          {links.map((link, index) => (
            <div
              key={index}
              className="p-4 border border-border rounded-lg space-y-4 bg-muted/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                        type="url"
                      />
                    </div>
                    <Select
                      value={link.contentType}
                      onValueChange={(value) => updateLink(index, 'contentType', value as ContentType)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    placeholder="Brief note about this content (optional)"
                    value={link.notes || ''}
                    onChange={(e) => updateLink(index, 'notes', e.target.value)}
                    className="min-h-[60px] resize-none"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => removeLink(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {links.length < maxLinks && (
            <Button type="button" variant="outline" size="sm" onClick={addLink}>
              <Plus className="w-4 h-4 mr-2" />
              Add Another Link ({links.length}/{maxLinks})
            </Button>
          )}
        </>
      )}

      {links.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Links are reviewed for relevance and quality before publication.
        </p>
      )}
    </div>
  );
};

export default PortfolioLinksEditor;
