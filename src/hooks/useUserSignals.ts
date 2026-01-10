import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserSignal {
  id: string;
  user_id: string;
  signal_type: string;
  signal_key: string;
  signal_value: string | null;
  source: string;
  confidence: number | null;
  context_json: Record<string, unknown> | null;
  created_at: string;
}

/**
 * Hook to fetch user signals for debugging/analytics.
 * Signals are private and only visible to the user who created them.
 */
export function useUserSignals(signalType?: string, limit = 100) {
  const { user } = useAuth();
  const userId = user?.id;

  const { data: signals, isLoading, error } = useQuery({
    queryKey: ['user-signals', userId, signalType, limit],
    queryFn: async () => {
      if (!userId) return [];

      let query = supabase
        .from('user_signals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (signalType) {
        query = query.eq('signal_type', signalType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as UserSignal[];
    },
    enabled: !!userId,
  });

  return {
    signals: signals || [],
    isLoading,
    error,
  };
}

import { queueSignal } from '@/lib/signal-batcher';

/**
 * Helper to record a signal via batching.
 * Uses SignalBatcher for ~80% reduction in database writes.
 * 
 * @deprecated Use queueSignal directly from signal-batcher for new code.
 */
export function recordSignal(
  signalType: string,
  signalKey: string,
  signalValue?: string | null,
  source = 'user',
  confidence = 1.0,
  context?: Record<string, unknown>
): void {
  queueSignal(signalType, signalKey, signalValue, source, confidence, context);
}

// Re-export for convenience
export { queueSignal };
