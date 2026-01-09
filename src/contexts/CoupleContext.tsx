import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from './AuthContext';
import { getRouteForState, CoupleStatus, MemberOnboardingStep } from '@/lib/routing/getRouteForState';
import { useUserRole } from '@/hooks/useUserRole';

/**
 * ARCHITECTURAL NOTE: "Couple" = "Preference Group" (Relationship Unit)
 * 
 * Despite legacy naming, this table represents a preference aggregation unit:
 * - type: 'individual' = single user (default)
 * - type: 'couple' = two users with shared preferences
 * 
 * This is NOT a social profile. Users train the system, not present themselves.
 * The directory is the spine. All features resolve back to Places.
 * 
 * DEPRECATED COLUMNS (drift-locked, do not use):
 * - display_name, about_us, profile_photo_url: Social profile artifacts
 * - preferred_meetup_times: Social coordination field
 * - social_settings, availability, energy_style: Personality/identity fields
 */
type UnitType = 'couple' | 'individual';
type SubscriptionStatus = 'free' | 'trial' | 'active' | 'cancelled' | 'paused';

// Core relationship unit interface - only include active fields
interface Couple {
  id: string;
  is_complete: boolean;
  status: CoupleStatus;
  type: UnitType;
  subscription_status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
  // DEPRECATED: These exist in DB but should not be used
  // display_name, about_us, profile_photo_url, preferred_meetup_times, partner_first_name
}

// Member profile interface - only include active fields
interface MemberProfile {
  id: string;
  user_id: string;
  couple_id: string;
  is_owner: boolean;
  first_name: string | null;
  city: string | null;
  city_place_id: string | null;
  city_lat: number | null;
  city_lng: number | null;
  state: string | null;
  is_profile_complete: boolean;
  onboarding_step: MemberOnboardingStep;
  created_at: string;
  updated_at: string;
  // DEPRECATED: These exist in DB but should not be used
  // social_settings, availability, energy_style
}

interface CoupleContextValue {
  couple: Couple | null;
  memberProfile: MemberProfile | null;
  partnerProfile: MemberProfile | null;
  loading: boolean;
  error: string | null;
  nextRoute: string;
  hasCouple: boolean;
  isOwner: boolean;
  isCoupleComplete: boolean;
  isProfileComplete: boolean;
  unitType: UnitType;
  isIndividual: boolean;
  createCouple: (partnerFirstName?: string, unitType?: UnitType) => Promise<void>;
  updateMemberProfile: (updates: Partial<MemberProfile>) => Promise<MemberProfile>;
  updateCoupleProfile: (updates: Partial<Couple>) => Promise<Couple>;
  refetch: () => Promise<void>;
}

const CoupleContext = createContext<CoupleContextValue | null>(null);

