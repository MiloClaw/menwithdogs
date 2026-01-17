import { Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Tags, 
  FileText,
  Users,
  ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  badgeCount?: number;
  badgeLabel?: string;
  badgeColor?: string;
  isNew?: boolean;
  accentColor?: boolean;
}

interface QuickActionsProps {
  stats: {
    citiesReady: number;
    pendingPlaces: number;
    pendingEvents: number;
  };
}

const QuickActions = ({ stats }: QuickActionsProps) => {
  const actions: QuickAction[] = [
    {
      title: 'Manage Cities',
      description: 'City rollouts & seeding',
      href: '/admin/directory/cities',
      icon: Building2,
      badgeCount: stats.citiesReady,
      badgeLabel: 'ready',
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      title: 'Manage Places',
      description: 'Venue directory',
      href: '/admin/directory/places',
      icon: MapPin,
      badgeCount: stats.pendingPlaces,
    },
    {
      title: 'Manage Events',
      description: 'Event listings',
      href: '/admin/directory/events',
      icon: Calendar,
      badgeCount: stats.pendingEvents,
    },
    {
      title: 'Manage Users',
      description: 'User accounts & roles',
      href: '/admin/users',
      icon: Users,
    },
    {
      title: 'Manage Interests',
      description: 'Taxonomy & mappings',
      href: '/admin/interests',
      icon: Tags,
    },
    {
      title: 'Manage Posts',
      description: 'Blog & announcements',
      href: '/admin/posts',
      icon: FileText,
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
      {actions.map((action) => (
        <Link key={action.href} to={action.href}>
          <Card className={cn(
            "h-full transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer group",
            action.accentColor && "ring-1 ring-primary/30 bg-primary/5"
          )}>
            <CardHeader className="p-4 flex flex-row items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                action.accentColor 
                  ? 'bg-primary/20' 
                  : 'bg-muted'
              )}>
                <action.icon className={cn(
                  "h-5 w-5",
                  action.accentColor ? 'text-primary' : 'text-muted-foreground'
                )} />
              </div>
              
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-sm font-medium">
                    {action.title}
                  </CardTitle>
                  {action.isNew && (
                    <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                      NEW
                    </Badge>
                  )}
                  {action.badgeCount !== undefined && action.badgeCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-[10px] px-1.5 py-0",
                        action.badgeColor || 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                      )}
                    >
                      {action.badgeCount} {action.badgeLabel || 'pending'}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs line-clamp-1">
                  {action.description}
                </CardDescription>
              </div>
              
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default QuickActions;
