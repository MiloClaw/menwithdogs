import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Supplementary table types
export interface IdentitySignal {
  id: string;
  application_id: string;
  role_types: string[];
  other_role_description: string | null;
}

export interface ExpertiseSignal {
  id: string;
  application_id: string;
  expertise_areas: string[];
  other_expertise_description: string | null;
}

export interface PortfolioLink {
  id: string;
  application_id: string;
  url: string;
  content_type: string;
  notes: string | null;
  submitted_order: number;
}

export interface PlaceReference {
  id: string;
  application_id: string;
  google_place_id: string;
  place_name: string;
  formatted_address: string | null;
  place_types: string[] | null;
  place_status: string;
}

export interface Acknowledgements {
  id: string;
  application_id: string;
  place_focus: boolean;
  link_review: boolean;
  no_public_profile: boolean;
  no_promotion_required: boolean;
}

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
  // Supplementary data (may be null if not joined or not present)
  identity_signals?: IdentitySignal | null;
  expertise_signals?: ExpertiseSignal | null;
  portfolio_links?: PortfolioLink[];
  place_references?: PlaceReference[];
  acknowledgements?: Acknowledgements | null;
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
      // Fetch applications with supplementary Trail Blazer data
      const { data, error } = await supabase
        .from('ambassador_applications')
        .select(`
          *,
          identity_signals:trail_blazer_identity_signals(*),
          expertise_signals:trail_blazer_expertise_signals(*),
          portfolio_links:trail_blazer_portfolio_links(*),
          place_references:trail_blazer_place_references(*),
          acknowledgements:trail_blazer_acknowledgements(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process data - Supabase returns arrays for one-to-one joins, extract first item
      const apps = (data || []).map((app: any) => ({
        ...app,
        identity_signals: Array.isArray(app.identity_signals) ? app.identity_signals[0] || null : app.identity_signals,
        expertise_signals: Array.isArray(app.expertise_signals) ? app.expertise_signals[0] || null : app.expertise_signals,
        acknowledgements: Array.isArray(app.acknowledgements) ? app.acknowledgements[0] || null : app.acknowledgements,
        portfolio_links: Array.isArray(app.portfolio_links) 
          ? app.portfolio_links.sort((a: PortfolioLink, b: PortfolioLink) => a.submitted_order - b.submitted_order)
          : [],
        place_references: Array.isArray(app.place_references) ? app.place_references : [],
      })) as AmbassadorApplication[];

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
      const application = applications.find(a => a.id === applicationId);
      if (!application) throw new Error('Application not found');

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
        description: `${application.name || application.email} is now a Trail Blazer.`,
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
        title: 'Trail Blazer access revoked',
        description: `${application.name || application.email} is no longer a Trail Blazer.`,
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
