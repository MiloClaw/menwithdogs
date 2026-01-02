import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCouple } from './useCouple';
import { useToast } from './use-toast';

export type PresenceStatus = 'interested' | 'planning_to_attend' | 'open_to_hello';

export interface Presence {
  id: string;
  couple_id: string;
  place_id: string | null;
  event_id: string | null;
  status: PresenceStatus;
  starts_at: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
}

interface SetPresenceParams {
  placeId?: string;
  eventId?: string;
  status: PresenceStatus;
  endsAt: Date;
}

interface ClearPresenceParams {
  placeId?: string;
  eventId?: string;
}

export function usePresence(placeId?: string, eventId?: string) {
  const { couple } = useCouple();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const coupleId = couple?.id;

  // Build query key based on context
  const queryKey = ['presence', coupleId, placeId, eventId];

  // Fetch current presence for this context
  const { data: presence, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!coupleId) return null;

      let query = supabase
        .from('couple_presence')
        .select('*')
        .eq('couple_id', coupleId);

      if (placeId) {
        query = query.eq('place_id', placeId);
      } else if (eventId) {
        query = query.eq('event_id', eventId);
      } else {
        return null;
      }

      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data as Presence | null;
    },
    enabled: !!coupleId && (!!placeId || !!eventId),
  });

  // Set or update presence
  const setPresenceMutation = useMutation({
    mutationFn: async ({ placeId, eventId, status, endsAt }: SetPresenceParams) => {
      if (!coupleId) throw new Error('No couple found');
      if (!placeId && !eventId) throw new Error('Must specify place or event');

      const presenceData = {
        couple_id: coupleId,
        place_id: placeId || null,
        event_id: eventId || null,
        status,
        starts_at: new Date().toISOString(),
        ends_at: endsAt.toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Upsert using the unique constraint
      const { data, error } = await supabase
        .from('couple_presence')
        .upsert(presenceData, {
          onConflict: placeId ? 'couple_id,place_id' : 'couple_id,event_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presence'] });
      queryClient.invalidateQueries({ queryKey: ['presence-agg'] });
    },
    onError: (error) => {
      console.error('Set presence error:', error);
      toast({
        title: 'Failed to update',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Clear presence
  const clearPresenceMutation = useMutation({
    mutationFn: async ({ placeId, eventId }: ClearPresenceParams) => {
      if (!coupleId) throw new Error('No couple found');

      let query = supabase
        .from('couple_presence')
        .delete()
        .eq('couple_id', coupleId);

      if (placeId) {
        query = query.eq('place_id', placeId);
      } else if (eventId) {
        query = query.eq('event_id', eventId);
      } else {
        throw new Error('Must specify place or event');
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presence'] });
      queryClient.invalidateQueries({ queryKey: ['presence-agg'] });
    },
    onError: (error) => {
      console.error('Clear presence error:', error);
      toast({
        title: 'Failed to clear',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    presence,
    isLoading,
    setPresence: setPresenceMutation.mutate,
    clearPresence: clearPresenceMutation.mutate,
    isUpdating: setPresenceMutation.isPending || clearPresenceMutation.isPending,
  };
}
