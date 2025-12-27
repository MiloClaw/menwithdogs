import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useDiscovery } from '@/hooks/useDiscovery';
import { useToast } from '@/hooks/use-toast';
import PageLayout from '@/components/PageLayout';
import { CoupleCard } from '@/components/discovery/CoupleCard';
import { DiscoveryToggle } from '@/components/discovery/DiscoveryToggle';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin } from 'lucide-react';

const Discover = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { couple, memberProfile, hasCouple, isCoupleComplete, loading: coupleLoading } = useCouple();
  const { couples, loading: discoveryLoading, isSaved, saveCouple, unsaveCouple, refetch } = useDiscovery();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auth & onboarding guards
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

  const handleSave = async (coupleId: string) => {
    try {
      await saveCouple(coupleId);
      toast({
        title: 'Saved',
        description: 'Couple saved for later. Only you can see this.',
      });
    } catch (err) {
      toast({
        title: 'Failed to save',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUnsave = async (coupleId: string) => {
    try {
      await unsaveCouple(coupleId);
      toast({
        title: 'Removed',
        description: 'Couple removed from saved.',
      });
    } catch (err) {
      toast({
        title: 'Failed to remove',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCoupleClick = (coupleId: string) => {
    navigate(`/discover/${coupleId}`);
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

  const isDiscoverable = (couple as any)?.is_discoverable ?? false;
  const userCity = memberProfile?.city;

  return (
    <PageLayout>
      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="mb-2 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
            
            <h1 className="text-2xl md:text-3xl font-serif font-semibold text-primary">
              Couples Around You
            </h1>
            <p className="text-muted-foreground">
              Updated this week
            </p>
            
            {userCity && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Showing couples in {userCity}</span>
              </div>
            )}
          </div>

          {/* Discovery Toggle */}
          {couple && isCoupleComplete && (
            <DiscoveryToggle 
              coupleId={couple.id} 
              initialValue={isDiscoverable}
              onToggle={() => refetch()}
            />
          )}

          {/* Not complete warning */}
          {!isCoupleComplete && (
            <div className="p-4 rounded-lg border border-border bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Complete your couple profile to discover others and be discoverable.
              </p>
              <Button 
                variant="link" 
                className="p-0 h-auto text-sm mt-1"
                onClick={() => navigate('/onboarding/couple-profile')}
              >
                Complete profile
              </Button>
            </div>
          )}

          {/* No city set */}
          {!userCity && isCoupleComplete && (
            <div className="p-4 rounded-lg border border-border bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Add your city to see couples nearby.
              </p>
              <Button 
                variant="link" 
                className="p-0 h-auto text-sm mt-1"
                onClick={() => navigate('/onboarding/my-profile')}
              >
                Update profile
              </Button>
            </div>
          )}

          {/* Loading state */}
          {discoveryLoading && (
            <div className="py-12 text-center text-muted-foreground">
              Finding couples nearby...
            </div>
          )}

          {/* Couple cards */}
          {!discoveryLoading && couples.length > 0 && (
            <div className="space-y-3">
              {couples.map((c) => (
                <CoupleCard
                  key={c.id}
                  id={c.id}
                  displayName={c.display_name}
                  city={c.city}
                  sharedInterests={c.shared_interests}
                  isSaved={isSaved(c.id)}
                  onSave={() => handleSave(c.id)}
                  onUnsave={() => handleUnsave(c.id)}
                  onClick={() => handleCoupleClick(c.id)}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!discoveryLoading && couples.length === 0 && userCity && isCoupleComplete && (
            <div className="py-12 text-center space-y-2">
              <p className="text-muted-foreground">
                That's everyone nearby for now.
              </p>
              <p className="text-sm text-muted-foreground">
                Check back later as more couples join.
              </p>
            </div>
          )}

          {/* End indicator for non-empty results */}
          {!discoveryLoading && couples.length > 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                That's everyone nearby for now.
              </p>
            </div>
          )}

          {/* Privacy note */}
          <p className="text-xs text-center text-muted-foreground pt-4">
            Discovery is private. Saving a couple notifies no one.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Discover;
