import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TrailBlazerPermission {
  id: string;
  user_id: string;
  can_attach_external_links: boolean;
  granted_at: string | null;
  granted_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AmbassadorWithPermission {
  user_id: string;
  email: string;
  name: string | null;
  approved_at: string | null;
  permission: TrailBlazerPermission | null;
}

export function useTrailBlazerPermissions() {
  const [ambassadors, setAmbassadors] = useState<AmbassadorWithPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAmbassadors = useCallback(async () => {
    setLoading(true);
    try {
      // Get approved ambassador applications with user_id
      const { data: applications, error: appError } = await supabase
        .from('ambassador_applications')
        .select('user_id, email, name, reviewed_at')
        .eq('status', 'approved')
        .not('user_id', 'is', null);

      if (appError) throw appError;

      // Get existing permissions
      const { data: permissions, error: permError } = await supabase
        .from('trail_blazer_permissions')
        .select('*');

      if (permError) throw permError;

      const permMap = new Map<string, TrailBlazerPermission>();
      (permissions || []).forEach(p => permMap.set(p.user_id, p as TrailBlazerPermission));

      const result: AmbassadorWithPermission[] = (applications || []).map(app => ({
        user_id: app.user_id!,
        email: app.email,
        name: app.name,
        approved_at: app.reviewed_at,
        permission: permMap.get(app.user_id!) || null,
      }));

      setAmbassadors(result);
    } catch (error: any) {
      console.error('Error fetching ambassadors:', error);
      toast({
        title: 'Failed to load ambassadors',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAmbassadors();
  }, [fetchAmbassadors]);

  const toggleExternalLinks = async (userId: string, enabled: boolean) => {
    try {
      const existing = ambassadors.find(a => a.user_id === userId)?.permission;

      if (existing) {
        // Update existing permission
        const { error } = await supabase
          .from('trail_blazer_permissions')
          .update({
            can_attach_external_links: enabled,
            granted_at: enabled ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Create new permission record
        const { error } = await supabase
          .from('trail_blazer_permissions')
          .insert({
            user_id: userId,
            can_attach_external_links: enabled,
            granted_at: enabled ? new Date().toISOString() : null,
          });

        if (error) throw error;
      }

      toast({
        title: enabled ? 'External links enabled' : 'External links disabled',
      });
      await fetchAmbassadors();
      return { success: true };
    } catch (error: any) {
      toast({
        title: 'Failed to update permission',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  const updateNotes = async (userId: string, notes: string) => {
    try {
      const existing = ambassadors.find(a => a.user_id === userId)?.permission;

      if (existing) {
        const { error } = await supabase
          .from('trail_blazer_permissions')
          .update({ notes, updated_at: new Date().toISOString() })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('trail_blazer_permissions')
          .insert({
            user_id: userId,
            can_attach_external_links: false,
            notes,
          });

        if (error) throw error;
      }

      toast({ title: 'Notes saved' });
      await fetchAmbassadors();
      return { success: true };
    } catch (error: any) {
      toast({
        title: 'Failed to save notes',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  return {
    ambassadors,
    loading,
    refetch: fetchAmbassadors,
    toggleExternalLinks,
    updateNotes,
  };
}
