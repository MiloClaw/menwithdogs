import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCouple } from './useCouple';

interface DiscoverableCouple {
  id: string;
  display_name: string | null;
  about_us: string | null;
  updated_at: string;
  city: string | null;
  interestLabels: string[]; // Pre-resolved interest labels
}

interface DiscoveryState {
  couples: DiscoverableCouple[];
  savedCoupleIds: Set<string>;
  loading: boolean;
  error: string | null;
}

const MAX_DISCOVERY_RESULTS = 20;

export function useDiscovery() {
  const { couple, memberProfile } = useCouple();
  const [state, setState] = useState<DiscoveryState>({
    couples: [],
    savedCoupleIds: new Set(),
    loading: true,
    error: null,
  });

  const fetchDiscoverableCouples = useCallback(async () => {
    if (!couple || !memberProfile?.city) {
      setState(prev => ({ ...prev, loading: false, couples: [] }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));

      // Fetch discoverable couples (RLS handles is_discoverable and is_complete)
      const { data: discoverableCouples, error: couplesError } = await supabase
        .from('couples')
        .select('id, display_name, about_us, updated_at')
        .eq('is_discoverable', true)
        .eq('is_complete', true)
        .neq('id', couple.id)
        .order('updated_at', { ascending: false })
        .limit(MAX_DISCOVERY_RESULTS);

      if (couplesError) throw couplesError;

      const coupleIds = discoverableCouples?.map(c => c.id) || [];
      
      let couplesWithCity: DiscoverableCouple[] = [];
      
      if (coupleIds.length > 0) {
        // Fetch location summaries for city info
        const { data: locationSummaries, error: locationError } = await supabase
          .from('couple_location_summary')
          .select('couple_id, city')
          .in('couple_id', coupleIds);

        if (locationError) throw locationError;

        // Fetch couple interests from join table
        const { data: coupleInterests, error: interestsError } = await supabase
          .from('couple_interests')
          .select('couple_id, interest_id')
          .in('couple_id', coupleIds);

        if (interestsError) throw interestsError;

        // Fetch interest labels
        const interestIds = [...new Set(coupleInterests?.map(ci => ci.interest_id) || [])];
        let interestLabelsMap = new Map<string, string>();
        
        if (interestIds.length > 0) {
          const { data: interests } = await supabase
            .from('interests')
            .select('id, label')
            .in('id', interestIds);
          
          interests?.forEach(i => interestLabelsMap.set(i.id, i.label));
        }

        // Create maps
        const cityMap = new Map<string, string>();
        locationSummaries?.forEach(ls => {
          if (ls.city) {
            cityMap.set(ls.couple_id, ls.city);
          }
        });

        const coupleInterestsMap = new Map<string, string[]>();
        coupleInterests?.forEach(ci => {
          const existing = coupleInterestsMap.get(ci.couple_id) || [];
          const label = interestLabelsMap.get(ci.interest_id);
          if (label) {
            existing.push(label);
          }
          coupleInterestsMap.set(ci.couple_id, existing);
        });

        // Filter to same city and add city + interests to couples
        const userCity = memberProfile.city.toLowerCase().trim();
        couplesWithCity = (discoverableCouples || [])
          .map(c => ({
            id: c.id,
            display_name: c.display_name,
            about_us: c.about_us,
            updated_at: c.updated_at,
            city: cityMap.get(c.id) || null,
            interestLabels: coupleInterestsMap.get(c.id) || [],
          }))
          .filter(c => c.city?.toLowerCase().trim() === userCity);
      }

      // Fetch saved couples for current user
      const { data: savedCouples, error: savedError } = await supabase
        .from('saved_couples')
        .select('saved_couple_id');

      if (savedError) throw savedError;

      const savedIds = new Set(savedCouples?.map(s => s.saved_couple_id) || []);

      setState({
        couples: couplesWithCity,
        savedCoupleIds: savedIds,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load discovery',
      }));
    }
  }, [couple, memberProfile?.city]);

  useEffect(() => {
    fetchDiscoverableCouples();
  }, [fetchDiscoverableCouples]);

  const saveCouple = useCallback(async (coupleId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { error } = await supabase
        .from('saved_couples')
        .insert({ 
          saved_couple_id: coupleId,
          user_id: user.id,
        });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        savedCoupleIds: new Set([...prev.savedCoupleIds, coupleId]),
      }));
    } catch (err) {
      throw err;
    }
  }, []);

  const unsaveCouple = useCallback(async (coupleId: string) => {
    try {
      const { error } = await supabase
        .from('saved_couples')
        .delete()
        .eq('saved_couple_id', coupleId);

      if (error) throw error;

      setState(prev => {
        const newIds = new Set(prev.savedCoupleIds);
        newIds.delete(coupleId);
        return { ...prev, savedCoupleIds: newIds };
      });
    } catch (err) {
      throw err;
    }
  }, []);

  const isSaved = useCallback((coupleId: string) => {
    return state.savedCoupleIds.has(coupleId);
  }, [state.savedCoupleIds]);

  const refetch = useCallback(() => {
    fetchDiscoverableCouples();
  }, [fetchDiscoverableCouples]);

  return {
    ...state,
    saveCouple,
    unsaveCouple,
    isSaved,
    refetch,
    hasResults: state.couples.length > 0,
    isEmpty: !state.loading && state.couples.length === 0,
  };
}
