import { Lock, Link as LinkIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExternalLinkEditorProps {
  canAttachLinks: boolean;
  hasExternalLink: boolean;
  externalUrl: string;
  externalContentType: string;
  externalSummary: string;
  onChange: (data: {
    hasExternalLink: boolean;
    externalUrl: string;
    externalContentType: string;
    externalSummary: string;
  }) => void;
}

const CONTENT_TYPES = [
  { value: 'article', label: 'Article / Essay' },
  { value: 'photography', label: 'Photography' },
  { value: 'video', label: 'Video' },
  { value: 'guide', label: 'Trail Guide' },
  { value: 'map', label: 'Map / Route' },
  { value: 'other', label: 'Other' },
];

export function ExternalLinkEditor({
  canAttachLinks,
  hasExternalLink,
  externalUrl,
  externalContentType,
  externalSummary,
  onChange,
}: ExternalLinkEditorProps) {
  const updateField = (field: string, value: string | boolean) => {
    onChange({
      hasExternalLink,
      externalUrl,
      externalContentType,
      externalSummary,
      [field]: value,
    });
  };

  // Permission-gated: show locked state
  if (!canAttachLinks) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium mb-1">External links</h2>
          <p className="text-sm text-muted-foreground">
            Link to your existing work about this place.
          </p>
        </div>

        <div className="bg-muted/30 border border-border rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Not available yet</h3>
              <p className="text-sm text-muted-foreground">
                External links are enabled after your first approved submission. 
                You can skip this step for now.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-1">Link to your existing work (optional)</h2>
        <p className="text-sm text-muted-foreground">
          If you've written about or photographed this place, you can include a reference.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="include-link" className="text-base font-normal cursor-pointer">
          Include external reference
        </Label>
        <Switch
          id="include-link"
          checked={hasExternalLink}
          onCheckedChange={(checked) => updateField('hasExternalLink', checked)}
        />
      </div>

      {hasExternalLink && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-2">
            <Label htmlFor="external-url">URL</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="external-url"
                type="url"
                value={externalUrl}
                onChange={(e) => updateField('externalUrl', e.target.value)}
                placeholder="https://example.com/my-article"
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content-type">Content type</Label>
            <Select
              value={externalContentType}
              onValueChange={(val) => updateField('externalContentType', val)}
            >
              <SelectTrigger id="content-type">
                <SelectValue placeholder="Select type..." />
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

          <div className="space-y-2">
            <Label htmlFor="external-summary">Brief description</Label>
            <Input
              id="external-summary"
              type="text"
              value={externalSummary}
              onChange={(e) => updateField('externalSummary', e.target.value)}
              placeholder="My guide to the best viewpoints"
              maxLength={150}
            />
            <p className="text-xs text-muted-foreground">
              {externalSummary.length}/150 characters
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
