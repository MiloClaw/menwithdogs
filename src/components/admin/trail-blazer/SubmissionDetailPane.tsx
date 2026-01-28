import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ExternalLink, Calendar, CheckCircle, XCircle, AlertCircle, LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import { getContextTypeLabel, SUBMISSION_STATUS_CONFIG } from '@/lib/context-type-options';
import type { TrailBlazerSubmission } from '@/hooks/useTrailBlazerSubmissions';

interface SubmissionDetailPaneProps {
  submission: TrailBlazerSubmission;
  onApprove: (stripLink: boolean) => void;
  onRequestRevision: (feedback: string) => void;
  onDecline: (notes?: string) => void;
  onClose: () => void;
}

export function SubmissionDetailPane({
  submission,
  onApprove,
  onRequestRevision,
  onDecline,
  onClose,
}: SubmissionDetailPaneProps) {
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [declineNotes, setDeclineNotes] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);

  const isPending = submission.status === 'pending';
  const statusConfig = SUBMISSION_STATUS_CONFIG[submission.status];

  const handleRequestRevision = () => {
    if (revisionFeedback.trim()) {
      onRequestRevision(revisionFeedback.trim());
      setShowRevisionForm(false);
      setRevisionFeedback('');
    }
  };

  const handleDecline = () => {
    onDecline(declineNotes.trim() || undefined);
    setShowDeclineForm(false);
    setDeclineNotes('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold truncate">{submission.place_name}</h2>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Submitted {format(new Date(submission.submitted_at), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Place Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">PLACE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="font-medium">{submission.place_name}</div>
                {submission.place_address && (
                  <div className="text-sm text-muted-foreground">{submission.place_address}</div>
                )}
                <Badge variant="outline" className="mt-2 text-xs">
                  {submission.place_status === 'existing' ? 'In directory' : 'Pending approval'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Context Types */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Context Types
          </label>
          <div className="flex flex-wrap gap-2">
            {submission.context_types.map(type => (
              <Badge key={type} variant="secondary">
                {getContextTypeLabel(type)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Context (Main Content)
          </label>
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="whitespace-pre-wrap text-foreground">{submission.context_text}</p>
          </div>
        </div>

        {/* External Link */}
        {submission.has_external_link && submission.external_url && (
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                EXTERNAL LINK
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href={submission.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                {submission.external_url}
                <ExternalLink className="h-3 w-3" />
              </a>
              {submission.external_content_type && (
                <Badge variant="outline">{submission.external_content_type}</Badge>
              )}
              {submission.external_summary && (
                <p className="text-sm text-muted-foreground">{submission.external_summary}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Previous Feedback */}
        {submission.revision_feedback && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-amber-600 uppercase tracking-wider flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Previous Revision Feedback
            </label>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm">{submission.revision_feedback}</p>
            </div>
          </div>
        )}

        {/* Admin Notes */}
        {submission.admin_notes && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Admin Notes
            </label>
            <p className="text-sm text-muted-foreground">{submission.admin_notes}</p>
          </div>
        )}

        {/* Review Info */}
        {submission.reviewed_at && (
          <div className="text-sm text-muted-foreground">
            Reviewed on {format(new Date(submission.reviewed_at), 'MMM d, yyyy h:mm a')}
          </div>
        )}
      </div>

      {/* Actions */}
      {isPending && (
        <>
          <Separator />
          <div className="p-4 space-y-4">
            {/* Revision Form */}
            {showRevisionForm && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Revision Feedback</label>
                <Textarea
                  placeholder="What needs to be improved?"
                  value={revisionFeedback}
                  onChange={e => setRevisionFeedback(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleRequestRevision} disabled={!revisionFeedback.trim()}>
                    Send Feedback
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowRevisionForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Decline Form */}
            {showDeclineForm && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Decline Notes (optional)</label>
                <Textarea
                  placeholder="Reason for declining..."
                  value={declineNotes}
                  onChange={e => setDeclineNotes(e.target.value)}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" onClick={handleDecline}>
                    Confirm Decline
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowDeclineForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Main Action Buttons */}
            {!showRevisionForm && !showDeclineForm && (
              <div className="flex flex-wrap gap-2">
                <Button variant="destructive" size="sm" onClick={() => setShowDeclineForm(true)}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Decline
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowRevisionForm(true)}>
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Request Revision
                </Button>
                {submission.has_external_link && (
                  <Button variant="secondary" size="sm" onClick={() => onApprove(true)}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve without Link
                  </Button>
                )}
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onApprove(false)}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
