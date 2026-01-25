import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCouple } from './useCouple';
import { useAuth } from './useAuth';
import { useEnsureRelationshipUnit } from './useEnsureRelationshipUnit';
import { useToast } from './use-toast';
import { queueSignal } from '@/lib/signal-batcher';
import { showAuthToast } from '@/lib/auth-toast';

interface TrailFavorite {
  id: string;
  couple_id: string;
  trail_id: string;
  park_id: string;
  created_at: string;
}

export function useTrailFavorites() {
  const { couple, refetch: refetchCouple } = useCouple();
  const { isAuthenticated, user } = useAuth();
  const { ensureRelationshipUnit } = useEnsureRelationshipUnit();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const coupleId = couple?.id;

  // Fetch all trail favorites for this couple
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['trail-favorites', coupleId],
    queryFn: async () => {
      if (!coupleId) return [];

      const { data, error } = await supabase
        .from('trail_favorites')
        .select('*')
        .eq('couple_id', coupleId);

      if (error) throw error;
      return data as TrailFavorite[];
    },
    enabled: !!coupleId,
  });

  // Check if a trail is favorited
  const isFavorited = (trailId: string) => {
    return favorites.some((f) => f.trail_id === trailId);
  };

  // Add favorite
  const addFavorite = useMutation({
    mutationFn: async ({ trailId, parkId }: { trailId: string; parkId: string }) => {
      let effectiveCoupleId = coupleId;
      
      if (!effectiveCoupleId) {
        effectiveCoupleId = await ensureRelationshipUnit();
        if (!effectiveCoupleId) {
          throw new Error('Could not create relationship unit');
        }
      }

      const { data, error } = await supabase
        .from('trail_favorites')
        .insert({ couple_id: effectiveCoupleId, trail_id: trailId, park_id: parkId })
        .select()
        .single();

      if (error) {
        // Handle duplicate gracefully
        if (error.code === '23505') {
          return { id: 'existing', couple_id: effectiveCoupleId, trail_id: trailId, park_id: parkId, created_at: new Date().toISOString() };
        }
        throw error;
      }
      return data;
    },
    onSuccess: (_, { trailId, parkId }) => {
      // Emit save_trail signal for future personalization
      queueSignal('save_trail', trailId, null, 'user', 1.0, { source: 'favorite_button', park_id: parkId });
      
      queryClient.invalidateQueries({ queryKey: ['trail-favorites'] });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['user-affinity', user.id] });
      }
      refetchCouple();
      
      toast({
        title: 'Trail saved',
        description: 'Added to your saved trails.',
      });
    },
    onError: (error) => {
      console.error('Add trail favorite error:', error);
      toast({
        title: 'Failed to save',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Remove favorite
  const removeFavorite = useMutation({
    mutationFn: async (trailId: string) => {
      let effectiveCoupleId = coupleId;
      
      if (!effectiveCoupleId) {
        effectiveCoupleId = await ensureRelationshipUnit();
        if (!effectiveCoupleId) {
          throw new Error('Could not find relationship unit');
        }
      }

      const { error } = await supabase
        .from('trail_favorites')
        .delete()
        .eq('couple_id', effectiveCoupleId)
        .eq('trail_id', trailId);

      if (error) throw error;
    },
    onSuccess: (_, trailId) => {
      queueSignal('unsave_trail', trailId, null, 'user', 1.0, { source: 'favorite_button' });
      
      queryClient.invalidateQueries({ queryKey: ['trail-favorites'] });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['user-affinity', user.id] });
      }
      
      toast({
        title: 'Removed',
        description: 'Trail removed from your saved list.',
      });
    },
    onError: (error) => {
      console.error('Remove trail favorite error:', error);
      toast({
        title: 'Failed to remove',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Toggle favorite with auth check
  const toggleFavorite = (trailId: string, parkId: string) => {
    if (!isAuthenticated) {
      showAuthToast({
        title: 'Sign in to save trails',
        description: 'Create a free account to build your trail list.',
        intentKey: 'pending_favorite_trail_id',
        intentValue: trailId,
        onNavigate: () => navigate('/auth'),
      });
      return;
    }
    
    if (isFavorited(trailId)) {
      removeFavorite.mutate(trailId);
    } else {
      addFavorite.mutate({ trailId, parkId });
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
