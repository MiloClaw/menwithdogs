import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdminUser {
  user_id: string;
  email: string | null;
  first_name: string | null;
  city: string | null;
  state: string | null;
  is_profile_complete: boolean;
  created_at: string;
  couple_id: string | null;
  couple_display_name: string | null;
  couple_is_complete: boolean;
  subscription_status: string;
  roles: string[];
  ambassador_status: string | null;
}

export interface AdminUserStats {
  total_users: number;
  complete_profiles: number;
  active_couples: number;
  pro_subscribers: number;
  ambassador_count: number;
  pending_ambassadors: number;
}

interface UseAdminUsersFilters {
  search?: string;
  roleFilter?: string;
}

export function useAdminUsers(filters: UseAdminUsersFilters = {}) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('get_admin_users_list', {
        _search: filters.search || null,
        _role_filter: filters.roleFilter || null,
        _limit: 100,
        _offset: 0
      });

      if (rpcError) {
        console.error("Error fetching admin users:", rpcError);
        setError(rpcError.message);
        return;
      }

      setUsers(data || []);
    } catch (err) {
      console.error("Error in fetchUsers:", err);
      setError("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  }, [filters.search, filters.roleFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const { data, error: rpcError } = await supabase.rpc('get_admin_user_stats');

      if (rpcError) {
        console.error("Error fetching admin user stats:", rpcError);
        return;
      }

      if (data && data.length > 0) {
        setStats({
          total_users: Number(data[0].total_users),
          complete_profiles: Number(data[0].complete_profiles),
          active_couples: Number(data[0].active_couples),
          pro_subscribers: Number(data[0].pro_subscribers),
          ambassador_count: Number(data[0].ambassador_count),
          pending_ambassadors: Number(data[0].pending_ambassadors),
        });
      }
    } catch (err) {
      console.error("Error in fetchStats:", err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers, fetchStats]);

  const refetch = useCallback(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers, fetchStats]);

  return {
    users,
    stats,
    isLoading,
    error,
    refetch
  };
}
