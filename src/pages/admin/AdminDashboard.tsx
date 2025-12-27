import { Link } from 'react-router-dom';
import { Users, FileText, TrendingUp, Calendar } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboard = () => {
  const stats = [
    { label: 'Total Users', value: '—', icon: Users, change: null },
    { label: 'Blog Posts', value: '—', icon: FileText, change: null },
    { label: 'Active Couples', value: '—', icon: TrendingUp, change: null },
    { label: 'This Month', value: '—', icon: Calendar, change: null },
  ];

  const quickLinks = [
    {
      title: 'User Management',
      description: 'View and manage user accounts and roles',
      href: '/admin/users',
      icon: Users,
    },
    {
      title: 'Blog Management',
      description: 'Create, edit, and delete blog posts',
      href: '/admin/blog',
      icon: FileText,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your application</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change && (
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <link.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{link.title}</CardTitle>
                      <CardDescription className="text-sm">{link.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Placeholder for future stats */}
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Real-time statistics will be available in a future update.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
