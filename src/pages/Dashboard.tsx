import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Dashboard - Minimal Place-Exploration Hub
 * 
 * RULE 2 COMPLIANCE:
 * - No "profiles" in the social sense
 * - No bio/essay/photo display
 * - No partner visibility
 * - Users train the system, not present themselves
 * 
 * This is a utility hub, not a profile page.
 */
const Dashboard = () => {
  const { isAuthenticated, loading: authLoading, signOut } = useAuth();
  const { 
    hasCouple, 
    loading: coupleLoading,
  } = useCouple();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || coupleLoading) return;

    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    // No couple yet - redirect to places (behavior-first)
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
          {/* Header - No display name exposure (Rule 2) */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-semibold text-primary">
                Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">Your place discovery hub</p>
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

          {/* Minimal Preferences Card - No profile-style display */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Your preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your preferences help us recommend better places. They're private and used only to improve your experience.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/settings')}
                className="min-h-[44px]"
              >
                Manage Preferences
              </Button>
            </CardContent>
          </Card>

          {/* Privacy note */}
          <p className="text-xs text-center text-muted-foreground">
            Your preferences are private. They help tailor place recommendations.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
