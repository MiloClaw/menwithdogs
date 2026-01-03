import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCouple } from './useCouple';
import { useToast } from './use-toast';

interface EventFavorite {
  id: string;
  couple_id: string;
  event_id: string;
  created_at: string;
}

export function useEventFavorites() {
  const { couple } = useCouple();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const coupleId = couple?.id;

  // Fetch all event favorites for this couple
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['event-favorites', coupleId],
    queryFn: async () => {
      if (!coupleId) return [];

      const { data, error } = await supabase
        .from('event_favorites')
        .select('*')
        .eq('couple_id', coupleId);

      if (error) throw error;
      return data as EventFavorite[];
    },
    enabled: !!coupleId,
  });

  // Check if an event is favorited
  const isFavorited = (eventId: string) => {
    return favorites.some((f) => f.event_id === eventId);
  };

  // Add favorite
  const addFavorite = useMutation({
    mutationFn: async (eventId: string) => {
      if (!coupleId) throw new Error('No couple found');

      const { data, error } = await supabase
        .from('event_favorites')
        .insert({ couple_id: coupleId, event_id: eventId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-favorites', coupleId] });
      toast({
        title: 'Saved',
        description: 'Event added to your saved list.',
      });
    },
    onError: (error) => {
      console.error('Add event favorite error:', error);
      toast({
        title: 'Failed to save',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Remove favorite
  const removeFavorite = useMutation({
    mutationFn: async (eventId: string) => {
      if (!coupleId) throw new Error('No couple found');

      const { error } = await supabase
        .from('event_favorites')
        .delete()
        .eq('couple_id', coupleId)
        .eq('event_id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-favorites', coupleId] });
      toast({
        title: 'Removed',
        description: 'Event removed from your saved list.',
      });
    },
    onError: (error) => {
      console.error('Remove event favorite error:', error);
      toast({
        title: 'Failed to remove',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Toggle favorite
  const toggleFavorite = (eventId: string) => {
    if (isFavorited(eventId)) {
      removeFavorite.mutate(eventId);
    } else {
      addFavorite.mutate(eventId);
    }
  };

  return {
    favorites,
    isLoading,
    isFavorited,
    addFavorite: addFavorite.mutate,
    removeFavorite: removeFavorite.mutate,
    toggleFavorite,
    isUpdating: addFavorite.isPending || removeFavorite.isPending,
  };
}
