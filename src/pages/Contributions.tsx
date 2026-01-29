import { useNavigate, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useUserSubmissions, UserSubmission } from '@/hooks/useUserSubmissions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import PageLayout from '@/components/PageLayout';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const STATUS_CONFIG: Record<
  UserSubmission['status'],
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  pending: { label: 'Pending', variant: 'outline' },
  approved: { label: 'Approved', variant: 'default' },
  needs_revision: { label: 'Needs Revision', variant: 'secondary' },
  declined: { label: 'Declined', variant: 'destructive' },
};

const Contributions = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAmbassador, loading: roleLoading } = useUserRole();
  const { submissions, loading: submissionsLoading } = useUserSubmissions();

  // Auth guard
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Role guard
  if (!authLoading && !roleLoading && !isAmbassador) {
    return (
      <PageLayout>
        <div className="container py-8 md:py-12 max-w-2xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center py-12">
            <h1 className="text-2xl font-serif font-medium mb-4">
              Trail Blazer Access Required
            </h1>
            <p className="text-muted-foreground mb-6">
              This feature is available to approved Trail Blazers.
            </p>
            <Button onClick={() => navigate('/ambassadors')}>
              Learn About Trail Blazers
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const isLoading = authLoading || roleLoading || submissionsLoading;

  return (
    <PageLayout>
      <div className="container py-8 md:py-12 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight">
            Your Contributions
          </h1>
          <p className="text-muted-foreground mt-2">
            Context you've shared about places.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && submissions.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-2">No contributions yet</h2>
            <p className="text-muted-foreground mb-6">
              Share your knowledge about places you know well.
            </p>
            <Button asChild>
              <Link to="/contribute">
                <Plus className="h-4 w-4 mr-2" />
                Add Context to a Place
              </Link>
            </Button>
          </div>
        )}

        {/* Submissions List */}
        {!isLoading && submissions.length > 0 && (
          <div className="space-y-4">
            {submissions.map((submission) => {
              const statusConfig = STATUS_CONFIG[submission.status];

              return (
                <div
                  key={submission.id}
                  className="bg-muted/30 border border-border rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-base">
                        {submission.place_name}
                      </h3>
                      {submission.place_address && (
                        <p className="text-sm text-muted-foreground truncate">
                          {submission.place_address}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={statusConfig.variant}>
                          {statusConfig.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Submitted {format(new Date(submission.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>

                      {/* Revision Feedback */}
                      {submission.status === 'needs_revision' && submission.revision_feedback && (
                        <div className="mt-3 p-3 bg-secondary/50 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Feedback:
                          </p>
                          <p className="text-sm">
                            "{submission.revision_feedback}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add Another CTA */}
            <div className="pt-4 text-center">
              <Button variant="outline" asChild>
                <Link to="/contribute">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Context to Another Place
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Contributions;
