import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCoupleContext } from '@/contexts/CoupleContext';
import { calculateDistanceMiles } from '@/lib/distance';
import { startOfDay, endOfDay, endOfWeek, endOfMonth, addDays } from 'date-fns';

export interface PublicEvent {
  id: string;
  name: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  category_tags: string[];
  // Taxonomy fields
  event_type: string | null;
  event_format: string | null;
  social_energy_level: number | null;
  commitment_level: number | null;
  cost_type: string | null;
  is_recurring: boolean;
  venue: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    lat: number | null;
    lng: number | null;
    formatted_address: string | null;
  };
  distance?: number;
}

export type DateFilter = 'today' | 'this_week' | 'this_month' | 'upcoming' | 'all';

interface UseEventsPublicOptions {
  dateFilter?: DateFilter;
  radiusFilter?: number | null;
  searchTerm?: string;
  categoryFilter?: string | null;
}

export function useEventsPublic(options: UseEventsPublicOptions = {}) {
  const { memberProfile } = useCoupleContext();
  const { dateFilter = 'upcoming', radiusFilter = null, searchTerm = '', categoryFilter = null } = options;

  const userLat = memberProfile?.city_lat;
  const userLng = memberProfile?.city_lng;
  const hasUserLocation = userLat != null && userLng != null;

  return useQuery({
    queryKey: ['events', 'public', dateFilter, radiusFilter, searchTerm, categoryFilter],
    queryFn: async () => {
      const now = new Date();
      let dateStart: Date | null = null;
      let dateEnd: Date | null = null;

      switch (dateFilter) {
        case 'today':
          dateStart = startOfDay(now);
          dateEnd = endOfDay(now);
          break;
        case 'this_week':
          dateStart = startOfDay(now);
          dateEnd = endOfWeek(now, { weekStartsOn: 0 });
          break;
        case 'this_month':
          dateStart = startOfDay(now);
          dateEnd = endOfMonth(now);
          break;
        case 'upcoming':
          dateStart = startOfDay(now);
          dateEnd = null; // No end limit
          break;
        case 'all':
        default:
          dateStart = null;
          dateEnd = null;
          break;
      }

      let query = supabase
        .from('events')
        .select(`
          id,
          name,
          description,
          start_at,
          end_at,
          category_tags,
          event_type,
          event_format,
          social_energy_level,
          commitment_level,
          cost_type,
          is_recurring,
          venue:places!venue_place_id (
            id,
            name,
            city,
            state,
            lat,
            lng,
            formatted_address
          )
        `)
        .eq('status', 'approved')
        .order('start_at', { ascending: true });

      // Apply date filters
      if (dateStart) {
        query = query.gte('start_at', dateStart.toISOString());
      }
      if (dateEnd) {
        query = query.lte('start_at', dateEnd.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      // Process events with distance calculation
      let events = (data as PublicEvent[]).map(event => {
        let distance: number | undefined;
        
        if (hasUserLocation && event.venue?.lat != null && event.venue?.lng != null) {
          distance = calculateDistanceMiles(userLat, userLng, event.venue.lat, event.venue.lng);
        }
        
        return { ...event, distance };
      });

      // Apply client-side filters
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        events = events.filter(e => 
          e.name.toLowerCase().includes(term) ||
          e.venue?.name.toLowerCase().includes(term) ||
          e.venue?.city?.toLowerCase().includes(term)
        );
      }

      if (categoryFilter) {
        events = events.filter(e => 
          e.category_tags?.includes(categoryFilter)
        );
      }

      if (radiusFilter !== null && hasUserLocation) {
        events = events.filter(e => 
          e.distance !== undefined && e.distance <= radiusFilter
        );
      }

      // Sort by date, then distance
      return events.sort((a, b) => {
        const dateA = new Date(a.start_at).getTime();
        const dateB = new Date(b.start_at).getTime();
        if (dateA !== dateB) return dateA - dateB;
        
        // Secondary sort by distance
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return 0;
      });
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

// Helper to get unique categories from events
export function useEventCategories() {
  return useQuery({
    queryKey: ['events', 'categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('category_tags')
        .eq('status', 'approved');

      if (error) throw error;

      const allTags = data?.flatMap(e => e.category_tags || []) || [];
      return [...new Set(allTags)].sort();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
