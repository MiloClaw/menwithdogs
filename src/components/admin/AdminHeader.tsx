import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const routeLabels: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/users': 'User Management',
  '/admin/founders': 'Founders Program',
  '/admin/interests': 'Interest Management',
  '/admin/pro-contexts': 'PRO Contexts',
  '/admin/directory/cities': 'Cities',
  '/admin/directory/metros': 'Metros',
  '/admin/directory/places': 'Places',
  '/admin/directory/events': 'Events',
  '/admin/posts': 'Announcements',
  '/admin/blog': 'Blog Management',
};

const AdminHeader = () => {
  const location = useLocation();
  const { toast } = useToast();

  const currentLabel = routeLabels[location.pathname] || 'Admin';
  const isSubPage = location.pathname !== '/admin';

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm">
        <Link 
          to="/admin" 
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Admin
        </Link>
        {isSubPage && (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{currentLabel}</span>
          </>
        )}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
