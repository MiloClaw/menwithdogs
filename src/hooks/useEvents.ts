import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Event {
  id: string;
  venue_place_id: string;
  name: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  category_tags: string[];
  source: 'google_places' | 'admin' | 'partner' | 'user_submitted' | 'inferred';
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
  updated_at: string;
  // Taxonomy fields
  event_type: string | null;
  event_format: string | null;
  social_energy_level: number | null;
  commitment_level: number | null;
  cost_type: string | null;
  is_recurring: boolean;
  created_by_role: string | null;
  inference_confidence: number | null;
  normalized_by_ai: boolean;
}

export interface EventWithVenue extends Event {
  venue?: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
  };
}

export interface CreateEventInput {
  venue_place_id: string;
  name: string;
  description?: string;
  start_at: string;
  end_at?: string;
  category_tags?: string[];
  status?: 'approved' | 'pending' | 'rejected';
  // Taxonomy fields
  event_type?: string | null;
  event_format?: string | null;
  social_energy_level?: number | null;
  commitment_level?: number | null;
  cost_type?: string | null;
  is_recurring?: boolean;
}

export const useEvents = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all events (admin view)
  const {
    data: events,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['events', 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          venue:places!venue_place_id (
            id,
            name,
            city,
            state
          )
        `)
        .order('start_at', { ascending: true });

      if (error) throw error;
      return data as EventWithVenue[];
    },
  });

  // Create event
  const createEvent = useMutation({
    mutationFn: async (input: CreateEventInput) => {
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...input,
          source: 'admin',
          status: input.status || 'approved',
          category_tags: input.category_tags || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Event created successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create event',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update event
  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Event> & { id: string }) => {
      // Remove source from updates to avoid ENUM type mismatch with generated types
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { source, ...safeUpdates } = updates;
      const { data, error } = await supabase
        .from('events')
        .update(safeUpdates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Event updated successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update event',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete event
  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Event deleted successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete event',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    events: events || [],
    isLoading,
    error,
    refetch,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
