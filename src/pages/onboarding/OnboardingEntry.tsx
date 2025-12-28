import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';

/**
 * Onboarding entry point.
 * Routes user to appropriate step based on their state using nextRoute.
 * 
 * Rule 2: No UX routing based on row existence.
 * Only enums and explicit states.
 */
const OnboardingEntry = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { nextRoute, loading: coupleLoading } = useCouple();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || coupleLoading) return;

    // Not authenticated - go to auth
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    // Use computed nextRoute from state machine
    navigate(nextRoute);
  }, [authLoading, coupleLoading, isAuthenticated, nextRoute, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  );
};

export default OnboardingEntry;
