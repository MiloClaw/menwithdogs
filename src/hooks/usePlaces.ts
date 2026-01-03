import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface PhotoReference {
  name: string;
  widthPx: number;
  heightPx: number;
}

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
  // GBP enrichment fields
  rating: number | null;
  user_ratings_total: number | null;
  price_level: number | null;
  website_url: string | null;
  phone_number: string | null;
  google_maps_url: string | null;
  formatted_address: string | null;
  opening_hours: Json | null;
  photos: Json | null;
  google_primary_type: string | null;
  google_primary_type_display: string | null;
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
  // GBP enrichment fields
  rating?: number | null;
  user_ratings_total?: number | null;
  price_level?: number | null;
  website_url?: string | null;
  phone_number?: string | null;
  google_maps_url?: string | null;
  formatted_address?: string | null;
  opening_hours?: Json | null;
  photos?: Json | null;
  google_primary_type?: string | null;
  google_primary_type_display?: string | null;
}

// Helper to extract weekday_text from opening_hours JSON
export const getOpeningHoursText = (openingHours: Json | null): string[] => {
  if (!openingHours || typeof openingHours !== 'object' || Array.isArray(openingHours)) {
    return [];
  }
  const hours = openingHours as { weekday_text?: string[] };
  return hours.weekday_text || [];
};

// Helper to extract photos array from JSON
export const getPhotos = (photos: Json | null): PhotoReference[] => {
  if (!photos || !Array.isArray(photos)) {
    return [];
  }
  return photos as unknown as PhotoReference[];
};

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
      const insertData = {
        google_place_id: input.google_place_id,
        name: input.name,
        primary_category: input.primary_category,
        secondary_categories: input.secondary_categories,
        city: input.city,
        state: input.state,
        country: input.country,
        lat: input.lat,
        lng: input.lng,
        source: input.source || 'admin',
        status: input.status || 'approved',
        rating: input.rating,
        user_ratings_total: input.user_ratings_total,
        price_level: input.price_level,
        website_url: input.website_url,
        phone_number: input.phone_number,
        google_maps_url: input.google_maps_url,
        formatted_address: input.formatted_address,
        opening_hours: input.opening_hours,
        photos: input.photos,
        google_primary_type: input.google_primary_type,
        google_primary_type_display: input.google_primary_type_display,
      };

      const { data, error } = await supabase
        .from('places')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data as Place;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      queryClient.invalidateQueries({ queryKey: ['places', 'public'] });
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
      queryClient.invalidateQueries({ queryKey: ['places', 'public'] });
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
      queryClient.invalidateQueries({ queryKey: ['places', 'public'] });
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
