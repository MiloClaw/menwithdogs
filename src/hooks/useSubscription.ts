import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

interface SubscriptionStatus {
  subscribed: boolean;
  has_pro: boolean;
  plan: 'free' | 'pro';
  has_paid_tuning: boolean;
  product_id?: string;
  subscription_end?: string;
  is_ambassador?: boolean;
  error?: string;
}

const defaultSubscription: SubscriptionStatus = {
  subscribed: false,
  has_pro: false,
  plan: 'free',
  has_paid_tuning: false,
  is_ambassador: false,
};

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
    isAmbassador: subscription?.is_ambassador ?? false,
    subscriptionEnd: subscription?.subscription_end,
    
    // Actions
    refetch,
    createCheckout: createCheckout.mutate,
    isCreatingCheckout: createCheckout.isPending,
    openCustomerPortal: openCustomerPortal.mutate,
    isOpeningPortal: openCustomerPortal.isPending,
  };
}
