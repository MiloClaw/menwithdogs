import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AmbassadorApplication {
  id: string;
  user_id: string | null;
  email: string;
  name: string | null;
  city_name: string;
  city_google_place_id: string | null;
  city_state: string | null;
  city_country: string;
  tenure: string;
  specific_places: string | null;
  motivation: string | null;
  has_business_affiliation: boolean | null;
  business_affiliation_details: string | null;
  local_knowledge: string;
  social_links: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  declined: number;
}

export function useAmbassadorApplications() {
  const [applications, setApplications] = useState<AmbassadorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ApplicationStats>({ total: 0, pending: 0, approved: 0, declined: 0 });
  const { toast } = useToast();

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ambassador_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const apps = (data || []) as AmbassadorApplication[];
      setApplications(apps);

      // Calculate stats
      setStats({
        total: apps.length,
        pending: apps.filter(a => a.status === 'pending').length,
        approved: apps.filter(a => a.status === 'approved').length,
        declined: apps.filter(a => a.status === 'declined').length,
      });
    } catch (error: any) {
      console.error('Error fetching ambassador applications:', error);
      toast({
        title: 'Failed to load applications',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const approveApplication = async (applicationId: string) => {
    try {
      // Get the application
      const application = applications.find(a => a.id === applicationId);
      if (!application) throw new Error('Application not found');

      // Update application status
      const { error: updateError } = await supabase
        .from('ambassador_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // If user_id exists, grant ambassador role
      if (application.user_id) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: application.user_id,
            role: 'ambassador',
          });

        // Ignore duplicate key errors (already has role)
        if (roleError && !roleError.message.includes('duplicate')) {
          throw roleError;
        }
      }

      toast({
        title: 'Application approved',
        description: `${application.name || application.email} is now an Ambassador.`,
      });

      await fetchApplications();
      return { success: true };
    } catch (error: any) {
      console.error('Error approving application:', error);
      toast({
        title: 'Failed to approve',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  const declineApplication = async (applicationId: string) => {
    try {
      const application = applications.find(a => a.id === applicationId);
      if (!application) throw new Error('Application not found');

      const { error } = await supabase
        .from('ambassador_applications')
        .update({
          status: 'declined',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: 'Application declined',
        description: `${application.name || application.email}'s application has been declined.`,
      });

      await fetchApplications();
      return { success: true };
    } catch (error: any) {
      console.error('Error declining application:', error);
      toast({
        title: 'Failed to decline',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  const revokeAmbassador = async (applicationId: string) => {
    try {
      const application = applications.find(a => a.id === applicationId);
      if (!application) throw new Error('Application not found');

      // Update application status back to declined
      const { error: updateError } = await supabase
        .from('ambassador_applications')
        .update({
          status: 'declined',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Remove ambassador role if user exists
      if (application.user_id) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', application.user_id)
          .eq('role', 'ambassador');

        if (roleError) throw roleError;
      }

      toast({
        title: 'Ambassador access revoked',
        description: `${application.name || application.email} is no longer an Ambassador.`,
      });

      await fetchApplications();
      return { success: true };
    } catch (error: any) {
      console.error('Error revoking ambassador:', error);
      toast({
        title: 'Failed to revoke',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  return {
    applications,
    loading,
    stats,
    refetch: fetchApplications,
    approveApplication,
    declineApplication,
    revokeAmbassador,
  };
}
