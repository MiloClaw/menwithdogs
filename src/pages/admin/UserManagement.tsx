import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Shield, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface UserWithRole {
  user_id: string;
  role: string;
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      // Fetch all user roles (admins can see all via RLS bypass in has_role)
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setUsers(data);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'moderator':
        return UserCheck;
      default:
        return Users;
    }
  };

  return (
    <PageLayout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">View user accounts and roles</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {users.map((user) => {
              const RoleIcon = getRoleIcon(user.role);
              return (
                <Card key={`${user.user_id}-${user.role}`}>
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-full">
                          <RoleIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-mono">
                            {user.user_id.slice(0, 8)}...
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Joined {new Date(user.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}

        <Card className="mt-8 border-dashed">
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Role assignment UI coming in a future update.
              <br />
              For now, assign roles via database.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default UserManagement;
