import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PromptType } from '@/lib/preference-prompts';
import { recordSignal } from '@/hooks/useUserSignals';

export interface UserPreferences {
  id: string;
  user_id: string;
  // Phase 1: Context
  time_preference: string | null;
  distance_preference: string | null;
  vibe_preference: string | null;
  geo_affinity: string | null;
  // Phase 2: Intent
  intent_preferences: string[];
  // Phase 3: Decision-style meta-preferences
  choice_priority: string[];
  uncertainty_tolerance: string | null;
  return_preference: string | null;
  sensory_sensitivity: string[];
  planning_horizon: string | null;
  // Profile Preferences (new)
  activities: string[];
  place_usage: string[];
  timing_preferences: string[];
  openness: string[];
  display_name: string | null;
  profile_photo_url: string | null;
  allow_place_visibility: boolean;
  // Meta
  prompts_shown: Record<string, string>; // { time: "2024-01-01", vibe: null }
  created_at: string;
  updated_at: string;
}

export function useUserPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  // Fetch user preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['user-preferences', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      
      // Transform the data to match our interface
      if (data) {
        return {
          ...data,
          intent_preferences: Array.isArray(data.intent_preferences) 
            ? data.intent_preferences as string[]
            : [],
          choice_priority: Array.isArray(data.choice_priority)
            ? data.choice_priority as string[]
            : [],
          sensory_sensitivity: Array.isArray(data.sensory_sensitivity)
            ? data.sensory_sensitivity as string[]
            : [],
          // Profile arrays
          activities: Array.isArray(data.activities)
            ? data.activities as string[]
            : [],
          place_usage: Array.isArray(data.place_usage)
            ? data.place_usage as string[]
            : [],
          timing_preferences: Array.isArray(data.timing_preferences)
            ? data.timing_preferences as string[]
            : [],
          openness: Array.isArray(data.openness)
            ? data.openness as string[]
            : [],
          allow_place_visibility: data.allow_place_visibility ?? false,
          prompts_shown: data.prompts_shown as Record<string, string> || {},
        } as UserPreferences;
      }
      
      return null;
    },
    enabled: !!userId,
  });

  // Create or update preferences
  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<{
      // Phase 1
      time_preference: string | null;
      distance_preference: string | null;
      vibe_preference: string | null;
      geo_affinity: string | null;
      // Phase 2
      intent_preferences: string[];
      // Phase 3: Decision-style
      choice_priority: string[];
      uncertainty_tolerance: string | null;
      return_preference: string | null;
      sensory_sensitivity: string[];
      planning_horizon: string | null;
      // Profile Preferences
      activities: string[];
      place_usage: string[];
      timing_preferences: string[];
      openness: string[];
      display_name: string | null;
      profile_photo_url: string | null;
      allow_place_visibility: boolean;
      // Meta
      prompts_shown: Record<string, string>;
    }>) => {
      if (!userId) throw new Error('Not authenticated');

      // Check if preferences exist
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('user_preferences')
          .update(updates)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('user_preferences')
          .insert({ user_id: userId, ...updates })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      // Record signals for preference changes (excluding prompts_shown)
      for (const [key, value] of Object.entries(updates)) {
        if (value !== null && key !== 'prompts_shown') {
          try {
            await recordSignal(
              'explicit_preference',
              key,
              Array.isArray(value) ? JSON.stringify(value) : String(value),
              'user'
            );
          } catch {
            // Signal recording is non-critical, don't fail the mutation
            console.warn('Failed to record preference signal:', key);
          }
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences', userId] });
      // Invalidate affinity cache so personalization reflects new intent preferences immediately
      queryClient.invalidateQueries({ queryKey: ['user-affinity', userId] });
    },
  });

  // Mark a prompt as shown
  const markPromptShown = useMutation({
    mutationFn: async (promptType: PromptType) => {
      if (!userId) throw new Error('Not authenticated');

      const currentShown = preferences?.prompts_shown || {};
      const newShown = {
        ...currentShown,
        [promptType]: new Date().toISOString(),
      };

      // Check if preferences exist
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('user_preferences')
          .update({ prompts_shown: newShown })
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('user_preferences')
          .insert({ user_id: userId, prompts_shown: newShown })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences', userId] });
    },
  });

  // Check if a prompt has been shown
  const hasPromptBeenShown = (promptType: PromptType): boolean => {
    return !!preferences?.prompts_shown?.[promptType];
  };

  // Get a specific preference value
  const getPreference = (type: PromptType): string | string[] | null => {
    if (!preferences) return null;
    switch (type) {
      // Phase 1
      case 'time': return preferences.time_preference;
      case 'distance': return preferences.distance_preference;
      case 'vibe': return preferences.vibe_preference;
      case 'geo': return preferences.geo_affinity;
      // Phase 2
      case 'intent': return preferences.intent_preferences;
      // Phase 3
      case 'choice_priority': return preferences.choice_priority;
      case 'uncertainty': return preferences.uncertainty_tolerance;
      case 'return_pref': return preferences.return_preference;
      case 'sensory': return preferences.sensory_sensitivity;
      case 'planning': return preferences.planning_horizon;
      default: return null;
    }
  };

  return {
    preferences,
    isLoading,
    updatePreferences: updatePreferences.mutate,
    markPromptShown: markPromptShown.mutate,
    hasPromptBeenShown,
    getPreference,
    isUpdating: updatePreferences.isPending,
  };
}
