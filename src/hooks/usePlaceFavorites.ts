import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCouple } from './useCouple';
import { useAuth } from './useAuth';
import { useEnsureRelationshipUnit } from './useEnsureRelationshipUnit';
import { useToast } from './use-toast';
import { queueSignal } from '@/lib/signal-batcher';
import { showAuthToast } from '@/lib/auth-toast';

interface PlaceFavorite {
  id: string;
  couple_id: string;
  place_id: string;
  created_at: string;
}

export function usePlaceFavorites() {
  const { couple, refetch: refetchCouple } = useCouple();
  const { isAuthenticated, user } = useAuth();
  const { ensureRelationshipUnit } = useEnsureRelationshipUnit();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const coupleId = couple?.id;

  // Fetch all favorites for this couple
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['place-favorites', coupleId],
    queryFn: async () => {
      if (!coupleId) return [];

      const { data, error } = await supabase
        .from('couple_favorites')
        .select('*')
        .eq('couple_id', coupleId);

      if (error) throw error;
      return data as PlaceFavorite[];
    },
    enabled: !!coupleId,
  });

  // Check if a place is favorited
  const isFavorited = (placeId: string) => {
    return favorites.some((f) => f.place_id === placeId);
  };

  // Add favorite
  const addFavorite = useMutation({
    mutationFn: async (placeId: string) => {
      // Get or create couple ID
      let effectiveCoupleId = coupleId;
      
      if (!effectiveCoupleId) {
        effectiveCoupleId = await ensureRelationshipUnit();
        if (!effectiveCoupleId) {
          throw new Error('Could not create relationship unit');
        }
      }

      const { data, error } = await supabase
        .from('couple_favorites')
        .insert({ couple_id: effectiveCoupleId, place_id: placeId })
        .select()
        .single();

      if (error) {
        // Handle duplicate gracefully (unique constraint violation)
        if (error.code === '23505') {
          return { id: 'existing', couple_id: effectiveCoupleId, place_id: placeId, created_at: new Date().toISOString() };
        }
        throw error;
      }
      return data;
    },
    onSuccess: (_, placeId) => {
      // Emit save_place signal - minimal semantics, room for future richness
      queueSignal('save_place', placeId, null, 'user', 1.0, { source: 'favorite_button' });
      
      // Invalidate favorites cache
      queryClient.invalidateQueries({ queryKey: ['place-favorites'] });
      // Invalidate and immediately refetch affinity for snappy personalization
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['user-affinity', user.id] });
        queryClient.refetchQueries({ queryKey: ['user-affinity', user.id] });
      }
      // Refetch couple data in case it was just created
      refetchCouple();
      
      toast({
        title: 'Saved',
        description: 'Place added to your saved list.',
      });
    },
    onError: (error) => {
      console.error('Add favorite error:', error);
      toast({
        title: 'Failed to save',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Remove favorite
  const removeFavorite = useMutation({
    mutationFn: async (placeId: string) => {
      // Get or create couple ID
      let effectiveCoupleId = coupleId;
      
      if (!effectiveCoupleId) {
        effectiveCoupleId = await ensureRelationshipUnit();
        if (!effectiveCoupleId) {
          throw new Error('Could not find relationship unit');
        }
      }

      const { error } = await supabase
        .from('couple_favorites')
        .delete()
        .eq('couple_id', effectiveCoupleId)
        .eq('place_id', placeId);

      if (error) throw error;
    },
    onSuccess: (_, placeId) => {
      // Emit unsave_place signal
      queueSignal('unsave_place', placeId, null, 'user', 1.0, { source: 'favorite_button' });
      
      // Invalidate favorites cache
      queryClient.invalidateQueries({ queryKey: ['place-favorites'] });
      // Invalidate and immediately refetch affinity for snappy personalization
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['user-affinity', user.id] });
        queryClient.refetchQueries({ queryKey: ['user-affinity', user.id] });
      }
      
      toast({
        title: 'Removed',
        description: 'Place removed from your saved list.',
      });
    },
    onError: (error) => {
      console.error('Remove favorite error:', error);
      toast({
        title: 'Failed to remove',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Toggle favorite with auth check
  const toggleFavorite = (placeId: string) => {
    if (!isAuthenticated) {
      showAuthToast({
        title: 'Sign in to save places',
        description: 'Create a free account to build your saved list.',
        intentKey: 'pending_favorite_place_id',
        intentValue: placeId,
        onNavigate: () => navigate('/auth'),
      });
      return;
    }
    
    if (isFavorited(placeId)) {
      removeFavorite.mutate(placeId);
    } else {
      addFavorite.mutate(placeId);
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
