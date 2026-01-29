import { MapPin, Link as LinkIcon, Edit2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useContextTypes } from '@/hooks/useContextTypes';
import { SubmissionDraft } from '@/hooks/useSubmitContribution';
import { cn } from '@/lib/utils';

interface ReviewSubmitProps {
  draft: SubmissionDraft;
  isSubmitting: boolean;
  onEdit: (step: number) => void;
  onSubmit: () => void;
}

export function ReviewSubmit({ draft, isSubmitting, onEdit, onSubmit }: ReviewSubmitProps) {
  const { contextTypes } = useContextTypes();

  // Get labels for selected types
  const typeLabels = draft.contextTypes
    .map((key) => contextTypes.find((t) => t.key === key)?.label || key)
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-1">Review your submission</h2>
        <p className="text-sm text-muted-foreground">
          Make sure everything looks correct before submitting.
        </p>
      </div>

      {/* Place Section */}
      <div className="bg-muted/30 border border-border rounded-xl p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Place
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(1)}
            className="h-7 text-xs"
          >
            <Edit2 className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{draft.placeName}</p>
            <p className="text-sm text-muted-foreground">{draft.placeAddress}</p>
            <Badge
              variant="outline"
              className={cn(
                'mt-2 text-xs',
                draft.placeStatus === 'existing'
                  ? 'border-primary/30 text-primary'
                  : 'border-amber-500/30 text-amber-600 dark:text-amber-400'
              )}
            >
              {draft.placeStatus === 'existing' ? 'In Directory' : 'New Place'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Context Types Section */}
      <div className="bg-muted/30 border border-border rounded-xl p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Context Types
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(2)}
            className="h-7 text-xs"
          >
            <Edit2 className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {typeLabels.map((label) => (
            <Badge key={label} variant="secondary">
              {label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Context Text Section */}
      <div className="bg-muted/30 border border-border rounded-xl p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Your Context
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(3)}
            className="h-7 text-xs"
          >
            <Edit2 className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-6">
          "{draft.contextText}"
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {draft.contextText.length} characters
        </p>
      </div>

      {/* External Link Section */}
      {draft.hasExternalLink && draft.externalUrl && (
        <div className="bg-muted/30 border border-border rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              External Reference
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(4)}
              className="h-7 text-xs"
            >
              <Edit2 className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
          <div className="flex items-start gap-3">
            <LinkIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium break-all">{draft.externalUrl}</p>
              {draft.externalContentType && (
                <Badge variant="outline" className="mt-1 text-xs capitalize">
                  {draft.externalContentType}
                </Badge>
              )}
              {draft.externalSummary && (
                <p className="text-sm text-muted-foreground mt-2">
                  "{draft.externalSummary}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Notice */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <p className="text-sm text-center text-muted-foreground">
          Your submission will be reviewed before appearing on the place page.
        </p>
      </div>

      {/* Submit Button */}
      <Button
        onClick={onSubmit}
        disabled={isSubmitting}
        size="lg"
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit for Review'
        )}
      </Button>
    </div>
  );
}
