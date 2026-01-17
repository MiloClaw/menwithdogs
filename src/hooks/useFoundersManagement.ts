import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PRICING } from '@/lib/founders-pricing';

export interface FoundersCityOffer {
  cityId: string;
  cityName: string;
  state: string | null;
  promoCode: string;
  promoCodeId: string;
  slotsUsed: number;
  slotsTotal: number;
  launchedAt: string | null;
  stripeActive?: boolean;
  stripeTimesRedeemed?: number;
}

export interface FoundersRedemption {
  id: string;
  userId: string;
  userEmail: string | null;
  cityId: string | null;
  cityName: string | null;
  cityState: string | null;
  coupleId: string | null;
  stripeSubscriptionId: string | null;
  stripePromoCodeId: string | null;
  redeemedAt: string | null;
  createdAt: string | null;
}

export interface FoundersAggregateStats {
  totalFounders: number;
  activeCities: number;
  totalSlotsClaimed: number;
  totalSlotsAvailable: number;
  estimatedMonthlyRevenue: number;
}

interface StripePromoStatus {
  id: string;
  code: string;
  active: boolean;
  times_redeemed: number;
  max_redemptions: number | null;
}

/**
 * Comprehensive hook for founders program management.
 * Provides city offers, redemptions, and Stripe operations.
 */
export function useFoundersManagement() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query: All cities with promo codes
  const citiesQuery = useQuery({
    queryKey: ['founders-cities'],
    queryFn: async (): Promise<FoundersCityOffer[]> => {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, state, founders_promo_code, founders_promo_code_id, founders_slots_used, founders_slots_total, launched_at')
        .not('founders_promo_code_id', 'is', null)
        .order('launched_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(city => ({
        cityId: city.id,
        cityName: city.name,
        state: city.state,
        promoCode: city.founders_promo_code || '',
        promoCodeId: city.founders_promo_code_id || '',
        slotsUsed: city.founders_slots_used ?? 0,
        slotsTotal: city.founders_slots_total ?? PRICING.FOUNDERS.SLOTS_PER_CITY,
        launchedAt: city.launched_at,
      }));
    },
    enabled: !!session,
  });

  // Query: All redemptions with user emails (via RPC)
  const redemptionsQuery = useQuery({
    queryKey: ['founders-redemptions'],
    queryFn: async (): Promise<FoundersRedemption[]> => {
      const { data, error } = await supabase.rpc('get_founders_redemptions_with_emails', {
        _city_id: null,
        _limit: 500,
        _offset: 0,
      });

      if (error) throw error;

      return (data || []).map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        userEmail: r.user_email,
        cityId: r.city_id,
        cityName: r.city_name,
        cityState: r.city_state,
        coupleId: r.couple_id,
        stripeSubscriptionId: r.stripe_subscription_id,
        stripePromoCodeId: r.stripe_promo_code_id,
        redeemedAt: r.redeemed_at,
        createdAt: r.created_at,
      }));
    },
    enabled: !!session,
  });

  // Computed: Aggregate stats
  const aggregateStats: FoundersAggregateStats = {
    totalFounders: redemptionsQuery.data?.length ?? 0,
    activeCities: citiesQuery.data?.length ?? 0,
    totalSlotsClaimed: citiesQuery.data?.reduce((sum, c) => sum + c.slotsUsed, 0) ?? 0,
    totalSlotsAvailable: citiesQuery.data?.reduce((sum, c) => sum + c.slotsTotal, 0) ?? 0,
    estimatedMonthlyRevenue: (redemptionsQuery.data?.length ?? 0) * PRICING.FOUNDERS.MONTHLY_AMOUNT,
  };

  // Mutation: Get promo status from Stripe
  const getPromoStatus = useMutation({
    mutationFn: async (promoCodeId: string): Promise<StripePromoStatus> => {
      const { data, error } = await supabase.functions.invoke('manage-founders-promo', {
        body: { action: 'get_promo_status', promo_code_id: promoCodeId },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to get promo status');
      return data.promo_code;
    },
  });

  // Mutation: Pause promo code
  const pausePromo = useMutation({
    mutationFn: async (promoCodeId: string) => {
      const { data, error } = await supabase.functions.invoke('manage-founders-promo', {
        body: { action: 'pause_promo', promo_code_id: promoCodeId },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to pause promo');
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Promo code paused', description: 'Users can no longer use this code.' });
      queryClient.invalidateQueries({ queryKey: ['founders-cities'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to pause promo',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  // Mutation: Resume promo code
  const resumePromo = useMutation({
    mutationFn: async (promoCodeId: string) => {
      const { data, error } = await supabase.functions.invoke('manage-founders-promo', {
        body: { action: 'resume_promo', promo_code_id: promoCodeId },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to resume promo');
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Promo code resumed', description: 'Code is now active again.' });
      queryClient.invalidateQueries({ queryKey: ['founders-cities'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to resume promo',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  // Mutation: Sync redemptions from Stripe
  const syncRedemptions = useMutation({
    mutationFn: async ({ promoCodeId, cityId }: { promoCodeId: string; cityId: string }) => {
      const { data, error } = await supabase.functions.invoke('manage-founders-promo', {
        body: { action: 'sync_redemptions', promo_code_id: promoCodeId, city_id: cityId },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to sync');
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Synced with Stripe', description: 'Redemption counts updated.' });
      queryClient.invalidateQueries({ queryKey: ['founders-cities'] });
    },
    onError: (error) => {
      toast({
        title: 'Sync failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  return {
    // Data
    cities: citiesQuery.data ?? [],
    redemptions: redemptionsQuery.data ?? [],
    aggregateStats,
    
    // Loading states
    isLoadingCities: citiesQuery.isLoading,
    isLoadingRedemptions: redemptionsQuery.isLoading,
    
    // Mutations
    getPromoStatus: getPromoStatus.mutateAsync,
    pausePromo: pausePromo.mutate,
    resumePromo: resumePromo.mutate,
    syncRedemptions: syncRedemptions.mutate,
    
    // Mutation states
    isPausing: pausePromo.isPending,
    isResuming: resumePromo.isPending,
    isSyncing: syncRedemptions.isPending,
    
    // Refetch
    refetchCities: citiesQuery.refetch,
    refetchRedemptions: redemptionsQuery.refetch,
  };
}
