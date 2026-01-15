import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { usePlaceFavorites } from '@/hooks/usePlaceFavorites';
import { 
  PromptType, 
  PromptDefinition,
  PROMPT_TRIGGERS,
  getPromptDefinition,
} from '@/lib/preference-prompts';

const SESSION_KEY = 'preference_prompt_session';
const LAST_PROMPT_KEY = 'last_preference_prompt_time';

// Minimum time between prompts (5 minutes)
const PROMPT_COOLDOWN_MS = 5 * 60 * 1000;

/**
 * Hook to manage behavioral preference prompts.
 * 
 * Prompts are triggered by real behavior:
 * - Saving places
 * - Browsing places
 * - Multiple sessions
 * 
 * Only one prompt at a time, with cooldown between prompts.
 */
export function usePreferencePrompts() {
  const { user, isAuthenticated } = useAuth();
  const { preferences, hasPromptBeenShown, markPromptShown, updatePreferences } = useUserPreferences();
  const { favorites } = usePlaceFavorites();
  
  const [currentPrompt, setCurrentPrompt] = useState<PromptDefinition | null>(null);
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  // Phase 1 Fix: Query real view_place signal count instead of approximation
  const { data: viewSignalCount = 0 } = useQuery({
    queryKey: ['view-signal-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count, error } = await supabase
        .from('user_signals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('signal_type', 'view_place');
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 60 * 1000, // 1 min cache
  });

  // Track session count
  const getSessionCount = useCallback((): number => {
    const sessions = sessionStorage.getItem(SESSION_KEY);
    if (!sessions) {
      // First visit this session - increment persistent count
      const storedCount = parseInt(localStorage.getItem('preference_session_count') || '0', 10);
      const newCount = storedCount + 1;
      localStorage.setItem('preference_session_count', String(newCount));
      sessionStorage.setItem(SESSION_KEY, 'counted');
      return newCount;
    }
    return parseInt(localStorage.getItem('preference_session_count') || '1', 10);
  }, []);

  // Check cooldown
  const isOnCooldown = useCallback((): boolean => {
    const lastPromptTime = localStorage.getItem(LAST_PROMPT_KEY);
    if (!lastPromptTime) return false;
    const elapsed = Date.now() - parseInt(lastPromptTime, 10);
    return elapsed < PROMPT_COOLDOWN_MS;
  }, []);

  // Find next eligible prompt
  const findEligiblePrompt = useCallback((): PromptDefinition | null => {
    if (!isAuthenticated || isOnCooldown()) return null;

    const saveCount = favorites.length;
    const sessionCount = getSessionCount();
    // Phase 1 Fix: Use actual view_place signal count
    const browseCount = viewSignalCount;

    for (const trigger of PROMPT_TRIGGERS) {
      // Skip if already shown
      if (hasPromptBeenShown(trigger.type)) continue;

      // Check trigger conditions
      const meetsConditions = 
        saveCount >= trigger.minSaves &&
        browseCount >= trigger.minBrowses &&
        sessionCount >= trigger.minSessions;

      if (meetsConditions) {
        return getPromptDefinition(trigger.type) || null;
      }
    }

    return null;
  }, [isAuthenticated, favorites.length, getSessionCount, isOnCooldown, hasPromptBeenShown, viewSignalCount]);

  // Check for eligible prompt when conditions change
  useEffect(() => {
    if (!isPromptOpen && !currentPrompt) {
      const eligible = findEligiblePrompt();
      if (eligible) {
        // Small delay before showing
        const timer = setTimeout(() => {
          setCurrentPrompt(eligible);
          setIsPromptOpen(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [findEligiblePrompt, isPromptOpen, currentPrompt]);

  // Handle prompt answer
  const handleAnswer = useCallback((value: string | string[]) => {
    if (!currentPrompt) return;

    // Save the preference - map prompt types to column names
    const updates: Record<string, string | string[] | null> = {};
    switch (currentPrompt.type) {
      // Phase 1: Context
      case 'time':
        updates.time_preference = value as string;
        break;
      case 'distance':
        updates.distance_preference = value as string;
        break;
      case 'vibe':
        updates.vibe_preference = value as string;
        break;
      case 'geo':
        updates.geo_affinity = value as string;
        break;
      // Phase 2: Intent
      case 'intent':
        updates.intent_preferences = value as string[];
        break;
      // Phase 3: Decision-style meta-preferences
      case 'choice_priority':
        updates.choice_priority = value as string[];
        break;
      case 'uncertainty':
        updates.uncertainty_tolerance = value as string;
        break;
      case 'return_pref':
        updates.return_preference = value as string;
        break;
      case 'sensory':
        updates.sensory_sensitivity = value as string[];
        break;
      case 'planning':
        updates.planning_horizon = value as string;
        break;
    }

    updatePreferences(updates as any);
    markPromptShown(currentPrompt.type);
    localStorage.setItem(LAST_PROMPT_KEY, String(Date.now()));
    
    setIsPromptOpen(false);
    setCurrentPrompt(null);
  }, [currentPrompt, updatePreferences, markPromptShown]);

  // Handle skip
  const handleSkip = useCallback(() => {
    if (!currentPrompt) return;
    
    markPromptShown(currentPrompt.type);
    localStorage.setItem(LAST_PROMPT_KEY, String(Date.now()));
    
    setIsPromptOpen(false);
    setCurrentPrompt(null);
  }, [currentPrompt, markPromptShown]);

  // Manually trigger a check for prompts (e.g., after saving a place)
  const checkForPrompts = useCallback(() => {
    if (isPromptOpen || currentPrompt) return;
    
    const eligible = findEligiblePrompt();
    if (eligible) {
      setTimeout(() => {
        setCurrentPrompt(eligible);
        setIsPromptOpen(true);
      }, 1500);
    }
  }, [findEligiblePrompt, isPromptOpen, currentPrompt]);

  return {
    currentPrompt,
    isPromptOpen,
    setIsPromptOpen,
    handleAnswer,
    handleSkip,
    checkForPrompts,
    preferences,
  };
}
