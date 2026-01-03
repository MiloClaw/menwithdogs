import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, MapPin, ArrowLeft, Tags, Calendar, Sparkles, ChevronDown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

const navItems = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Users', href: '/admin/users', icon: Users },
  { title: 'Interests', href: '/admin/interests', icon: Tags },
];

const directoryItems = [
  { title: 'Cities', href: '/admin/directory/cities', icon: Building2 },
  { title: 'Places', href: '/admin/directory/places', icon: MapPin },
  { title: 'Events', href: '/admin/directory/events', icon: Calendar },
  { title: 'Discover', href: '/admin/directory/events/discover', icon: Sparkles, highlight: true },
];

const bottomNavItems = [
  { title: 'Blog', href: '/admin/blog', icon: FileText },
];

const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const currentSearch = location.search;
  
  // Directory section is open by default
  const isDirectoryRoute = currentPath.startsWith('/admin/directory');
  const [directoryOpen, setDirectoryOpen] = useState<boolean>(true);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return currentPath === '/admin';
    }
    // Exact match or nested routes
    return currentPath === href || currentPath.startsWith(href + '/');
  };

  const isDirectorySectionActive = directoryItems.some(item => isActive(item.href)) || currentPath.startsWith('/admin/directory');

  const NavItem = ({ href, icon: Icon, title, highlight }: { href: string; icon: React.ElementType; title: string; highlight?: boolean }) => (
    <Link
      to={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        isActive(href)
          ? 'bg-primary text-primary-foreground'
          : highlight
            ? 'text-primary hover:bg-primary/10'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon className="h-4 w-4" />
      {title}
    </Link>
  );

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
          {/* Top nav items */}
          {navItems.map((item) => (
            <li key={item.href}>
              <NavItem href={item.href} icon={item.icon} title={item.title} />
            </li>
          ))}

          {/* Directory Section - Collapsible */}
          <li>
            <Collapsible open={directoryOpen} onOpenChange={setDirectoryOpen}>
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    'w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isDirectorySectionActive && !directoryOpen
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4" />
                    Directory
                  </div>
                  <ChevronDown className={cn(
                    'h-4 w-4 transition-transform',
                    directoryOpen && 'rotate-180'
                  )} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                  {directoryItems.map((item) => (
                    <li key={item.href}>
                      <NavItem href={item.href} icon={item.icon} title={item.title} highlight={item.highlight} />
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </li>

          {/* Bottom nav items */}
          {bottomNavItems.map((item) => (
            <li key={item.href}>
              <NavItem href={item.href} icon={item.icon} title={item.title} />
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
