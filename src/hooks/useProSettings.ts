import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { queueSignal } from '@/lib/signal-batcher';

/**
 * Pro Settings option from pro_context_definitions table.
 * Extended with UI metadata for 4-step flow.
 */
export interface ProSettingsOption {
  id: string;
  key: string;
  domain: string;
  step: number | null;
  section: string | null;
  label: string | null;
  icon: string | null;
  input_type: 'single' | 'multi' | null;
  show_condition: ShowCondition | null;
  sort_order: number | null;
  influence_mode: 'overlap' | 'boost';
  is_sensitive: boolean;
}

/**
 * Conditional display logic for options.
 * Evaluated against current selections.
 */
interface ShowCondition {
  requires?: string[];
  requires_all?: string[];
  requires_any?: string[];
}

interface UserProSelectionsState {
  [optionKey: string]: boolean;
}

/**
 * Section metadata for UI rendering.
 */
interface SectionMeta {
  title: string;
  helperText: string;
}

// Section display metadata - human-first copy
const SECTION_META: Record<string, SectionMeta> = {
  'about.gender': {
    title: 'You are',
    helperText: '',
  },
  'about.age': {
    title: 'Your age range',
    helperText: '',
  },
  'about.relationship': {
    title: 'Your relationship status',
    helperText: '',
  },
  'about.orientation': {
    title: 'Sexual orientation (optional)',
    helperText: '',
  },
  'seeking.comfort': {
    title: "I'm looking for places that are",
    helperText: '',
  },
  'seeking.community': {
    title: "Within LGBTQ+ spaces, I'm most interested in places that center",
    helperText: '',
  },
  'seeking.relationship_context': {
    title: 'In those spaces, I feel most comfortable around',
    helperText: '',
  },
  'intent.goal': {
    title: "What you're hoping to find there",
    helperText: '',
  },
  'style.energy': {
    title: 'Social energy',
    helperText: '',
  },
  'style.environment': {
    title: 'Environment',
    helperText: '',
  },
  'style.timing': {
    title: 'Timing & rhythm',
    helperText: '',
  },
};

// Step metadata
const STEP_META: Record<number, { title: string; helperText: string }> = {
  1: {
    title: 'About you',
    helperText: 'This helps us understand your perspective when you walk into a space. Private by default. Never shared.',
  },
  2: {
    title: 'Who you feel most comfortable around',
    helperText: 'Some places naturally attract certain communities. This helps us surface places where you\'re more likely to feel at ease.',
  },
  3: {
    title: "What you're hoping to find there",
    helperText: 'This helps us understand why certain places feel meaningful to you.',
  },
  4: {
    title: 'How you like to spend time out',
    helperText: '',
  },
};

/**
 * Hook to fetch Pro settings options and manage user selections.
 * 
 * ARCHITECTURE:
 * - Options fetched from pro_context_definitions (with new UI columns)
 * - User state derived from user_signals (signal_type = 'pro_selection')
 * - Single/multi select support based on input_type
 * - Conditional display via show_condition evaluation
 * 
 * CRITICAL: influence_mode = 'overlap' options (Step 1) NEVER rank places.
 * They only affect overlap modeling.
 */
