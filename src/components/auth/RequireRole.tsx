import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import PageLayout from '@/components/PageLayout';

type AppRole = 'admin' | 'moderator' | 'user';

interface RequireRoleProps {
  children: ReactNode;
  role: AppRole;
  fallbackPath?: string;
}

export function RequireRole({ 
  children, 
  role, 
  fallbackPath = '/dashboard' 
}: RequireRoleProps) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { hasRole, loading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!hasRole(role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