export function CoupleProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuthContext();
  const { isAdmin, loading: roleLoading } = useUserRole();
  
  const [couple, setCouple] = useState<Couple | null>(null);
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupleData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setInitialLoadComplete(true);
      return;
    }

    // Only show loading on initial fetch (prevents flicker on refetch)
    if (!initialLoadComplete) {
      setLoading(true);
    }
    setError(null);

    try {
      console.debug('[CoupleContext] Fetching couple data for user:', user.id);
      
      // Fetch member profile
      const { data: fetchedMemberProfile, error: memberError } = await supabase
        .from('member_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberError) throw memberError;

      if (!fetchedMemberProfile) {
        console.debug('[CoupleContext] No member profile found');
        setCouple(null);
        setMemberProfile(null);
        setPartnerProfile(null);
        setLoading(false);
        return;
      }

      // Fetch couple
      const { data: fetchedCouple, error: coupleError } = await supabase
        .from('couples')
        .select('*')
        .eq('id', fetchedMemberProfile.couple_id)
        .single();

      if (coupleError) throw coupleError;

      // Fetch partner profile (if exists)
      const { data: fetchedPartnerProfile } = await supabase
        .from('member_profiles')
        .select('*')
        .eq('couple_id', fetchedMemberProfile.couple_id)
        .neq('user_id', user.id)
        .maybeSingle();

      console.debug('[CoupleContext] Data fetched:', {
        coupleId: fetchedCouple.id,
        coupleStatus: fetchedCouple.status,
        memberStep: fetchedMemberProfile.onboarding_step,
        isComplete: fetchedCouple.is_complete,
      });

      setCouple(fetchedCouple as Couple);
      setMemberProfile(fetchedMemberProfile as MemberProfile);
      setPartnerProfile(fetchedPartnerProfile as MemberProfile | null);
      setLoading(false);
      setInitialLoadComplete(true);
    } catch (err) {
      console.error('[CoupleContext] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch couple data');
      setLoading(false);
      setInitialLoadComplete(true);
    }
  }, [user, initialLoadComplete]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCoupleData();
    } else {
      setCouple(null);
      setMemberProfile(null);
      setPartnerProfile(null);
      setLoading(false);
    }
  }, [isAuthenticated, fetchCoupleData]);

  const createCouple = useCallback(async (partnerFirstName?: string, unitType: UnitType = 'individual'): Promise<void> => {
    if (!user) throw new Error('Not authenticated');

    // Verify session is fully propagated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Session not ready. Please try again in a moment.');
    }

    console.debug('[CoupleContext] Creating couple with type:', unitType);

    // Call atomic backend function with explicit unit_type
    const { data: coupleId, error } = await supabase.rpc('create_couple_for_current_user', {
      unit_type: unitType
    });

    if (error) {
      console.error('[CoupleContext] createCouple error:', { code: error.code, message: error.message });
      throw new Error(error.message || 'Failed to create couple');
    }

    // Update partner_first_name if provided (only relevant for 'couple' type)
    if (partnerFirstName && coupleId && unitType === 'couple') {
      await supabase
        .from('couples')
        .update({ partner_first_name: partnerFirstName })
        .eq('id', coupleId);
    }

    console.debug('[CoupleContext] Couple created, refetching...');

    // Refetch to get full state (membership now exists, RLS passes)
    await fetchCoupleData();
    // No return - guard handles navigation based on updated state
  }, [user, fetchCoupleData]);

  const updateMemberProfile = useCallback(async (updates: Partial<MemberProfile>) => {
    if (!memberProfile) throw new Error('No member profile');

    const { data, error } = await supabase
      .from('member_profiles')
      .update(updates)
      .eq('id', memberProfile.id)
      .select()
      .single();

    if (error) throw error;

    setMemberProfile(data as MemberProfile);
    return data as MemberProfile;
  }, [memberProfile, couple]);

  const updateCoupleProfile = useCallback(async (updates: Partial<Couple>) => {
    if (!couple) throw new Error('No couple');

    const { data, error } = await supabase
      .from('couples')
      .update(updates)
      .eq('id', couple.id)
      .select()
      .single();

    if (error) throw error;

    setCouple(data as Couple);
    return data as Couple;
  }, [couple]);

  const refetch = useCallback(async () => {
    await fetchCoupleData();
  }, [fetchCoupleData]);

  // Compute next route using simplified routing function
  // Admin users without a couple bypass onboarding and go to /admin
  const nextRoute = isAdmin && !couple
    ? '/admin'
    : getRouteForState({
        hasCouple: !!couple,
        memberStep: memberProfile?.onboarding_step ?? null,
      });

  console.debug('[CoupleContext] Computed nextRoute:', nextRoute, { loading, hasCouple: !!couple, isAdmin });

  const unitType: UnitType = couple?.type ?? 'couple';
  const isIndividual = unitType === 'individual';

  const value: CoupleContextValue = {
    couple,
    memberProfile,
    partnerProfile,
    loading,
    error,
    nextRoute,
    hasCouple: !!couple,
    isOwner: memberProfile?.is_owner ?? false,
    isCoupleComplete: couple?.is_complete ?? false,
    isProfileComplete: memberProfile?.is_profile_complete ?? false,
    unitType,
    isIndividual,
    createCouple,
    updateMemberProfile,
    updateCoupleProfile,
    refetch,
  };

  return <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>;
}

export function useCoupleContext() {
  const context = useContext(CoupleContext);
  if (!context) {
    throw new Error('useCoupleContext must be used within a CoupleProvider');
  }
  return context;
}
