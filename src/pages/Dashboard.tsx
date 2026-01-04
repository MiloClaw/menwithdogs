import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useMemberInterests, useCoupleInterests, useInterestsCatalog, getInterestLabelsFromCatalog } from '@/hooks/useInterests';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const { isAuthenticated, loading: authLoading, signOut } = useAuth();
  const { 
    couple, 
    memberProfile, 
    partnerProfile,
    hasCouple, 
    loading: coupleLoading,
  } = useCouple();
  const navigate = useNavigate();

  // Fetch interests from database
  const { data: catalog } = useInterestsCatalog();
  const { interests: memberInterestIds } = useMemberInterests();
  const { interests: coupleInterestIds } = useCoupleInterests(couple?.id);

  // Convert interest IDs to labels
  const memberInterestLabels = catalog 
    ? getInterestLabelsFromCatalog(catalog, memberInterestIds) 
    : [];
  const coupleInterestLabels = catalog 
    ? getInterestLabelsFromCatalog(catalog, coupleInterestIds) 
    : [];

  useEffect(() => {
    if (authLoading || coupleLoading) return;

    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    // No couple yet - redirect to places (behavior-first)
    // They can explore and the relationship unit will be created lazily
    if (!hasCouple) {
      navigate('/places');
      return;
    }
  }, [authLoading, coupleLoading, isAuthenticated, hasCouple, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-semibold text-primary">
                {couple?.display_name || 'Your Dashboard'}
              </h1>
              <p className="text-muted-foreground mt-1">Your preferences are set</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/places')}>
                Explore Places
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          </div>

          {/* Status cards */}
          <div className="grid gap-4">

            {/* Your profile */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Your profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Name:</span>{' '}
                  <span className="font-medium">{memberProfile?.first_name || 'Not set'}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Location:</span>{' '}
                  <span className="font-medium">{memberProfile?.city || 'Not set'}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Interests:</span>{' '}
                  <span className="font-medium">
                    {memberInterestLabels.length > 0 
                      ? memberInterestLabels.join(', ')
                      : 'Not set'}
                  </span>
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm"
                  onClick={() => navigate('/preferences')}
                >
                  Edit preferences
                </Button>
              </CardContent>
            </Card>

            {/* Partner profile (if joined) */}
            {partnerProfile && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Partner's profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Name:</span>{' '}
                    <span className="font-medium">{partnerProfile.first_name || 'Not set'}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Location:</span>{' '}
                    <span className="font-medium">{partnerProfile.city || 'Not set'}</span>
                  </p>
                  {/* Partner interests would need separate fetch - omit for now */}
                </CardContent>
              </Card>
            )}

            {/* Couple profile */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Couple profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Display name:</span>{' '}
                  <span className="font-medium">{couple?.display_name || 'Not set'}</span>
                </p>
                {couple?.about_us && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {couple.about_us}
                  </p>
                )}
                <p className="text-sm">
                  <span className="text-muted-foreground">Shared interests:</span>{' '}
                  <span className="font-medium">
                    {coupleInterestLabels.length > 0 
                      ? coupleInterestLabels.join(', ')
                      : 'Not set'}
                  </span>
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm"
                  onClick={() => navigate('/onboarding/couple-profile')}
                >
                  Edit couple profile
                </Button>
              </CardContent>
            </Card>

          </div>

          {/* Privacy note */}
          <p className="text-xs text-center text-muted-foreground">
            Your individual profiles are always private. Your preferences help tailor the places and content we recommend.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
