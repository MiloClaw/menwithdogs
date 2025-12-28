import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Users, Check, Settings } from 'lucide-react';

/**
 * "Pending Match" holding state - a trust ceremony.
 * Shown when couple is complete and waiting for introductions.
 * Sets cadence expectations and confirms readiness.
 */
const PendingMatch = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { couple, hasCouple, loading: coupleLoading } = useCouple();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || coupleLoading) return;

    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (!hasCouple) {
      navigate('/onboarding/create-couple');
      return;
    }

    // If couple is active (receiving intros), go to dashboard
    if (couple?.status === 'active') {
      navigate('/dashboard');
      return;
    }

    // If still onboarding, go to appropriate step
    if (couple?.status === 'onboarding') {
      navigate('/onboarding');
      return;
    }
  }, [authLoading, coupleLoading, isAuthenticated, hasCouple, couple, navigate]);

  if (authLoading || coupleLoading) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container py-12 text-center max-w-md mx-auto px-4">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary/10 flex items-center justify-center">
          <Users className="w-8 h-8 text-secondary" />
        </div>

        {/* Headline */}
        <h1 className="text-2xl font-serif font-semibold text-primary mb-3">
          We're finding the right match
        </h1>

        {/* Explanation */}
        <p className="text-muted-foreground mb-8">
          We carefully curate introductions—expect 1-3 per month, 
          focused on genuine connection, not volume.
        </p>

        {/* Status checklist */}
        <div className="p-4 bg-surface rounded-lg border border-border text-sm text-left space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span>Your profile is complete</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span>You're in our matching queue</span>
          </div>
          <div className="pt-3 border-t border-border">
            <p className="text-muted-foreground">
              We'll notify you when there's a potential connection.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/dashboard')}
          >
            <Settings className="w-4 h-4 mr-2" />
            View your profile
          </Button>
        </div>

        {/* Privacy note */}
        <p className="text-xs text-muted-foreground mt-8">
          Your individual profiles are always private. Only your couple profile is used for matching.
        </p>
      </div>
    </PageLayout>
  );
};

export default PendingMatch;
