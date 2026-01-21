import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CityEvent {
  id: string;
  name: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  recurrence_day_of_week: number | null;
  recurrence_time: string | null;
  event_type: string | null;
  cost_type: string | null;
  external_url: string | null;
  venue: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    website_url: string | null;
  } | null;
}

/**
 * Fetch approved events for a city by city name/state lookup
 * Returns both upcoming one-time events and recurring events
 */
export function useCityEvents(cityName: string | null, state: string | null) {
  return useQuery({
    queryKey: ['events', 'city', cityName, state],
    queryFn: async () => {
      // First look up the city to get lat/lng bounds
      let cityQuery = supabase
        .from('cities')
        .select('id, name, state, lat, lng')
        .eq('name', cityName!)
        .eq('status', 'launched');
      
      if (state) {
        cityQuery = cityQuery.eq('state', state);
      }
      
      const { data: city, error: cityError } = await cityQuery.limit(1).maybeSingle();
      
      if (cityError || !city) return [];
      
      // Fetch approved events where venue is in this city
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          name,
          description,
          start_at,
          end_at,
          is_recurring,
          event_type,
          cost_type,
          venue:places!venue_place_id (
            id,
            name,
            city,
            state,
            website_url
          )
        `)
        .eq('status', 'approved')
        .order('start_at', { ascending: true })
        .limit(10);

      if (error) throw error;
      
      // Filter to events in this city (by venue city match)
      const cityEvents = (data || []).filter(event => {
        const venue = event.venue as CityEvent['venue'];
        return venue?.city?.toLowerCase() === cityName!.toLowerCase() &&
          (!state || venue?.state?.toLowerCase() === state.toLowerCase());
      });

      // Filter: only show future events OR recurring events
      const now = new Date();
      return cityEvents.filter(event => {
        if (event.is_recurring) return true; // Always show recurring
        if (!event.start_at) return false;
        return new Date(event.start_at) >= now;
      }) as CityEvent[];
    },
    enabled: !!cityName,
  });
}

/**
 * Fetch approved events for a specific place
 */
export function usePlaceEvents(placeId: string | null) {
  return useQuery({
    queryKey: ['events', 'place', placeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          name,
          description,
          start_at,
          end_at,
          is_recurring,
          event_type,
          cost_type
        `)
        .eq('venue_place_id', placeId!)
        .eq('status', 'approved')
        .order('start_at', { ascending: true })
        .limit(10);

      if (error) throw error;
      
      // Filter: only show future events OR recurring events
      const now = new Date();
      return (data || []).filter(event => {
        if (event.is_recurring) return true;
        if (!event.start_at) return false;
        return new Date(event.start_at) >= now;
      });
    },
    enabled: !!placeId,
  });
}
