import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCouple } from './useCouple';

export interface RevealedCouple {
  id: string;
  context_type: 'place' | 'event';
  place_id: string | null;
  event_id: string | null;
  couple_a_id: string;
  couple_b_id: string;
  expires_at: string;
  couple_a_display_name: string | null;
  couple_a_photo: string | null;
  couple_b_display_name: string | null;
  couple_b_photo: string | null;
}

export interface CouplePresenceInfo {
  couple_id: string;
  display_name: string | null;
  photo_url: string | null;
  is_revealed: boolean;
  status: 'interested' | 'planning_to_attend' | 'open_to_hello';
}

/**
 * Fetches couples with presence at a place/event and determines reveal status
 */
export function useRevealedCouples(placeId?: string, eventId?: string) {
  const { couple } = useCouple();
  const myCoupleId = couple?.id;

  return useQuery({
    queryKey: ['revealed-couples', placeId, eventId, myCoupleId],
    queryFn: async (): Promise<CouplePresenceInfo[]> => {
      if (!myCoupleId || (!placeId && !eventId)) {
        return [];
      }

      // 1. First fetch all couples with presence at this place/event
      let presenceQuery = supabase
        .from('couple_presence')
        .select('couple_id, status')
        .neq('couple_id', myCoupleId); // Exclude self

      if (placeId) {
        presenceQuery = presenceQuery.eq('place_id', placeId);
      } else if (eventId) {
        presenceQuery = presenceQuery.eq('event_id', eventId);
      }

      const { data: presenceData, error: presenceError } = await presenceQuery;
      if (presenceError) throw presenceError;

      if (!presenceData?.length) {
        return [];
      }

      const coupleIds = presenceData.map(p => p.couple_id);

      // 2. Fetch couple profiles for these couples
      const { data: couplesData, error: couplesError } = await supabase
        .from('couples')
        .select('id, display_name, profile_photo_url')
        .in('id', coupleIds);

      if (couplesError) throw couplesError;

      // 3. Fetch reveal records for this context
      let revealQuery = supabase
        .from('revealed_couples_view')
        .select('*');

      if (placeId) {
        revealQuery = revealQuery.eq('place_id', placeId);
      } else if (eventId) {
        revealQuery = revealQuery.eq('event_id', eventId);
      }

      // Filter to reveals involving the current user
      revealQuery = revealQuery.or(`couple_a_id.eq.${myCoupleId},couple_b_id.eq.${myCoupleId}`);

      const { data: revealsData, error: revealsError } = await revealQuery;
      if (revealsError) {
        // View might return empty if no reveals, that's ok
        console.debug('Reveal query error (may be empty):', revealsError);
      }

      // Build a set of revealed couple IDs
      const revealedCoupleIds = new Set<string>();
      revealsData?.forEach(reveal => {
        // Add the "other" couple from each reveal
        if (reveal.couple_a_id === myCoupleId) {
          revealedCoupleIds.add(reveal.couple_b_id);
        } else if (reveal.couple_b_id === myCoupleId) {
          revealedCoupleIds.add(reveal.couple_a_id);
        }
      });

      // 4. Combine into final result
      const coupleMap = new Map(couplesData?.map(c => [c.id, c]));
      const statusMap = new Map(presenceData.map(p => [p.couple_id, p.status]));

      return coupleIds.map(coupleId => {
        const coupleData = coupleMap.get(coupleId);
        const isRevealed = revealedCoupleIds.has(coupleId);
        
        return {
          couple_id: coupleId,
          display_name: isRevealed ? (coupleData?.display_name || null) : null,
          photo_url: isRevealed ? (coupleData?.profile_photo_url || null) : null,
          is_revealed: isRevealed,
          status: statusMap.get(coupleId) as CouplePresenceInfo['status'],
        };
      });
    },
    enabled: !!myCoupleId && (!!placeId || !!eventId),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to check if a specific couple is revealed to the current user at a context
 */
export function useIsRevealed(otherCoupleId: string | undefined, placeId?: string, eventId?: string) {
  const { couple } = useCouple();
  const myCoupleId = couple?.id;

  return useQuery({
    queryKey: ['is-revealed', myCoupleId, otherCoupleId, placeId, eventId],
    queryFn: async (): Promise<boolean> => {
      if (!myCoupleId || !otherCoupleId || (!placeId && !eventId)) {
        return false;
      }

      // Order IDs for constraint matching
      const [orderedA, orderedB] = myCoupleId < otherCoupleId 
        ? [myCoupleId, otherCoupleId] 
        : [otherCoupleId, myCoupleId];

      let query = supabase
        .from('revealed_couples_view')
        .select('id')
        .eq('couple_a_id', orderedA)
        .eq('couple_b_id', orderedB);

      if (placeId) {
        query = query.eq('place_id', placeId);
      } else if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query.maybeSingle();
      
      if (error) {
        console.debug('Reveal check error:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!myCoupleId && !!otherCoupleId && (!!placeId || !!eventId),
    staleTime: 30 * 1000,
  });
}
