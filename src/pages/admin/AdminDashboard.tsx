import { Link } from 'react-router-dom';
import { Users, FileText, LayoutDashboard, Shield } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboard = () => {
  const adminLinks = [
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
    <PageLayout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your application</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {adminLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <link.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{link.title}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Dashboard statistics will be available in a future update.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AdminDashboard;
