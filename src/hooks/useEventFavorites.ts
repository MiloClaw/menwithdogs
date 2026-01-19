import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCouple } from './useCouple';
import { useAuth } from './useAuth';
import { useEnsureRelationshipUnit } from './useEnsureRelationshipUnit';
import { useToast } from './use-toast';
import { queueSignal } from '@/lib/signal-batcher';
import { showAuthToast } from '@/lib/auth-toast';

interface EventFavorite {
  id: string;
  couple_id: string;
  event_id: string;
  created_at: string;
}

export function useEventFavorites() {
  const { couple, refetch: refetchCouple } = useCouple();
  const { isAuthenticated, user } = useAuth();
  const { ensureRelationshipUnit } = useEnsureRelationshipUnit();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
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
      // Get or create couple ID
      let effectiveCoupleId = coupleId;
      
      if (!effectiveCoupleId) {
        effectiveCoupleId = await ensureRelationshipUnit();
        if (!effectiveCoupleId) {
          throw new Error('Could not create relationship unit');
        }
      }

      const { data, error } = await supabase
        .from('event_favorites')
        .insert({ couple_id: effectiveCoupleId, event_id: eventId })
        .select()
        .single();

      if (error) {
        // Handle duplicate gracefully (unique constraint violation)
        if (error.code === '23505') {
          return { id: 'existing', couple_id: effectiveCoupleId, event_id: eventId, created_at: new Date().toISOString() };
        }
        throw error;
      }
      return data;
    },
    onSuccess: (_, eventId) => {
      // Emit save_event signal - minimal semantics, room for future richness
      queueSignal('save_event', eventId, null, 'user', 1.0, { source: 'favorite_button' });
      
      // Invalidate favorites cache
      queryClient.invalidateQueries({ queryKey: ['event-favorites'] });
      // Invalidate and immediately refetch affinity for snappy personalization
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['user-affinity', user.id] });
        queryClient.refetchQueries({ queryKey: ['user-affinity', user.id] });
      }
      // Refetch couple data in case it was just created
      refetchCouple();
      
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
      // Get or create couple ID
      let effectiveCoupleId = coupleId;
      
      if (!effectiveCoupleId) {
        effectiveCoupleId = await ensureRelationshipUnit();
        if (!effectiveCoupleId) {
          throw new Error('Could not find relationship unit');
        }
      }

      const { error } = await supabase
        .from('event_favorites')
        .delete()
        .eq('couple_id', effectiveCoupleId)
        .eq('event_id', eventId);

      if (error) throw error;
    },
    onSuccess: (_, eventId) => {
      // Emit unsave_event signal
      queueSignal('unsave_event', eventId, null, 'user', 1.0, { source: 'favorite_button' });
      
      // Invalidate favorites cache
      queryClient.invalidateQueries({ queryKey: ['event-favorites'] });
      // Invalidate and immediately refetch affinity for snappy personalization
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['user-affinity', user.id] });
        queryClient.refetchQueries({ queryKey: ['user-affinity', user.id] });
      }
      
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

  // Toggle favorite with auth check
  const toggleFavorite = (eventId: string) => {
    if (!isAuthenticated) {
      showAuthToast({
        title: 'Sign in to save events',
        description: 'Create a free account to build your saved list.',
        intentKey: 'pending_favorite_event_id',
        intentValue: eventId,
        onNavigate: () => navigate('/auth'),
      });
      return;
    }
    
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
