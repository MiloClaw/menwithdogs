import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ContextType {
  id: string;
  key: string;
  label: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export function useContextTypes() {
  const [contextTypes, setContextTypes] = useState<ContextType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContextTypes = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('trail_blazer_context_types')
          .select('id, key, label, description, sort_order, is_active')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (fetchError) throw fetchError;
        setContextTypes((data || []) as ContextType[]);
      } catch (err: any) {
        console.error('Error fetching context types:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContextTypes();
  }, []);

  return { contextTypes, loading, error };
}
