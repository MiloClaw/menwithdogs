import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { SubmissionStatus } from '@/lib/context-type-options';

export interface TrailBlazerSubmission {
  id: string;
  user_id: string;
  place_id: string | null;
  google_place_id: string;
  place_name: string;
  place_address: string | null;
  place_status: string;
  context_types: string[];
  context_text: string;
  has_external_link: boolean;
  external_url: string | null;
  external_content_type: string | null;
  external_summary: string | null;
  status: SubmissionStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
  revision_feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubmissionStats {
  total: number;
  pending: number;
  approved: number;
  needs_revision: number;
  declined: number;
}

export function useTrailBlazerSubmissions(statusFilter?: SubmissionStatus | 'all') {
  const [submissions, setSubmissions] = useState<TrailBlazerSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SubmissionStats>({ total: 0, pending: 0, approved: 0, needs_revision: 0, declined: 0 });
  const { toast } = useToast();

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('trail_blazer_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const subs = (data || []) as TrailBlazerSubmission[];
      setSubmissions(subs);

      // Calculate stats from all submissions (not filtered)
      const { data: allData } = await supabase
        .from('trail_blazer_submissions')
        .select('status');
      
      const allSubs = allData || [];
      setStats({
        total: allSubs.length,
        pending: allSubs.filter(s => s.status === 'pending').length,
        approved: allSubs.filter(s => s.status === 'approved').length,
        needs_revision: allSubs.filter(s => s.status === 'needs_revision').length,
        declined: allSubs.filter(s => s.status === 'declined').length,
      });
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      toast({
        title: 'Failed to load submissions',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, statusFilter]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const approveSubmission = async (id: string, stripLink: boolean = false) => {
    try {
      const updateData: Record<string, any> = {
        status: 'approved',
        reviewed_at: new Date().toISOString(),
      };

      if (stripLink) {
        updateData.has_external_link = false;
        updateData.external_url = null;
        updateData.external_content_type = null;
        updateData.external_summary = null;
      }

      const { error } = await supabase
        .from('trail_blazer_submissions')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Submission approved' });
      await fetchSubmissions();
      return { success: true };
    } catch (error: any) {
      toast({
        title: 'Failed to approve',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  const requestRevision = async (id: string, feedback: string) => {
    try {
      const { error } = await supabase
        .from('trail_blazer_submissions')
        .update({
          status: 'needs_revision',
          revision_feedback: feedback,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Revision requested' });
      await fetchSubmissions();
      return { success: true };
    } catch (error: any) {
      toast({
        title: 'Failed to request revision',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  const declineSubmission = async (id: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('trail_blazer_submissions')
        .update({
          status: 'declined',
          admin_notes: notes || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Submission declined' });
      await fetchSubmissions();
      return { success: true };
    } catch (error: any) {
      toast({
        title: 'Failed to decline',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  return {
    submissions,
    loading,
    stats,
    refetch: fetchSubmissions,
    approveSubmission,
    requestRevision,
    declineSubmission,
  };
}
