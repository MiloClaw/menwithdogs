import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionStatus {
  subscribed: boolean;
  plan: 'free' | 'pro';
  has_paid_tuning: boolean;
  product_id?: string;
  subscription_end?: string;
  is_founders?: boolean;
  founders_city_id?: string;
  is_ambassador?: boolean;
  error?: string;
}

/**
 * Hook to manage subscription status and checkout flow.
 * 
 * INVARIANT: Subscription status only gates paid tuning inputs.
 * Failures return free tier - never break recommendations.
 */
export function useSubscription() {
  const { user, session } = useAuth();
  const { couple } = useCouple();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading, refetch } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async (): Promise<SubscriptionStatus> => {
      if (!session?.access_token) {
        return { subscribed: false, plan: 'free', has_paid_tuning: false, is_founders: false };
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('[useSubscription] Error checking subscription:', error);
        // Graceful degradation - return free tier on error
        return { subscribed: false, plan: 'free', has_paid_tuning: false, is_founders: false };
      }

      return data as SubscriptionStatus;
    },
    enabled: !!user && !!session,
    staleTime: 60 * 1000, // Check every minute
    refetchOnWindowFocus: true,
  });

  // Regular Pro checkout
  const createCheckout = useMutation({
    mutationFn: async () => {
      if (!session?.access_token) {
        throw new Error('Must be logged in to subscribe');
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          couple_id: couple?.id,
        },
      });

      if (error) throw error;
      return data as { url: string };
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      console.error('[useSubscription] Checkout error:', error);
      toast({
        title: 'Unable to start checkout',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    },
  });

  // Founders checkout with city-specific promo code
  const createFoundersCheckout = useMutation({
    mutationFn: async (cityId: string) => {
      if (!session?.access_token) {
        throw new Error('Must be logged in to subscribe');
      }

      const { data, error } = await supabase.functions.invoke('create-founders-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          city_id: cityId,
          couple_id: couple?.id,
        },
      });

      if (error) throw error;
      return data as { url: string };
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      console.error('[useSubscription] Founders checkout error:', error);
      toast({
        title: 'Unable to start founders checkout',
        description: error instanceof Error ? error.message : 'Please try again or contact support.',
        variant: 'destructive',
      });
    },
  });

  // Record founders redemption after successful checkout
  const recordFoundersRedemption = useMutation({
    mutationFn: async (cityId: string) => {
      if (!session?.access_token) {
        throw new Error('Must be logged in');
      }

      const { data, error } = await supabase.functions.invoke('record-founders-redemption', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          city_id: cityId,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['founders-offer'] });
    },
    onError: (error) => {
      console.error('[useSubscription] Record redemption error:', error);
      // Don't show toast - this is a background operation
    },
  });

  const openCustomerPortal = useMutation({
    mutationFn: async () => {
      if (!session?.access_token) {
        throw new Error('Must be logged in to manage subscription');
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return data as { url: string };
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      console.error('[useSubscription] Portal error:', error);
      toast({
        title: 'Unable to open subscription management',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    },
  });

  return {
    subscription: subscription ?? { subscribed: false, plan: 'free' as const, has_paid_tuning: false, is_founders: false, is_ambassador: false },
    isLoading,
    hasPaidTuning: subscription?.has_paid_tuning ?? false,
    isPro: subscription?.plan === 'pro',
    isFounders: subscription?.is_founders ?? false,
    isAmbassador: subscription?.is_ambassador ?? false,
    foundersCityId: subscription?.founders_city_id,
    subscriptionEnd: subscription?.subscription_end,
    refetch,
    createCheckout: createCheckout.mutate,
    isCreatingCheckout: createCheckout.isPending,
    createFoundersCheckout: createFoundersCheckout.mutate,
    isCreatingFoundersCheckout: createFoundersCheckout.isPending,
    recordFoundersRedemption: recordFoundersRedemption.mutate,
    openCustomerPortal: openCustomerPortal.mutate,
    isOpeningPortal: openCustomerPortal.isPending,
  };
}
