import React, { useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Search, 
  Shield, 
  User, 
  CheckCircle, 
  XCircle, 
  Heart, 
  Loader2,
  Crown,
  Star,
  Megaphone,
  Mail
} from "lucide-react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { AmbassadorApplicationsTab } from "@/components/admin/users/AmbassadorApplicationsTab";

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const { users, stats, isLoading, error } = useAdminUsers({
    search: searchQuery,
    roleFilter: roleFilter === "all" ? undefined : roleFilter
  });

  const filteredUsers = useMemo(() => {
    return users;
  }, [users]);

  const getRoleBadge = (roles: string[]) => {
    const badges = [];
    
    if (roles.includes("admin")) {
      badges.push(
        <Badge key="admin" variant="destructive" className="gap-1">
          <Shield className="h-3 w-3" />
          Admin
        </Badge>
      );
    }
    if (roles.includes("ambassador")) {
      badges.push(
        <Badge key="ambassador" className="gap-1 bg-purple-500 hover:bg-purple-600">
          <Megaphone className="h-3 w-3" />
          Ambassador
        </Badge>
      );
    }
    if (roles.includes("user") || roles.length === 0) {
      badges.push(
        <Badge key="user" variant="secondary" className="gap-1">
          <User className="h-3 w-3" />
          User
        </Badge>
      );
    }
    
    return <div className="flex flex-wrap gap-1">{badges}</div>;
  };

  const getAmbassadorStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Applied
          </Badge>
        );
      case "declined":
        return (
          <Badge className="bg-gray-100 text-gray-600 border-gray-200">
            Declined
          </Badge>
        );
      default:
        return null;
    }
  };

  const getSubscriptionBadge = (status: string) => {
    switch (status) {
      case "founders":
        return (
          <Badge className="gap-1 bg-amber-100 text-amber-800 border-amber-200">
            <Crown className="h-3 w-3" />
            Founder
          </Badge>
        );
      case "pro":
        return (
          <Badge className="gap-1 bg-blue-100 text-blue-800 border-blue-200">
            <Star className="h-3 w-3" />
            Pro
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and ambassador applications
          </p>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              All Users
            </TabsTrigger>
            <TabsTrigger value="ambassadors" className="gap-2">
              <Megaphone className="h-4 w-4" />
              Ambassador Applications
              {stats?.pending_ambassadors && stats.pending_ambassadors > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center text-xs">
                  {stats.pending_ambassadors}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_users ?? "—"}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Complete Profiles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats?.complete_profiles ?? "—"}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Couples
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.active_couples ?? "—"}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pro Subscribers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats?.pro_subscribers ?? "—"}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Ambassadors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats?.ambassador_count ?? "—"}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Apps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats?.pending_ambassadors ?? "—"}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or user ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="ambassador">Ambassador</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>Users ({filteredUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="min-w-[900px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead className="hidden lg:table-cell">User ID</TableHead>
                          <TableHead>Role(s)</TableHead>
                          <TableHead className="hidden md:table-cell">Ambassador</TableHead>
                          <TableHead className="text-center">Profile</TableHead>
                          <TableHead className="hidden md:table-cell">Couple</TableHead>
                          <TableHead className="hidden lg:table-cell">Location</TableHead>
                          <TableHead className="hidden sm:table-cell">Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              No users found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUsers.map((user) => (
                            <TableRow key={user.user_id}>
                              {/* User Name + Email */}
                              <TableCell>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    {user.roles.includes("admin") ? (
                                      <Shield className="h-4 w-4 text-destructive" />
                                    ) : user.roles.includes("ambassador") ? (
                                      <Megaphone className="h-4 w-4 text-purple-500" />
                                    ) : (
                                      <User className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="font-medium">
                                      {user.first_name || "—"}
                                    </span>
                                  </div>
                                  {user.email && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 ml-6">
                                      <Mail className="h-3 w-3" />
                                      <span className="truncate max-w-[180px]">{user.email}</span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>

                              {/* User ID */}
                              <TableCell className="hidden lg:table-cell">
                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                  {user.user_id.slice(0, 8)}...
                                </code>
                              </TableCell>

                              {/* Roles */}
                              <TableCell>
                                {getRoleBadge(user.roles)}
                              </TableCell>

                              {/* Ambassador Status */}
                              <TableCell className="hidden md:table-cell">
                                {getAmbassadorStatusBadge(user.ambassador_status)}
                              </TableCell>

                              {/* Profile Complete */}
                              <TableCell className="text-center">
                                {user.is_profile_complete ? (
                                  <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                                )}
                              </TableCell>

                              {/* Couple Info */}
                              <TableCell className="hidden md:table-cell">
                                {user.couple_display_name ? (
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                      <Heart className="h-4 w-4 text-rose-500" />
                                      <span className="text-sm">{user.couple_display_name}</span>
                                      {user.couple_is_complete && (
                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                      )}
                                    </div>
                                    {getSubscriptionBadge(user.subscription_status)}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">—</span>
                                )}
                              </TableCell>

                              {/* Location */}
                              <TableCell className="hidden lg:table-cell">
                                <span className="text-sm">
                                  {user.city && user.state 
                                    ? `${user.city}, ${user.state}` 
                                    : user.city || user.state || "—"}
                                </span>
                              </TableCell>

                              {/* Joined Date */}
                              <TableCell className="hidden sm:table-cell">
                                <span className="text-sm text-muted-foreground">
                                  {new Date(user.created_at).toLocaleDateString()}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ambassadors">
            <AmbassadorApplicationsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
