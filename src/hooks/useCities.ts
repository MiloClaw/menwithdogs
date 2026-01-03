import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type CityStatus = Database['public']['Enums']['city_status'];

export interface CityWithProgress {
  id: string;
  name: string;
  state: string | null;
  country: string;
  status: CityStatus;
  target_place_count: number;
  target_anchor_count: number;
  launched_at: string | null;
  current_place_count: number;
  approved_place_count: number;
  pending_place_count: number;
  curated_place_count: number;
  completion_percentage: number;
  is_ready_to_launch: boolean;
}

export interface CityInsert {
  name: string;
  state?: string | null;
  country?: string;
  target_place_count?: number;
  target_anchor_count?: number;
}

export interface CityUpdate {
  target_place_count?: number;
  target_anchor_count?: number;
  status?: CityStatus;
}

export function useCities(statusFilter?: CityStatus | 'all') {
  return useQuery({
    queryKey: ['cities', statusFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('city_seeding_progress')
        .select('*')
        .order('name');

      if (error) throw error;

      let cities = (data || []) as CityWithProgress[];
      
      if (statusFilter && statusFilter !== 'all') {
        cities = cities.filter(c => c.status === statusFilter);
      }

      return cities;
    },
  });
}

export function useCity(cityId: string | null) {
  return useQuery({
    queryKey: ['city', cityId],
    queryFn: async () => {
      if (!cityId) return null;
      
      const { data, error } = await supabase
        .from('city_seeding_progress')
        .select('*')
        .eq('id', cityId)
        .single();

      if (error) throw error;
      return data as CityWithProgress;
    },
    enabled: !!cityId,
  });
}

export function useCreateCity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (city: CityInsert) => {
      const { data, error } = await supabase
        .from('cities')
        .insert({
          name: city.name,
          state: city.state || null,
          country: city.country || 'US',
          target_place_count: city.target_place_count || 30,
          target_anchor_count: city.target_anchor_count || 15,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({ title: 'City created', description: 'The city has been added to your draft list.' });
    },
    onError: (error) => {
      toast({ title: 'Failed to create city', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateCity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CityUpdate }) => {
      const { data, error } = await supabase
        .from('cities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['city', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({ title: 'City updated' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update city', description: error.message, variant: 'destructive' });
    },
  });
}

export function useLaunchCity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (cityId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('cities')
        .update({
          status: 'launched',
          launched_at: new Date().toISOString(),
          launched_by: user.id,
        })
        .eq('id', cityId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, cityId) => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['city', cityId] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({ title: 'City launched!', description: 'The city is now live for users.' });
    },
    onError: (error) => {
      toast({ title: 'Failed to launch city', description: error.message, variant: 'destructive' });
    },
  });
}

export function usePauseCity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (cityId: string) => {
      const { data, error } = await supabase
        .from('cities')
        .update({ status: 'paused' })
        .eq('id', cityId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, cityId) => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['city', cityId] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({ title: 'City paused', description: 'The city is no longer visible to users.' });
    },
    onError: (error) => {
      toast({ title: 'Failed to pause city', description: error.message, variant: 'destructive' });
    },
  });
}

export function useResumeCity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (cityId: string) => {
      const { data, error } = await supabase
        .from('cities')
        .update({ status: 'launched' })
        .eq('id', cityId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, cityId) => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['city', cityId] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({ title: 'City resumed', description: 'The city is live again.' });
    },
    onError: (error) => {
      toast({ title: 'Failed to resume city', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteCity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (cityId: string) => {
      const { error } = await supabase
        .from('cities')
        .delete()
        .eq('id', cityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({ title: 'City deleted' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete city', description: error.message, variant: 'destructive' });
    },
  });
}
