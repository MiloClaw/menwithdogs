import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { queueSignal } from '@/lib/signal-batcher';

interface PaidTuningDefinition {
  id: string;
  domain: 'context' | 'activity' | 'interest' | 'environment';
  tuning_key: string;
  label: string;
  description: string | null;
  icon: string | null;
  maps_to_categories: string[];
  confidence_cap: number;
  sort_order: number;
}

interface UserPaidTuningState {
  [tuningKey: string]: boolean;
}

// Map domain to signal type
const DOMAIN_TO_SIGNAL_TYPE: Record<string, string> = {
  context: 'context_self_selected',
  activity: 'activity_pattern',
  interest: 'interest_cluster',
  environment: 'environment_preference',
};

/**
 * Hook to fetch paid tuning definitions and manage user's paid tuning signals.
 * 
 * ARCHITECTURE:
 * - Definitions are fetched from paid_tuning_definitions table
 * - User state is derived from user_signals table
 * - Toggling emits a signal (not a stateful update)
 * - Signals map indirectly to categories via definitions
 */
export function usePaidTuning() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch definitions grouped by domain
  const { data: definitions = [], isLoading: isLoadingDefinitions } = useQuery({
    queryKey: ['paid-tuning-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paid_tuning_definitions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data as PaidTuningDefinition[];
    },
  });

  // Fetch user's current paid tuning signals
  const { data: userState = {}, isLoading: isLoadingState } = useQuery({
    queryKey: ['paid-tuning-state', user?.id],
    queryFn: async (): Promise<UserPaidTuningState> => {
      if (!user) return {};

      const signalTypes = Object.values(DOMAIN_TO_SIGNAL_TYPE);
      
      const { data, error } = await supabase
        .from('user_signals')
        .select('signal_key, signal_value')
        .eq('user_id', user.id)
        .in('signal_type', signalTypes)
        .eq('signal_value', 'true');

      if (error) throw error;

      // Build state map
      const state: UserPaidTuningState = {};
      for (const signal of data || []) {
        state[signal.signal_key] = true;
      }
      return state;
    },
    enabled: !!user,
  });

  // Toggle a paid tuning option
  const toggleMutation = useMutation({
    mutationFn: async ({ tuningKey, domain, enabled }: { 
      tuningKey: string; 
      domain: string; 
      enabled: boolean;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const signalType = DOMAIN_TO_SIGNAL_TYPE[domain];
      if (!signalType) throw new Error(`Unknown domain: ${domain}`);

      // Queue signal (will be batched)
      queueSignal(
        signalType,
        tuningKey,
        enabled ? 'true' : 'false',
        'user',
        1.0
      );

      // Optimistic update
      return { tuningKey, enabled };
    },
    onMutate: async ({ tuningKey, enabled }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['paid-tuning-state', user?.id] });

      // Snapshot previous value
      const previousState = queryClient.getQueryData<UserPaidTuningState>(['paid-tuning-state', user?.id]);

      // Optimistically update
      queryClient.setQueryData<UserPaidTuningState>(['paid-tuning-state', user?.id], (old) => ({
        ...old,
        [tuningKey]: enabled,
      }));

      return { previousState };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousState) {
        queryClient.setQueryData(['paid-tuning-state', user?.id], context.previousState);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['paid-tuning-state', user?.id] });
    },
  });

  // Group definitions by domain
  const groupedDefinitions = definitions.reduce((acc, def) => {
    if (!acc[def.domain]) {
      acc[def.domain] = [];
    }
    acc[def.domain].push(def);
    return acc;
  }, {} as Record<string, PaidTuningDefinition[]>);

  const toggle = (tuningKey: string, domain: string) => {
    const currentValue = userState[tuningKey] ?? false;
    toggleMutation.mutate({ tuningKey, domain, enabled: !currentValue });
  };

  const isEnabled = (tuningKey: string): boolean => {
    return userState[tuningKey] ?? false;
  };

  return {
    definitions,
    groupedDefinitions,
    isLoading: isLoadingDefinitions || isLoadingState,
    toggle,
    isEnabled,
    isToggling: toggleMutation.isPending,
  };
}
