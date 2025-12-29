import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useDiscovery } from '@/hooks/useDiscovery';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import InterestTag from '@/components/InterestTag';
import { ArrowLeft, Bookmark, BookmarkCheck, MapPin } from 'lucide-react';
import { getInterestLabels } from '@/lib/interests';

interface DiscoverableCouple {
  id: string;
  display_name: string | null;
  about_us: string | null;
  shared_interests: string[] | null;
  city: string | null;
}

const DiscoverCoupleView = () => {
  const { coupleId } = useParams<{ coupleId: string }>();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { hasCouple, loading: coupleLoading } = useCouple();
  const { isSaved, saveCouple, unsaveCouple } = useDiscovery();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if navigated from suggestions
  const fromSuggestions = (location.state as { from?: string })?.from === 'suggestions';

  const [viewedCouple, setViewedCouple] = useState<DiscoverableCouple | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth guard
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
  }, [authLoading, coupleLoading, isAuthenticated, hasCouple, navigate]);

  // Fetch the viewed couple
  useEffect(() => {
    const fetchCouple = async () => {
      if (!coupleId) {
        setError('No couple specified');
        setLoading(false);
        return;
      }

      try {
        // Fetch the couple (RLS ensures only discoverable ones are visible)
        const { data: couple, error: coupleError } = await supabase
          .from('couples')
          .select('id, display_name, about_us, shared_interests')
          .eq('id', coupleId)
          .eq('is_discoverable', true)
          .eq('is_complete', true)
          .maybeSingle();

        if (coupleError) throw coupleError;

        if (!couple) {
          setError('This couple is not available');
          setLoading(false);
          return;
        }

        // Get city from couple_location_summary (Phase 5)
        const { data: locationSummary } = await supabase
          .from('couple_location_summary')
          .select('city')
          .eq('couple_id', coupleId)
          .maybeSingle();

        const city = locationSummary?.city || null;

        setViewedCouple({
          ...couple,
          city,
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load couple');
        setLoading(false);
      }
    };

    fetchCouple();
  }, [coupleId]);

  const handleSaveToggle = async () => {
    if (!coupleId) return;

    try {
      if (isSaved(coupleId)) {
        await unsaveCouple(coupleId);
        toast({
          title: 'Removed',
          description: 'Couple removed from saved.',
        });
      } else {
        await saveCouple(coupleId);
        toast({
          title: 'Saved',
          description: 'Couple saved for later. Only you can see this.',
        });
      }
    } catch (err) {
      toast({
        title: 'Action failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || coupleLoading || loading) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  if (error || !viewedCouple) {
    return (
      <PageLayout>
        <div className="container py-8 md:py-12">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <p className="text-muted-foreground">{error || 'Couple not found'}</p>
            <Button variant="outline" onClick={() => navigate(fromSuggestions ? '/pending-match' : '/discover')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {fromSuggestions ? 'Back to your suggestions' : 'Back to discovery'}
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const saved = coupleId ? isSaved(coupleId) : false;
  const interestLabels = viewedCouple.shared_interests?.length
    ? getInterestLabels(viewedCouple.shared_interests)
    : [];

  return (
    <PageLayout>
      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Back button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(fromSuggestions ? '/pending-match' : '/discover')}
            className="-ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {fromSuggestions ? 'Back to your suggestions' : 'Back to discovery'}
          </Button>

          {/* Couple header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-serif font-semibold text-primary">
                  {viewedCouple.display_name || 'A couple nearby'}
                </h1>
                
                {viewedCouple.city && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{viewedCouple.city}</span>
                  </div>
                )}
              </div>

              {/* Save button */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleSaveToggle}
                className="shrink-0 h-11 w-11"
                aria-label={saved ? 'Remove from saved' : 'Save for later'}
              >
                {saved ? (
                  <BookmarkCheck className="h-5 w-5 text-accent" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* About us */}
          {viewedCouple.about_us && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                About us
              </h2>
              <p className="text-foreground leading-relaxed">
                {viewedCouple.about_us}
              </p>
            </div>
          )}

          {/* Shared interests */}
          {interestLabels.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Shared interests
              </h2>
              <div className="flex flex-wrap gap-2">
                {interestLabels.map((label, index) => (
                  <InterestTag 
                    key={viewedCouple.shared_interests?.[index] || index} 
                    label={label} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Privacy note */}
          <p className="text-xs text-center text-muted-foreground pt-8">
            This is a read-only view. Saving notifies no one.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default DiscoverCoupleView;
