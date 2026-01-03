import { Link } from 'react-router-dom';
import { Users, FileText, MapPin, Calendar, Sparkles, Tags, AlertTriangle, Info, Building2, Rocket } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminStats } from '@/hooks/useAdminStats';

const AdminDashboard = () => {
  const { data: stats, isLoading } = useAdminStats();

  const statCards = [
    {
      label: 'Active Couples',
      value: stats?.couples.discoverable ?? 0,
      subtext: `of ${stats?.couples.total ?? 0} total`,
      icon: Users,
    },
    {
      label: 'Cities',
      value: stats?.cities.launched ?? 0,
      subtext: stats?.cities.draft ? `${stats.cities.draft} in draft` : 'None in draft',
      icon: Building2,
      badgeCount: stats?.cities.readyToLaunch,
      badgeLabel: 'ready',
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      label: 'Places',
      value: stats?.places.approved ?? 0,
      subtext: stats?.places.pending ? `${stats.places.pending} pending review` : 'All reviewed',
      icon: MapPin,
      badgeCount: stats?.places.pending,
      badgeLabel: 'pending',
    },
    {
      label: 'Events',
      value: stats?.events.approved ?? 0,
      subtext: stats?.events.pending ? `${stats.events.pending} pending review` : 'All reviewed',
      icon: Calendar,
      badgeCount: stats?.events.pending,
      badgeLabel: 'pending',
    },
  ];

  const quickActions = [
    {
      title: 'Manage Cities',
      description: 'Configure city rollouts and seeding progress',
      href: '/admin/directory/cities',
      icon: Building2,
      badgeCount: stats?.cities.readyToLaunch,
      badgeLabel: 'ready to launch',
      badgeColor: 'bg-green-100 text-green-800',
    },
    {
      title: 'Discover Events',
      description: 'AI-powered event research for your city',
      href: '/admin/directory/events/discover',
      icon: Sparkles,
      isNew: true,
      accentColor: true,
    },
    {
      title: 'Manage Places',
      description: 'Curate and review venue directory',
      href: '/admin/directory/places',
      icon: MapPin,
      badgeCount: stats?.places.pending,
      badgeLabel: 'pending',
    },
    {
      title: 'Manage Events',
      description: 'Curate and review event listings',
      href: '/admin/directory/events',
      icon: Calendar,
      badgeCount: stats?.events.pending,
      badgeLabel: 'pending',
    },
    {
      title: 'Manage Interests',
      description: 'Configure interest taxonomy and mappings',
      href: '/admin/interests',
      icon: Tags,
    },
    {
      title: 'Manage Blog',
      description: 'Create and edit blog posts',
      href: '/admin/blog',
      icon: FileText,
    },
  ];

  const needsAttention = [];
  
  // City ready to launch
  if (stats?.cities.readyToLaunch && stats.cities.readyToLaunch > 0) {
    needsAttention.push({
      type: 'success',
      message: `${stats.cities.readyToLaunch} ${stats.cities.readyToLaunch > 1 ? 'cities' : 'city'} ready to launch`,
      href: '/admin/directory/cities?status=draft',
    });
  }
  
  if (stats?.places.pending && stats.places.pending > 0) {
    needsAttention.push({
      type: 'warning',
      message: `${stats.places.pending} place${stats.places.pending > 1 ? 's' : ''} pending review`,
      href: '/admin/directory/places?status=pending',
    });
  }
  if (stats?.events.pending && stats.events.pending > 0) {
    needsAttention.push({
      type: 'warning',
      message: `${stats.events.pending} event${stats.events.pending > 1 ? 's' : ''} pending review`,
      href: '/admin/directory/events?status=pending',
    });
  }
  if (stats && stats.cities.total === 0) {
    needsAttention.push({
      type: 'info',
      message: 'No cities configured — create your first city to start seeding',
      href: '/admin/directory/cities',
    });
  } else if (stats && stats.events.approved === 0 && stats.events.pending === 0) {
    needsAttention.push({
      type: 'info',
      message: 'No events yet — use AI Discovery to find local events',
      href: '/admin/directory/events/discover',
    });
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">MainStreet IRL admin command center</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{stat.value}</span>
                      {stat.badgeCount && stat.badgeCount > 0 && (
                        <Badge variant="secondary" className={stat.badgeColor || 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}>
                          {stat.badgeCount} {stat.badgeLabel || 'pending'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{stat.subtext}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Needs Attention Queue */}
        {needsAttention.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Needs Attention</h2>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {needsAttention.map((item, index) => (
                <Link key={index} to={item.href}>
                  <Card className={`hover:bg-accent/50 transition-colors cursor-pointer border-l-4 ${
                    item.type === 'success'
                      ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20'
                      : item.type === 'warning' 
                        ? 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20' 
                        : 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                  }`}>
                    <CardContent className="py-3 flex items-center gap-3">
                      {item.type === 'success' ? (
                        <Rocket className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                      ) : item.type === 'warning' ? (
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                      ) : (
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                      )}
                      <span className="text-sm font-medium">{item.message}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <Link key={action.href} to={action.href}>
                <Card className={`h-full hover:bg-accent/50 transition-colors cursor-pointer ${
                  action.accentColor ? 'ring-1 ring-primary/30 bg-primary/5' : ''
                }`}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      action.accentColor 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted'
                    }`}>
                      <action.icon className={`h-6 w-6 ${
                        action.accentColor ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{action.title}</CardTitle>
                        {action.isNew && (
                          <Badge className="bg-primary text-primary-foreground text-xs">NEW</Badge>
                        )}
                        {action.badgeCount && action.badgeCount > 0 && (
                          <Badge variant="secondary" className={action.badgeColor || 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}>
                            {action.badgeCount}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm">{action.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
