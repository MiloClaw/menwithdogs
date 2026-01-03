import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Info } from 'lucide-react';
import { DiscoveryForm } from '@/components/admin/events/DiscoveryForm';
import { DiscoveryResults } from '@/components/admin/events/DiscoveryResults';
import { CandidateReviewModal } from '@/components/admin/events/CandidateReviewModal';
import { useEventDiscovery, EventCandidate } from '@/hooks/useEventDiscovery';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

export default function EventDiscovery() {
  const {
    candidates,
    meta,
    isLoading,
    error,
    discoverEvents,
    discardCandidate,
    clearResults,
  } = useEventDiscovery();

  const [reviewingCandidate, setReviewingCandidate] = useState<EventCandidate | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const handleReview = (candidate: EventCandidate) => {
    setReviewingCandidate(candidate);
    setReviewModalOpen(true);
  };

  const handleReviewComplete = () => {
    // Remove the completed candidate from the list
    if (reviewingCandidate) {
      discardCandidate(reviewingCandidate.id);
    }
    setReviewingCandidate(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link to="/admin/directory/events">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Discover Events</h1>
              </div>
            </div>
            <p className="text-muted-foreground ml-12">
              AI-powered event research for directory curation
            </p>
          </div>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>How this works</AlertTitle>
          <AlertDescription>
            Commission an AI research task to find event candidates in a city. 
            Review each candidate, resolve to a venue, and save as a draft or approved event.
            Events are never auto-published.
          </AlertDescription>
        </Alert>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Discovery Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Discovery Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Commission Discovery</CardTitle>
              <CardDescription>
                Configure your search parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DiscoveryForm
                onSubmit={discoverEvents}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          {/* Right: Results */}
          <div>
            {(candidates.length > 0 || meta) ? (
              <DiscoveryResults
                candidates={candidates}
                meta={meta}
                onReview={handleReview}
                onDiscard={discardCandidate}
                onClear={clearResults}
              />
            ) : (
              <Card className="h-full border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground/40 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No Results Yet
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Configure your search parameters and click "Discover Events" 
                    to find event candidates.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <CandidateReviewModal
        candidate={reviewingCandidate}
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        onComplete={handleReviewComplete}
      />
    </AdminLayout>
  );
}
