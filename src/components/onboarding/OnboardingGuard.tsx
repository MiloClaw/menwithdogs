import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useUserRole } from '@/hooks/useUserRole';

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
  const { isAdmin, loading: roleLoading } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();

  const isLoading = authLoading || coupleLoading || roleLoading;

  useEffect(() => {
    console.debug('[OnboardingGuard]', {
      pathname: location.pathname,
      nextRoute,
      authLoading,
      coupleLoading,
      roleLoading,
      isAuthenticated,
      isAdmin,
    });

    // Still loading - wait
    if (isLoading) return;

    // Not authenticated - redirect to auth
    if (!isAuthenticated) {
      navigate('/auth', { replace: true });
      return;
    }

    // Admin users bypass onboarding - redirect to admin
    if (isAdmin) {
      console.debug('[OnboardingGuard] Admin user detected, redirecting to /admin');
      navigate('/admin', { replace: true });
      return;
    }

    // On wrong route - redirect to correct one
    if (location.pathname !== nextRoute) {
      console.debug('[OnboardingGuard] Redirecting to:', nextRoute);
      navigate(nextRoute, { replace: true });
    }
  }, [isLoading, isAuthenticated, isAdmin, nextRoute, navigate, location.pathname]);

  // Still loading - show loading state
  if (isLoading) {
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

  // Admin users - will redirect to /admin
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
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
