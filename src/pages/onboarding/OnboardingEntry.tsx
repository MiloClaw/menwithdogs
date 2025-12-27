import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';

/**
 * Onboarding entry point.
 * Routes user to appropriate step based on their state.
 */
const OnboardingEntry = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { hasCouple, isProfileComplete, isCoupleComplete, loading: coupleLoading } = useCouple();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || coupleLoading) return;

    // Not authenticated - go to auth
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    // No couple yet - create one
    if (!hasCouple) {
      navigate('/onboarding/create-couple');
      return;
    }

    // Has couple but profile not complete - complete it
    if (!isProfileComplete) {
      navigate('/onboarding/my-profile');
      return;
    }

    // Profile complete but couple not complete (waiting for partner)
    if (!isCoupleComplete) {
      navigate('/onboarding/invite-partner');
      return;
    }

    // Everything complete - go to dashboard
    navigate('/dashboard');
  }, [authLoading, coupleLoading, isAuthenticated, hasCouple, isProfileComplete, isCoupleComplete, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  );
};

export default OnboardingEntry;
