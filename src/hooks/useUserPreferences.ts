import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PromptType } from '@/lib/preference-prompts';

export interface UserPreferences {
  id: string;
  user_id: string;
  time_preference: string | null;
  distance_preference: string | null;
  vibe_preference: string | null;
  intent_preferences: string[];
  geo_affinity: string | null;
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
      time_preference: string | null;
      distance_preference: string | null;
      vibe_preference: string | null;
      intent_preferences: string[];
      geo_affinity: string | null;
      prompts_shown: Record<string, string>;
    }>) => {
      if (!userId) throw new Error('Not authenticated');

      // Check if preferences exist
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('user_preferences')
          .update(updates)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('user_preferences')
          .insert({ user_id: userId, ...updates })
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
      case 'time': return preferences.time_preference;
      case 'distance': return preferences.distance_preference;
      case 'vibe': return preferences.vibe_preference;
      case 'intent': return preferences.intent_preferences;
      case 'geo': return preferences.geo_affinity;
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
