import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { queueSignal } from '@/lib/signal-batcher';

/**
 * Pro Context Definition from pro_context_definitions table.
 * Admin-managed vocabulary for context density intelligence.
 */
export interface ProContextDefinition {
  id: string;
  key: string;
  domain: 'demographic' | 'community' | 'lifestyle' | 'faith' | 'activity';
  description: string | null;
  is_sensitive: boolean;
  default_confidence_cap: number;
  is_active: boolean;
}

interface UserProContextState {
  [contextKey: string]: boolean;
}

/**
 * Domain display configuration.
 * Used to group and label context options in the UI.
 */
const DOMAIN_LABELS: Record<string, { title: string; description: string }> = {
  demographic: {
    title: 'Your Style',
    description: 'What kind of spaces feel like home',
  },
  community: {
    title: 'Vibe',
    description: "The atmosphere you're usually around",
  },
  lifestyle: {
    title: 'Lifestyle',
    description: 'How you prefer to spend your time out',
  },
  faith: {
    title: 'Values',
    description: 'Spaces that align with what matters to you',
  },
  activity: {
    title: 'Activities',
    description: "What you're hoping your week includes",
  },
};

const DOMAIN_ORDER = ['lifestyle', 'activity', 'community', 'demographic', 'faith'];

/**
 * Hook to fetch Pro context definitions and manage user's context signals.
 * 
 * ARCHITECTURE:
 * - Definitions are fetched from pro_context_definitions table
 * - User state is derived from user_signals table (signal_type = 'pro_context')
 * - Toggling emits a signal (append-only, no updates)
 * - Context signals map to place categories via place_context_density
 * 
 * PRIVACY:
 * - Signals are never deleted
 * - Re-selection appends new signals
 * - Context selections are never exposed to admins
 */
export function useProContexts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch active context definitions
  const { data: definitions = [], isLoading: isLoadingDefinitions } = useQuery({
    queryKey: ['pro-context-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pro_context_definitions')
        .select('id, key, domain, is_active')
        .eq('is_active', true)
        .order('domain');

      if (error) throw error;
      // Cast to our interface (we only get the fields RLS allows)
      return data as Pick<ProContextDefinition, 'id' | 'key' | 'domain' | 'is_active'>[];
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  // Fetch user's current pro_context signals
  const { data: userState = {}, isLoading: isLoadingState } = useQuery({
    queryKey: ['pro-context-state', user?.id],
    queryFn: async (): Promise<UserProContextState> => {
      if (!user) return {};

      const { data, error } = await supabase
        .from('user_signals')
        .select('signal_key, created_at')
        .eq('user_id', user.id)
        .eq('signal_type', 'pro_context')
        .eq('source', 'pro_user')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Build state map from most recent signals
      // Since signals are append-only, we take the most recent one per key
      const state: UserProContextState = {};
      const seenKeys = new Set<string>();
      for (const signal of data || []) {
        if (!seenKeys.has(signal.signal_key)) {
          state[signal.signal_key] = true;
          seenKeys.add(signal.signal_key);
        }
      }
      return state;
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30s cache
  });

  // Toggle a pro context option
  const toggleMutation = useMutation({
    mutationFn: async ({ contextKey, domain }: { contextKey: string; domain: string }) => {
      if (!user) throw new Error('Must be logged in');

      // Queue signal with pro_context type
      queueSignal(
        'pro_context',
        contextKey,
        null, // signal_value is null per spec
        'pro_user',
        1.0,
        { domain }
      );

      return { contextKey };
    },
    onMutate: async ({ contextKey }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['pro-context-state', user?.id] });

      // Snapshot previous value
      const previousState = queryClient.getQueryData<UserProContextState>(['pro-context-state', user?.id]);

      // Optimistically update (toggle on - we don't support toggle off for append-only)
      queryClient.setQueryData<UserProContextState>(['pro-context-state', user?.id], (old) => ({
        ...old,
        [contextKey]: true,
      }));

      return { previousState };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousState) {
        queryClient.setQueryData(['pro-context-state', user?.id], context.previousState);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['pro-context-state', user?.id] });
      // Also trigger affinity recompute
      queryClient.invalidateQueries({ queryKey: ['user-affinity', user?.id] });
    },
  });

  // Group definitions by domain
  const groupedDefinitions = definitions.reduce((acc, def) => {
    if (!acc[def.domain]) {
      acc[def.domain] = [];
    }
    acc[def.domain].push(def);
    return acc;
  }, {} as Record<string, typeof definitions>);

  const toggle = (contextKey: string, domain: string) => {
    // Only allow enabling (append-only signals)
    if (!userState[contextKey]) {
      toggleMutation.mutate({ contextKey, domain });
    }
  };

  const isEnabled = (contextKey: string): boolean => {
    return userState[contextKey] ?? false;
  };

  return {
    definitions,
    groupedDefinitions,
    domainOrder: DOMAIN_ORDER,
    domainLabels: DOMAIN_LABELS,
    isLoading: isLoadingDefinitions || isLoadingState,
    toggle,
    isEnabled,
    isToggling: toggleMutation.isPending,
    hasAnyContexts: definitions.length > 0,
  };
}
