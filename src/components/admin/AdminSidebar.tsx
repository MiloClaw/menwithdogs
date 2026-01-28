import { useLocation, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, MapPin, ArrowLeft, Tags, Calendar, ChevronDown, Building2, Sparkles, Crown, Menu, Tag, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Users', href: '/admin/users', icon: Users },
  { title: 'Founders', href: '/admin/founders', icon: Crown },
  { title: 'Trail Blazers', href: '/admin/trail-blazer', icon: Compass },
  { title: 'Interests', href: '/admin/interests', icon: Tags },
  { title: 'Pro Contexts', href: '/admin/pro-contexts', icon: Sparkles },
  { title: 'Community Tags', href: '/admin/tags', icon: Tag },
];

const directoryItems = [
  { title: 'Cities', href: '/admin/directory/cities', icon: Building2 },
  { title: 'Metros', href: '/admin/directory/metros', icon: MapPin },
  { title: 'Places', href: '/admin/directory/places', icon: MapPin },
  { title: 'Events', href: '/admin/directory/events', icon: Calendar },
];

const bottomNavItems = [
  { title: 'Announcements', href: '/admin/posts', icon: FileText },
];

// Store the last non-admin route for smart "Back to App" navigation
const LAST_APP_ROUTE_KEY = 'lastAppRoute';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const currentPath = location.pathname;
  const [sheetOpen, setSheetOpen] = useState(false);
  
  // Directory section is open by default
  const isDirectoryRoute = currentPath.startsWith('/admin/directory');
  const [directoryOpen, setDirectoryOpen] = useState<boolean>(true);

  // Track last non-admin route
  useEffect(() => {
    const storedRoute = sessionStorage.getItem(LAST_APP_ROUTE_KEY);
    // Only set if we don't have one stored or if we're coming from a non-admin route
    if (!currentPath.startsWith('/admin') && currentPath !== '/auth') {
      sessionStorage.setItem(LAST_APP_ROUTE_KEY, currentPath);
    }
  }, [currentPath]);

  const handleBackToApp = () => {
    const lastRoute = sessionStorage.getItem(LAST_APP_ROUTE_KEY) || '/places';
    navigate(lastRoute);
  };

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
      onClick={() => setSheetOpen(false)}
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

  const SidebarContent = () => (
    <>
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
      <nav className="flex-1 p-4 overflow-y-auto">
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
                      <NavItem href={item.href} icon={item.icon} title={item.title} />
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
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start gap-2" 
          onClick={handleBackToApp}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to App
        </Button>
      </div>
    </>
  );

  // Mobile: render as Sheet
  if (isMobile) {
    return (
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-3 left-3 z-50 md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 flex flex-col bg-card">
          <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: render as fixed sidebar
  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <SidebarContent />
    </aside>
  );
};

export default AdminSidebar;
