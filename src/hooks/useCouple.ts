import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Couple {
  id: string;
  display_name: string | null;
  about_us: string | null;
  shared_interests: string[] | null;
  preferred_meetup_times: string | null;
  is_complete: boolean;
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
  interests: string[] | null;
  social_settings: string | null;
  availability: string | null;
  energy_style: string | null;
  is_profile_complete: boolean;
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

interface CoupleState {
  couple: Couple | null;
  memberProfile: MemberProfile | null;
  partnerProfile: MemberProfile | null;
  pendingInvite: CoupleInvite | null;
  loading: boolean;
  error: string | null;
}

export function useCouple() {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<CoupleState>({
    couple: null,
    memberProfile: null,
    partnerProfile: null,
    pendingInvite: null,
    loading: true,
    error: null,
  });

  const fetchCoupleData = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    // Set loading true immediately when starting fetch
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch member profile
      const { data: memberProfile, error: memberError } = await supabase
        .from('member_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberError) throw memberError;

      if (!memberProfile) {
        setState({
          couple: null,
          memberProfile: null,
          partnerProfile: null,
          pendingInvite: null,
          loading: false,
          error: null,
        });
        return;
      }

      // Fetch couple
      const { data: couple, error: coupleError } = await supabase
        .from('couples')
        .select('*')
        .eq('id', memberProfile.couple_id)
        .single();

      if (coupleError) throw coupleError;

      // Fetch partner profile (if exists)
      const { data: partnerProfile } = await supabase
        .from('member_profiles')
        .select('*')
        .eq('couple_id', memberProfile.couple_id)
        .neq('user_id', user.id)
        .maybeSingle();

      // Fetch pending invite (if owner and couple not complete)
      let pendingInvite = null;
      if (memberProfile.is_owner && !couple.is_complete) {
        const { data: invite } = await supabase
          .from('couple_invites')
          .select('*')
          .eq('couple_id', memberProfile.couple_id)
          .is('accepted_at', null)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .maybeSingle();
        
        pendingInvite = invite;
      }

      setState({
        couple: couple as Couple,
        memberProfile: memberProfile as MemberProfile,
        partnerProfile: partnerProfile as MemberProfile | null,
        pendingInvite: pendingInvite as CoupleInvite | null,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch couple data',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCoupleData();
    } else {
      setState({
        couple: null,
        memberProfile: null,
        partnerProfile: null,
        pendingInvite: null,
        loading: false,
        error: null,
      });
    }
  }, [isAuthenticated, fetchCoupleData]);

  const createCouple = useCallback(async () => {
    if (!user) throw new Error('Not authenticated');

    // Safety guard: check if user already has a profile/couple
    const { data: existingProfile } = await supabase
      .from('member_profiles')
      .select('*, couples(*)')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingProfile) {
      // User already has a couple - refetch and return existing data
      await fetchCoupleData();
      throw new Error('You already have a couple profile');
    }

    // Create couple
    const { data: couple, error: coupleError } = await supabase
      .from('couples')
      .insert({})
      .select()
      .single();

    if (coupleError) throw coupleError;

    // Create member profile as owner
    const { data: memberProfile, error: memberError } = await supabase
      .from('member_profiles')
      .insert({
        user_id: user.id,
        couple_id: couple.id,
        is_owner: true,
      })
      .select()
      .single();

    if (memberError) throw memberError;

    setState(prev => ({
      ...prev,
      couple: couple as Couple,
      memberProfile: memberProfile as MemberProfile,
    }));

    return { couple, memberProfile };
  }, [user, fetchCoupleData]);

  const updateMemberProfile = useCallback(async (updates: Partial<MemberProfile>) => {
    if (!state.memberProfile) throw new Error('No member profile');

    const { data, error } = await supabase
      .from('member_profiles')
      .update(updates)
      .eq('id', state.memberProfile.id)
      .select()
      .single();

    if (error) throw error;

    // Sync city to couple_location_summary (Phase 5)
    if (updates.city && state.couple) {
      await supabase
        .from('couple_location_summary')
        .upsert({
          couple_id: state.couple.id,
          city: updates.city,
          country: 'US',
          last_updated: new Date().toISOString(),
        }, { onConflict: 'couple_id' });
    }

    setState(prev => ({
      ...prev,
      memberProfile: data as MemberProfile,
    }));

    return data;
  }, [state.memberProfile, state.couple]);

  const updateCoupleProfile = useCallback(async (updates: Partial<Couple>) => {
    if (!state.couple) throw new Error('No couple');

    const { data, error } = await supabase
      .from('couples')
      .update(updates)
      .eq('id', state.couple.id)
      .select()
      .single();

    if (error) throw error;

    setState(prev => ({
      ...prev,
      couple: data as Couple,
    }));

    return data;
  }, [state.couple]);

  const refetch = useCallback(() => {
    fetchCoupleData();
  }, [fetchCoupleData]);

  return {
    ...state,
    createCouple,
    updateMemberProfile,
    updateCoupleProfile,
    refetch,
    hasCouple: !!state.couple,
    isOwner: state.memberProfile?.is_owner ?? false,
    isCoupleComplete: state.couple?.is_complete ?? false,
    isProfileComplete: state.memberProfile?.is_profile_complete ?? false,
  };
}
