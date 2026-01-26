import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

interface EventSubscription {
  stripe_subscription_id: string;
  event_id?: string;
  current_period_end: string;
  status: string;
}

interface SubscriptionStatus {
  subscribed: boolean;
  has_pro: boolean;
  has_event_posting: boolean;
  event_subscriptions: EventSubscription[];
  plan: 'free' | 'pro';
  has_paid_tuning: boolean;
  product_id?: string;
  subscription_end?: string;
  is_founders?: boolean;
  founders_city_id?: string;
  is_ambassador?: boolean;
  error?: string;
}

const defaultSubscription: SubscriptionStatus = {
  subscribed: false,
  has_pro: false,
  has_event_posting: false,
  event_subscriptions: [],
  plan: 'free',
  has_paid_tuning: false,
  is_founders: false,
  is_ambassador: false,
};

/**
 * Hook to manage subscription status and checkout flow.
 * 
 * INVARIANT: Subscription status only gates paid tuning inputs and event posting.
 * Failures return free tier - never break recommendations.
 */
export function useSubscription() {
  const { user, session } = useAuth();
  const { couple } = useCouple();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin } = useUserRole();

  const { data: subscription, isLoading, refetch } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async (): Promise<SubscriptionStatus> => {
      if (!session?.access_token) {
        return defaultSubscription;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('[useSubscription] Error checking subscription:', error);
        return defaultSubscription;
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

  // Event posting checkout
  const createEventCheckout = useMutation({
    mutationFn: async (eventId: string) => {
      if (!session?.access_token) {
        throw new Error('Must be logged in to subscribe');
      }

      const { data, error } = await supabase.functions.invoke('create-event-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          event_id: eventId,
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
      console.error('[useSubscription] Event checkout error:', error);
      toast({
        title: 'Unable to start event checkout',
        description: error instanceof Error ? error.message : 'Please try again or contact support.',
        variant: 'destructive',
      });
    },
  });

  // Cancel event subscription
  const cancelEventSubscription = useMutation({
    mutationFn: async (subscriptionId: string) => {
      if (!session?.access_token) {
        throw new Error('Must be logged in');
      }

      const { data, error } = await supabase.functions.invoke('cancel-event-subscriptions', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          subscription_id: subscriptionId,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast({
        title: 'Event subscription canceled',
        description: 'Your event will remain visible until the end of the billing period.',
      });
    },
    onError: (error) => {
      console.error('[useSubscription] Cancel event subscription error:', error);
      toast({
        title: 'Unable to cancel subscription',
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
    subscription: subscription ?? defaultSubscription,
    isLoading,
    
    // Convenience accessors - admins get full access for testing/development
    hasPaidTuning: (subscription?.has_paid_tuning ?? false) || isAdmin,
    isPro: (subscription?.has_pro ?? false) || isAdmin,
    hasPro: (subscription?.has_pro ?? false) || isAdmin,
    hasEventPosting: (subscription?.has_event_posting ?? false) || isAdmin,
    eventSubscriptions: subscription?.event_subscriptions ?? [],
    isFounders: subscription?.is_founders ?? false,
    isAmbassador: subscription?.is_ambassador ?? false,
    foundersCityId: subscription?.founders_city_id,
    subscriptionEnd: subscription?.subscription_end,
    
    // Actions
    refetch,
    createCheckout: createCheckout.mutate,
    isCreatingCheckout: createCheckout.isPending,
    createFoundersCheckout: createFoundersCheckout.mutate,
    isCreatingFoundersCheckout: createFoundersCheckout.isPending,
    createEventCheckout: createEventCheckout.mutate,
    isCreatingEventCheckout: createEventCheckout.isPending,
    cancelEventSubscription: cancelEventSubscription.mutate,
    isCancelingEventSubscription: cancelEventSubscription.isPending,
    recordFoundersRedemption: recordFoundersRedemption.mutate,
    openCustomerPortal: openCustomerPortal.mutate,
    isOpeningPortal: openCustomerPortal.isPending,
  };
}
