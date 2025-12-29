import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from './AuthContext';
import { getRouteForState, CoupleStatus, MemberOnboardingStep } from '@/lib/routing/getRouteForState';

interface Couple {
  id: string;
  display_name: string | null;
  about_us: string | null;
  shared_interests: string[] | null;
  preferred_meetup_times: string | null;
  is_complete: boolean;
  is_discoverable: boolean;
  status: CoupleStatus;
  created_at: string;
  updated_at: string;
}

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
  interests: string[] | null;
  social_settings: string | null;
  availability: string | null;
  energy_style: string | null;
  is_profile_complete: boolean;
  onboarding_step: MemberOnboardingStep;
  created_at: string;
  updated_at: string;
}

interface CoupleInvite {
  id: string;
  couple_id: string;
  invited_by: string;
  invited_email: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

interface CoupleContextValue {
  couple: Couple | null;
  memberProfile: MemberProfile | null;
  partnerProfile: MemberProfile | null;
  pendingInvite: CoupleInvite | null;
  loading: boolean;
  error: string | null;
  nextRoute: string;
  hasCouple: boolean;
  isOwner: boolean;
  isCoupleComplete: boolean;
  isProfileComplete: boolean;
  createCouple: () => Promise<void>;
  updateMemberProfile: (updates: Partial<MemberProfile>) => Promise<MemberProfile>;
  updateCoupleProfile: (updates: Partial<Couple>) => Promise<Couple>;
  refetch: () => Promise<void>;
}

const CoupleContext = createContext<CoupleContextValue | null>(null);

export function CoupleProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuthContext();
  
  const [couple, setCouple] = useState<Couple | null>(null);
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<MemberProfile | null>(null);
  const [pendingInvite, setPendingInvite] = useState<CoupleInvite | null>(null);
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
        setPendingInvite(null);
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

      // Fetch pending invite (if owner and couple not complete)
      let fetchedPendingInvite = null;
      if (fetchedMemberProfile.is_owner && !fetchedCouple.is_complete) {
        const { data: invite } = await supabase
          .from('couple_invites')
          .select('*')
          .eq('couple_id', fetchedMemberProfile.couple_id)
          .is('accepted_at', null)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .maybeSingle();
        
        fetchedPendingInvite = invite;
      }

      console.debug('[CoupleContext] Data fetched:', {
        coupleId: fetchedCouple.id,
        coupleStatus: fetchedCouple.status,
        memberStep: fetchedMemberProfile.onboarding_step,
        isComplete: fetchedCouple.is_complete,
      });

      setCouple(fetchedCouple as Couple);
      setMemberProfile(fetchedMemberProfile as MemberProfile);
      setPartnerProfile(fetchedPartnerProfile as MemberProfile | null);
      setPendingInvite(fetchedPendingInvite as CoupleInvite | null);
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
      setPendingInvite(null);
      setLoading(false);
    }
  }, [isAuthenticated, fetchCoupleData]);

  const createCouple = useCallback(async (): Promise<void> => {
    if (!user) throw new Error('Not authenticated');

    // Verify session is fully propagated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Session not ready. Please try again in a moment.');
    }

    console.debug('[CoupleContext] Creating couple...');

    // Call atomic backend function
    const { error } = await supabase.rpc('create_couple_for_current_user');

    if (error) {
      console.error('[CoupleContext] createCouple error:', { code: error.code, message: error.message });
      throw new Error(error.message || 'Failed to create couple');
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

    // Sync city/state to couple_location_summary
    if (updates.city && couple) {
      await supabase
        .from('couple_location_summary')
        .upsert({
          couple_id: couple.id,
          city: updates.city,
          state: updates.state || null,
          country: 'US',
          last_updated: new Date().toISOString(),
        }, { onConflict: 'couple_id' });
    }

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

  // Compute next route using pure routing function
  const nextRoute = getRouteForState({
    hasCouple: !!couple,
    coupleStatus: couple?.status ?? null,
    memberStep: memberProfile?.onboarding_step ?? null,
    coupleIsComplete: couple?.is_complete ?? false,
  });

  console.debug('[CoupleContext] Computed nextRoute:', nextRoute, { loading, hasCouple: !!couple });

  const value: CoupleContextValue = {
    couple,
    memberProfile,
    partnerProfile,
    pendingInvite,
    loading,
    error,
    nextRoute,
    hasCouple: !!couple,
    isOwner: memberProfile?.is_owner ?? false,
    isCoupleComplete: couple?.is_complete ?? false,
    isProfileComplete: memberProfile?.is_profile_complete ?? false,
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
