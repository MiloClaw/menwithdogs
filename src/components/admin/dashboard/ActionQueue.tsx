import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Clock, 
  Rocket, 
  Info, 
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Calendar,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ActionPriority = 'critical' | 'urgent' | 'opportunity' | 'info';

interface ActionItem {
  id: string;
  priority: ActionPriority;
  message: string;
  href: string;
  icon?: React.ElementType;
  count?: number;
}

interface ActionQueueProps {
  items: ActionItem[];
  isLoading?: boolean;
}

const priorityConfig: Record<ActionPriority, {
  icon: React.ElementType;
  bgClass: string;
  borderClass: string;
  iconClass: string;
  label: string;
}> = {
  critical: {
    icon: AlertTriangle,
    bgClass: 'bg-destructive/10 dark:bg-destructive/20',
    borderClass: 'border-l-destructive',
    iconClass: 'text-destructive',
    label: 'Critical',
  },
  urgent: {
    icon: Clock,
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    borderClass: 'border-l-amber-500',
    iconClass: 'text-amber-600 dark:text-amber-400',
    label: 'Urgent',
  },
  opportunity: {
    icon: Rocket,
    bgClass: 'bg-green-50 dark:bg-green-950/30',
    borderClass: 'border-l-green-500',
    iconClass: 'text-green-600 dark:text-green-400',
    label: 'Opportunity',
  },
  info: {
    icon: Info,
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    borderClass: 'border-l-blue-500',
    iconClass: 'text-blue-600 dark:text-blue-400',
    label: 'Info',
  },
};

const ActionQueue = ({ items, isLoading }: ActionQueueProps) => {
  // Sort by priority
  const sortedItems = [...items].sort((a, b) => {
    const order: ActionPriority[] = ['critical', 'urgent', 'opportunity', 'info'];
    return order.indexOf(a.priority) - order.indexOf(b.priority);
  });

  const hasItems = sortedItems.length > 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Action Queue
          {hasItems && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {sortedItems.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {!hasItems ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">
              All caught up!
            </p>
            <p className="text-xs text-muted-foreground">
              No pending actions
            </p>
          </div>
        ) : (
          sortedItems.map((item) => {
            const config = priorityConfig[item.priority];
            const Icon = item.icon || config.icon;
            
            return (
              <Link key={item.id} to={item.href}>
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border-l-4 transition-colors hover:opacity-80",
                  config.bgClass,
                  config.borderClass
                )}>
                  <Icon className={cn("h-4 w-4 shrink-0", config.iconClass)} />
                  <span className="text-sm font-medium flex-1 min-w-0 truncate">
                    {item.message}
                  </span>
                  {item.count !== undefined && item.count > 0 && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {item.count}
                    </Badge>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export function buildActionQueue(stats: {
  citiesReadyToLaunch: number;
  emergingCities: number;
  pendingPlaces: number;
  pendingEvents: number;
  totalCities: number;
  totalEvents: number;
  expiringEvents?: number;
  stalePlaces?: number;
}): ActionItem[] {
  const items: ActionItem[] = [];

  // Critical - none for now, but structure is ready

  // Urgent - pending reviews
  if (stats.pendingPlaces > 0) {
    items.push({
      id: 'pending-places',
      priority: 'urgent',
      message: `${stats.pendingPlaces} place${stats.pendingPlaces > 1 ? 's' : ''} pending review`,
      href: '/admin/directory/places?status=pending',
      icon: MapPin,
      count: stats.pendingPlaces,
    });
  }

  if (stats.pendingEvents > 0) {
    items.push({
      id: 'pending-events',
      priority: 'urgent',
      message: `${stats.pendingEvents} event${stats.pendingEvents > 1 ? 's' : ''} pending review`,
      href: '/admin/directory/events?status=pending',
      icon: Calendar,
      count: stats.pendingEvents,
    });
  }

  // Opportunity - cities ready to launch
  if (stats.citiesReadyToLaunch > 0) {
    items.push({
      id: 'cities-ready',
      priority: 'opportunity',
      message: `${stats.citiesReadyToLaunch} ${stats.citiesReadyToLaunch > 1 ? 'cities' : 'city'} ready to launch`,
      href: '/admin/directory/cities?status=draft',
      icon: Rocket,
    });
  }

  // Opportunity - emerging demand
  if (stats.emergingCities > 0) {
    items.push({
      id: 'emerging-cities',
      priority: 'opportunity',
      message: `Organic demand in ${stats.emergingCities} new ${stats.emergingCities > 1 ? 'cities' : 'city'}`,
      href: '/admin/directory/places?source=emerging',
      icon: TrendingUp,
    });
  }

  // Info - no content yet
  if (stats.totalCities === 0) {
    items.push({
      id: 'no-cities',
      priority: 'info',
      message: 'Create your first city to start',
      href: '/admin/directory/cities',
    });
  } else if (stats.totalEvents === 0) {
    items.push({
      id: 'no-events',
      priority: 'info',
      message: 'Add your first event',
      href: '/admin/directory/events',
    });
  }

  return items;
}

export default ActionQueue;
