import { useState, useEffect, useMemo } from 'react';
import { Shield, Users, UserCheck, CheckCircle, XCircle, Search, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AmbassadorApplicationsTab } from '@/components/admin/users/AmbassadorApplicationsTab';

interface MemberProfile {
  id: string;
  user_id: string;
  couple_id: string;
  first_name: string | null;
  city: string | null;
  is_profile_complete: boolean;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

interface Couple {
  id: string;
  display_name: string | null;
  is_complete: boolean;
}

interface EnrichedUser {
  user_id: string;
  first_name: string | null;
  city: string | null;
  is_profile_complete: boolean;
  created_at: string;
  roles: string[];
  couple: Couple | null;
}

const UserManagement = () => {
  const [profiles, setProfiles] = useState<MemberProfile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [couples, setCouples] = useState<Couple[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const [profilesRes, rolesRes, couplesRes] = await Promise.all([
        supabase
          .from('member_profiles')
          .select('id, user_id, couple_id, first_name, city, is_profile_complete, created_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('user_roles')
          .select('user_id, role'),
        supabase
          .from('couples')
          .select('id, display_name, is_complete'),
      ]);

      if (profilesRes.data) setProfiles(profilesRes.data);
      if (rolesRes.data) setRoles(rolesRes.data);
      if (couplesRes.data) setCouples(couplesRes.data);
      
      setLoading(false);
    };

    fetchData();
  }, []);

  // Build enriched user list (deduplicated by user_id)
  const enrichedUsers = useMemo(() => {
    const userMap = new Map<string, EnrichedUser>();
    
    profiles.forEach((profile) => {
      if (!userMap.has(profile.user_id)) {
        const userRoles = roles
          .filter((r) => r.user_id === profile.user_id)
          .map((r) => r.role);
        
        const couple = couples.find((c) => c.id === profile.couple_id) || null;
        
        userMap.set(profile.user_id, {
          user_id: profile.user_id,
          first_name: profile.first_name,
          city: profile.city,
          is_profile_complete: profile.is_profile_complete,
          created_at: profile.created_at,
          roles: userRoles,
          couple,
        });
      }
    });
    
    return Array.from(userMap.values());
  }, [profiles, roles, couples]);

  // Apply filters
  const filteredUsers = useMemo(() => {
    return enrichedUsers.filter((user) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = user.first_name?.toLowerCase().includes(query);
        const idMatch = user.user_id.toLowerCase().includes(query);
        if (!nameMatch && !idMatch) return false;
      }
      
      // Role filter
      if (roleFilter !== 'all') {
        if (!user.roles.includes(roleFilter)) return false;
      }
      
      // Status filter
      if (statusFilter === 'complete' && !user.is_profile_complete) return false;
      if (statusFilter === 'incomplete' && user.is_profile_complete) return false;
      
      return true;
    });
  }, [enrichedUsers, searchQuery, roleFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    return {
      totalUsers: enrichedUsers.length,
      completeProfiles: enrichedUsers.filter((u) => u.is_profile_complete).length,
      couplesCreated: couples.length,
      activeCouples: couples.filter((c) => c.is_complete).length,
    };
  }, [enrichedUsers, couples]);

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'destructive' : 'secondary';
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? Shield : UserCheck;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">View user accounts, roles, and ambassador applications</p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              All Users
            </TabsTrigger>
            <TabsTrigger value="ambassadors" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Ambassador Applications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Complete Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completeProfiles}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Couples Created</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.couplesCreated}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCouples}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Profile Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="incomplete">Incomplete</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {enrichedUsers.length === 0 ? 'No users found' : 'No users match filters'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Role(s)</TableHead>
                    <TableHead>Profile</TableHead>
                    <TableHead>Couple</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const PrimaryRoleIcon = user.roles.includes('admin') ? Shield : UserCheck;
                    return (
                      <TableRow key={user.user_id}>
                        <TableCell>
                          <div className="p-2 bg-muted rounded-full w-fit">
                            <PrimaryRoleIcon className="h-4 w-4" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {user.first_name || <span className="text-muted-foreground">Unnamed</span>}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {user.user_id.slice(0, 8)}...{user.user_id.slice(-4)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <Badge key={role} variant={getRoleBadgeVariant(role)}>
                                  {role}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.is_profile_complete ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>
                          {user.couple ? (
                            <span className="text-sm">
                              {user.couple.display_name || 'Unnamed couple'}
                              {user.couple.is_complete && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Complete
                                </Badge>
                              )}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.city || '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
