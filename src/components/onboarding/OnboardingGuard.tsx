import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

/**
 * OnboardingGuard - Lightweight redirect helper for /onboarding/* routes
 * 
 * Behavior-first model: The guard no longer blocks access to /places.
 * It only ensures:
 * 1. Users are authenticated to access /onboarding/* routes
 * 2. Admins are redirected to /admin
 * 
 * Profile completion is optional - users can always go to /places.
 */
const OnboardingGuard = ({ children }: OnboardingGuardProps) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();

  const isLoading = authLoading || roleLoading;

  useEffect(() => {
    console.debug('[OnboardingGuard]', {
      pathname: location.pathname,
      authLoading,
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

    // Authenticated non-admin users can access onboarding pages
    // No more forced routing - profile completion is optional
  }, [isLoading, isAuthenticated, isAdmin, navigate, location.pathname]);

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

  // Authenticated user - render children
  return <>{children}</>;
};

export default OnboardingGuard;
