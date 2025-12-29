import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useUserRole } from '@/hooks/useUserRole';
import PageLayout from '@/components/PageLayout';
import SuggestionCard from '@/components/suggestions/SuggestionCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Check, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * "Pending Match" holding state with curated suggestions.
 * Shows proof that the system understood them and is actively working.
 */
const PendingMatch = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { couple, hasCouple, loading: coupleLoading } = useCouple();
  const { suggestions, loading: suggestionsLoading, isEmpty, refetch } = useSuggestions();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleRegenerateSuggestions = async () => {
    if (!couple?.id) return;

    try {
      const { error } = await supabase.functions.invoke('generate-suggestions', {
        body: { couple_id: couple.id },
      });

      if (error) throw error;

      toast({
        title: 'Suggestions regenerated',
        description: 'New suggestions have been generated.',
      });

      refetch();
    } catch (err) {
      toast({
        title: 'Failed to regenerate',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSuggestionClick = (candidateCoupleId: string) => {
    navigate(`/discover/${candidateCoupleId}`, { state: { from: 'suggestions' } });
  };

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
      <div className="container py-12 max-w-md mx-auto px-4">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary/10 flex items-center justify-center">
          <Users className="w-8 h-8 text-secondary" />
        </div>

        {/* Headline */}
        <h1 className="text-2xl font-serif font-semibold text-primary mb-3 text-center">
          You're all set
        </h1>

        {/* Explanation */}
        <p className="text-muted-foreground mb-8 text-center">
          We carefully curate introductions—expect 1-3 per month, 
          focused on genuine connection, not volume.
        </p>

        {/* Status checklist */}
        <div className="p-4 bg-surface rounded-lg border border-border text-sm text-left space-y-3 mb-8">
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
        </div>

        {/* Suggestions section */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
            Couples we think you'll click with
          </h2>

          {suggestionsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ) : isEmpty ? (
            <div className="p-6 rounded-lg border border-border bg-muted/30 text-center">
              <p className="text-muted-foreground text-sm">
                We're putting together your first set of suggestions. 
                This usually takes a little time as we look for the right fit.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  id={suggestion.id}
                  candidateCoupleId={suggestion.candidateCoupleId}
                  displayName={suggestion.displayName}
                  city={suggestion.city}
                  surfacedReason={suggestion.surfacedReason}
                  onClick={() => handleSuggestionClick(suggestion.candidateCoupleId)}
                />
              ))}
            </div>
          )}

          {/* Footer note */}
          {!isEmpty && !suggestionsLoading && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              More suggestions appear over time
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/dashboard')}
          >
            <Settings className="w-4 h-4 mr-2" />
            View your profile
          </Button>

          {/* Admin-only regenerate link */}
          {isAdmin && (
            <button
              onClick={handleRegenerateSuggestions}
              className="w-full text-xs text-muted-foreground hover:text-foreground underline transition-colors"
            >
              Regenerate suggestions (admin)
            </button>
          )}
        </div>

        {/* Privacy note */}
        <p className="text-xs text-muted-foreground mt-8 text-center">
          Your individual profiles are always private. Only your couple profile is used for matching.
        </p>
      </div>
    </PageLayout>
  );
};

export default PendingMatch;
