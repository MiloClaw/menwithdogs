import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Users', href: '/admin/users', icon: Users },
  { title: 'Blog', href: '/admin/blog', icon: FileText },
];

const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (href: string) => {
    if (href === '/admin') {
      return currentPath === '/admin';
    }
    return currentPath.startsWith(href);
  };

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-lg">Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
