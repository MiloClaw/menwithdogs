import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserSubmission {
  id: string;
  place_name: string;
  place_address: string | null;
  context_types: string[];
  status: 'pending' | 'approved' | 'needs_revision' | 'declined';
  revision_feedback: string | null;
  created_at: string;
}

export function useUserSubmissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    if (!user) {
      setSubmissions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trail_blazer_submissions')
        .select('id, place_name, place_address, context_types, status, revision_feedback, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions((data || []) as UserSubmission[]);
    } catch (err) {
      console.error('Error fetching user submissions:', err);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return { submissions, loading, refetch: fetchSubmissions };
}