export function useProSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch active options with UI metadata
  const { data: options = [], isLoading: isLoadingOptions } = useQuery({
    queryKey: ['pro-settings-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pro_context_definitions')
        .select('id, key, domain, step, section, label, icon, input_type, show_condition, sort_order, influence_mode, is_sensitive')
        .eq('is_active', true)
        .not('step', 'is', null) // Only 4-step options
        .order('step')
        .order('sort_order');

      if (error) throw error;
      return data as ProSettingsOption[];
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  // Fetch user's current pro_selection signals
  const { data: userSelections = {}, isLoading: isLoadingSelections } = useQuery({
    queryKey: ['pro-selections', user?.id],
    queryFn: async (): Promise<UserProSelectionsState> => {
      if (!user) return {};

      const { data, error } = await supabase
        .from('user_signals')
        .select('signal_key, created_at')
        .eq('user_id', user.id)
        .eq('signal_type', 'pro_selection')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Build state map from most recent signals per key
      const state: UserProSelectionsState = {};
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

  // Select an option
  const selectMutation = useMutation({
    mutationFn: async ({ 
      optionKey, 
      step, 
      section, 
      inputType 
    }: { 
      optionKey: string; 
      step: number; 
      section: string;
      inputType: 'single' | 'multi';
    }) => {
      if (!user) throw new Error('Must be logged in');

      // Queue signal with pro_selection type
      queueSignal(
        'pro_selection',
        optionKey,
        'true',
        'user',
        1.0,
        { step, section }
      );

      return { optionKey, inputType, section };
    },
    onMutate: async ({ optionKey, inputType, section }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['pro-selections', user?.id] });

      // Snapshot previous value
      const previousState = queryClient.getQueryData<UserProSelectionsState>(['pro-selections', user?.id]);

      // Optimistically update
      queryClient.setQueryData<UserProSelectionsState>(['pro-selections', user?.id], (old) => {
        const newState = { ...old };
        
        if (inputType === 'single') {
          // For single select, clear other options in same section
          const sectionOptions = options.filter(o => o.section === section);
          sectionOptions.forEach(o => {
            delete newState[o.key];
          });
        }
        
        newState[optionKey] = true;
        return newState;
      });

      return { previousState };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousState) {
        queryClient.setQueryData(['pro-selections', user?.id], context.previousState);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['pro-selections', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-affinity', user?.id] });
    },
  });

  // Deselect an option (for multi-select toggle)
  const deselectMutation = useMutation({
    mutationFn: async ({ optionKey }: { optionKey: string }) => {
      if (!user) throw new Error('Must be logged in');

      // Queue deselection signal
      queueSignal(
        'pro_selection',
        optionKey,
        'false',
        'user',
        1.0,
        null
      );

      return { optionKey };
    },
    onMutate: async ({ optionKey }) => {
      await queryClient.cancelQueries({ queryKey: ['pro-selections', user?.id] });
      const previousState = queryClient.getQueryData<UserProSelectionsState>(['pro-selections', user?.id]);

      queryClient.setQueryData<UserProSelectionsState>(['pro-selections', user?.id], (old) => {
        const newState = { ...old };
        delete newState[optionKey];
        return newState;
      });

      return { previousState };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousState) {
        queryClient.setQueryData(['pro-selections', user?.id], context.previousState);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['pro-selections', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-affinity', user?.id] });
    },
  });

  // Group options by step and section
  const optionsByStep = options.reduce((acc, opt) => {
    const step = opt.step ?? 0;
    if (!acc[step]) acc[step] = {};
    
    const section = opt.section ?? 'default';
    if (!acc[step][section]) acc[step][section] = [];
    
    acc[step][section].push(opt);
    return acc;
  }, {} as Record<number, Record<string, ProSettingsOption[]>>);

  // Evaluate show_condition against current selections
  const shouldShow = (option: ProSettingsOption): boolean => {
    if (!option.show_condition) return true;

    const { requires, requires_all, requires_any } = option.show_condition;

    if (requires && !requires.every(k => userSelections[k])) return false;
    if (requires_all && !requires_all.every(k => userSelections[k])) return false;
    if (requires_any && !requires_any.some(k => userSelections[k])) return false;

    return true;
  };

  // Check if an option is selected
  const isSelected = (optionKey: string): boolean => {
    return userSelections[optionKey] ?? false;
  };

  // Select/deselect an option
  const select = (option: ProSettingsOption) => {
    const inputType = option.input_type ?? 'single';
    
    if (inputType === 'multi' && isSelected(option.key)) {
      // Toggle off for multi-select
      deselectMutation.mutate({ optionKey: option.key });
    } else {
      // Select (or replace for single-select)
      selectMutation.mutate({
        optionKey: option.key,
        step: option.step ?? 1,
        section: option.section ?? 'default',
        inputType,
      });
    }
  };

  // Get sections that should be visible for a step
  const getVisibleSections = (step: number): string[] => {
    const stepOptions = optionsByStep[step] ?? {};
    const visibleSections: string[] = [];

    for (const section of Object.keys(stepOptions)) {
      // A section is visible if at least one option in it should show
      const sectionOptions = stepOptions[section];
      if (sectionOptions.some(opt => shouldShow(opt))) {
        visibleSections.push(section);
      }
    }

    // Sort by first option's sort_order
    return visibleSections.sort((a, b) => {
      const aOpt = stepOptions[a]?.[0];
      const bOpt = stepOptions[b]?.[0];
      return (aOpt?.sort_order ?? 0) - (bOpt?.sort_order ?? 0);
    });
  };

  // Get selected options for summary display
  const getSelectedOptions = (): ProSettingsOption[] => {
    return options.filter(opt => isSelected(opt.key));
  };

  // Get boost-only selected options (for summary - exclude identity)
  const getBoostSelectedOptions = (): ProSettingsOption[] => {
    return options.filter(opt => isSelected(opt.key) && opt.influence_mode === 'boost');
  };

  return {
    options,
    optionsByStep,
    isLoading: isLoadingOptions || isLoadingSelections,
    select,
    isSelected,
    shouldShow,
    getVisibleSections,
    getSelectedOptions,
    getBoostSelectedOptions,
    isUpdating: selectMutation.isPending || deselectMutation.isPending,
    stepMeta: STEP_META,
    sectionMeta: SECTION_META,
  };
}
