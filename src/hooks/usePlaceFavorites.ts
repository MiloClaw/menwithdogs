import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCouple } from './useCouple';
import { useToast } from './use-toast';

interface PlaceFavorite {
  id: string;
  couple_id: string;
  place_id: string;
  created_at: string;
}

export function usePlaceFavorites() {
  const { couple } = useCouple();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
      if (!coupleId) throw new Error('No couple found');

      const { data, error } = await supabase
        .from('couple_favorites')
        .insert({ couple_id: coupleId, place_id: placeId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['place-favorites', coupleId] });
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
      if (!coupleId) throw new Error('No couple found');

      const { error } = await supabase
        .from('couple_favorites')
        .delete()
        .eq('couple_id', coupleId)
        .eq('place_id', placeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['place-favorites', coupleId] });
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

  // Toggle favorite
  const toggleFavorite = (placeId: string) => {
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
