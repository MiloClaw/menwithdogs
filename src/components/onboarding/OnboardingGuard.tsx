import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

/**
 * OnboardingGuard - Single source of truth for onboarding navigation
 * 
 * This component owns ALL navigation decisions for onboarding routes.
 * Individual pages become "dumb" - they only render UI and call mutations.
 * 
 * Flow:
 * 1. Wait for auth + couple loading to complete
 * 2. Redirect unauthenticated users to /auth
 * 3. If on wrong route, redirect to nextRoute
 * 4. Render children only when on correct route
 */
const OnboardingGuard = ({ children }: OnboardingGuardProps) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { nextRoute, loading: coupleLoading } = useCouple();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Still loading - wait
    if (authLoading || coupleLoading) return;

    // Not authenticated - redirect to auth
    if (!isAuthenticated) {
      navigate('/auth', { replace: true });
      return;
    }

    // On wrong route - redirect to correct one
    // Use startsWith for sub-routes, but exact match for the route we're on
    if (location.pathname !== nextRoute) {
      navigate(nextRoute, { replace: true });
    }
  }, [authLoading, coupleLoading, isAuthenticated, nextRoute, navigate, location.pathname]);

  // Still loading - show loading state
  if (authLoading || coupleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Not authenticated - will redirect
  if (!isAuthenticated) {
    return null;
  }

  // On wrong route - will redirect
  if (location.pathname !== nextRoute) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // On correct route - render children
  return <>{children}</>;
};

export default OnboardingGuard;
