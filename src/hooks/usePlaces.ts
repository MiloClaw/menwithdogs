import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Place {
  id: string;
  google_place_id: string;
  name: string;
  primary_category: string;
  secondary_categories: string[] | null;
  city: string | null;
  state: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  source: 'google_places' | 'admin';
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface CreatePlaceInput {
  google_place_id: string;
  name: string;
  primary_category: string;
  secondary_categories?: string[];
  city?: string;
  state?: string;
  country?: string;
  lat?: number;
  lng?: number;
  source?: 'google_places' | 'admin';
  status?: 'approved' | 'pending' | 'rejected';
}

export const usePlaces = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all places (admin view - includes all statuses)
  const {
    data: places,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['places', 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Place[];
    },
  });

  // Create place
  const createPlace = useMutation({
    mutationFn: async (input: CreatePlaceInput) => {
      const { data, error } = await supabase
        .from('places')
        .insert({
          ...input,
          source: input.source || 'admin',
          status: input.status || 'approved',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Place;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast({ title: 'Place created successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create place',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update place
  const updatePlace = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Place> & { id: string }) => {
      const { data, error } = await supabase
        .from('places')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Place;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast({ title: 'Place updated successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update place',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete place
  const deletePlace = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('places')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast({ title: 'Place deleted successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete place',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    places: places || [],
    isLoading,
    error,
    refetch,
    createPlace,
    updatePlace,
    deletePlace,
  };
};
