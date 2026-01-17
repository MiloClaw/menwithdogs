import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CreatePromoCodeParams {
  cityId: string;
  cityName: string;
  maxRedemptions?: number;
}

interface PromoCodeResult {
  success: boolean;
  promo_code?: string;
  promo_code_id?: string;
  max_redemptions?: number;
  error?: string;
}

/**
 * Hook for admin to create founders promo codes for cities.
 * Called when launching a city.
 */
export function useCityPromoCode() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPromoCode = useMutation({
    mutationFn: async ({ cityId, cityName, maxRedemptions = 100 }: CreatePromoCodeParams): Promise<PromoCodeResult> => {
      if (!session?.access_token) {
        throw new Error('Must be logged in as admin');
      }

      const { data, error } = await supabase.functions.invoke('create-city-promo-code', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          city_id: cityId,
          city_name: cityName,
          max_redemptions: maxRedemptions,
        },
      });

      if (error) throw error;
      return data as PromoCodeResult;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['city', variables.cityId] });
      
      if (data.promo_code) {
        toast({
          title: 'Founders promo code created',
          description: `Code: ${data.promo_code} (${data.max_redemptions} slots)`,
        });
      }
    },
    onError: (error) => {
      console.error('[useCityPromoCode] Error:', error);
      toast({
        title: 'Failed to create promo code',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    },
  });

  return {
    createPromoCode: createPromoCode.mutate,
    createPromoCodeAsync: createPromoCode.mutateAsync,
    isCreating: createPromoCode.isPending,
    error: createPromoCode.error,
  };
}
