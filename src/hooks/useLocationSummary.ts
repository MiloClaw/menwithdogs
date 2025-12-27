import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LocationSummary {
  couple_id: string;
  city: string;
  state: string | null;
  country: string;
  last_updated: string;
}

/**
 * Hook for managing couple location summary (Phase 5)
 * This provides a single source of truth for discovery location
 */
export function useLocationSummary() {
  /**
   * Get the location summary for a couple
   */
  const getLocationSummary = useCallback(async (coupleId: string): Promise<LocationSummary | null> => {
    const { data, error } = await supabase
      .from('couple_location_summary')
      .select('*')
      .eq('couple_id', coupleId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }, []);

  /**
   * Upsert the location summary for a couple
   */
  const upsertLocationSummary = useCallback(async (
    coupleId: string,
    city: string,
    state?: string,
    country: string = 'US'
  ): Promise<LocationSummary> => {
    const { data, error } = await supabase
      .from('couple_location_summary')
      .upsert({
        couple_id: coupleId,
        city,
        state: state || null,
        country,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'couple_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }, []);

  /**
   * Initialize location summary from member profile city (for existing couples)
   * This is a migration helper that can be called when a couple's summary is missing
   */
  const initializeFromMemberProfile = useCallback(async (coupleId: string): Promise<LocationSummary | null> => {
    // Check if summary already exists
    const existing = await getLocationSummary(coupleId);
    if (existing) return existing;

    // Fetch city from member profiles
    const { data: memberProfiles } = await supabase
      .from('member_profiles')
      .select('city')
      .eq('couple_id', coupleId)
      .limit(1);

    const city = memberProfiles?.[0]?.city;
    if (!city) return null;

    // Create the summary
    return upsertLocationSummary(coupleId, city);
  }, [getLocationSummary, upsertLocationSummary]);

  return {
    getLocationSummary,
    upsertLocationSummary,
    initializeFromMemberProfile,
  };
}
