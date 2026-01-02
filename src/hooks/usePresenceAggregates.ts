import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PresenceAggregate {
  interested_count: number;
  planning_count: number;
  open_count: number;
}

const DEFAULT_AGGREGATE: PresenceAggregate = {
  interested_count: 0,
  planning_count: 0,
  open_count: 0,
};

export function usePlacePresenceAggregate(placeId: string | undefined) {
  return useQuery({
    queryKey: ['presence-agg', 'place', placeId],
    queryFn: async (): Promise<PresenceAggregate> => {
      if (!placeId) return DEFAULT_AGGREGATE;

      const { data, error } = await supabase
        .from('place_presence_agg')
        .select('*')
        .eq('place_id', placeId)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return DEFAULT_AGGREGATE;
      
      return {
        interested_count: Number(data.interested_count) || 0,
        planning_count: Number(data.planning_count) || 0,
        open_count: Number(data.open_count) || 0,
      };
    },
    enabled: !!placeId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useEventPresenceAggregate(eventId: string | undefined) {
  return useQuery({
    queryKey: ['presence-agg', 'event', eventId],
    queryFn: async (): Promise<PresenceAggregate> => {
      if (!eventId) return DEFAULT_AGGREGATE;

      const { data, error } = await supabase
        .from('event_presence_agg')
        .select('*')
        .eq('event_id', eventId)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return DEFAULT_AGGREGATE;
      
      return {
        interested_count: Number(data.interested_count) || 0,
        planning_count: Number(data.planning_count) || 0,
        open_count: Number(data.open_count) || 0,
      };
    },
    enabled: !!eventId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Batch fetch for list views
export function usePlacePresenceAggregates(placeIds: string[]) {
  return useQuery({
    queryKey: ['presence-agg', 'places', placeIds.sort().join(',')],
    queryFn: async (): Promise<Record<string, PresenceAggregate>> => {
      if (placeIds.length === 0) return {};

      const { data, error } = await supabase
        .from('place_presence_agg')
        .select('*')
        .in('place_id', placeIds);

      if (error) throw error;

      const result: Record<string, PresenceAggregate> = {};
      
      // Initialize all with defaults
      placeIds.forEach(id => {
        result[id] = { ...DEFAULT_AGGREGATE };
      });

      // Populate with actual data
      data?.forEach(row => {
        result[row.place_id] = {
          interested_count: Number(row.interested_count) || 0,
          planning_count: Number(row.planning_count) || 0,
          open_count: Number(row.open_count) || 0,
        };
      });

      return result;
    },
    enabled: placeIds.length > 0,
    staleTime: 30 * 1000,
  });
}

export function useEventPresenceAggregates(eventIds: string[]) {
  return useQuery({
    queryKey: ['presence-agg', 'events', eventIds.sort().join(',')],
    queryFn: async (): Promise<Record<string, PresenceAggregate>> => {
      if (eventIds.length === 0) return {};

      const { data, error } = await supabase
        .from('event_presence_agg')
        .select('*')
        .in('event_id', eventIds);

      if (error) throw error;

      const result: Record<string, PresenceAggregate> = {};
      
      // Initialize all with defaults
      eventIds.forEach(id => {
        result[id] = { ...DEFAULT_AGGREGATE };
      });

      // Populate with actual data
      data?.forEach(row => {
        result[row.event_id] = {
          interested_count: Number(row.interested_count) || 0,
          planning_count: Number(row.planning_count) || 0,
          open_count: Number(row.open_count) || 0,
        };
      });

      return result;
    },
    enabled: eventIds.length > 0,
    staleTime: 30 * 1000,
  });
}
