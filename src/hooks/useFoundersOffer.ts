import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PRICING } from '@/lib/founders-pricing';

interface FoundersOfferStatus {
  isAvailable: boolean;
  slotsRemaining: number;
  slotsTotal: number;
  promoCode: string | null;
  cityName: string | null;
  hasAlreadyClaimed: boolean;
}

/**
 * Hook to check founders offer availability for a specific city.
 * 
 * Returns offer status including slots remaining and whether
 * the current user has already claimed.
 */
export function useFoundersOffer(cityId: string | null) {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['founders-offer', cityId, user?.id],
    queryFn: async (): Promise<FoundersOfferStatus> => {
      if (!cityId) {
        return {
          isAvailable: false,
          slotsRemaining: 0,
          slotsTotal: 0,
          promoCode: null,
          cityName: null,
          hasAlreadyClaimed: false,
        };
      }

      // Get city's founders info
      const { data: city, error: cityError } = await supabase
        .from('cities')
        .select('name, founders_promo_code, founders_promo_code_id, founders_slots_total, founders_slots_used')
        .eq('id', cityId)
        .eq('status', 'launched')
        .single();

      if (cityError || !city) {
        return {
          isAvailable: false,
          slotsRemaining: 0,
          slotsTotal: 0,
          promoCode: null,
          cityName: null,
          hasAlreadyClaimed: false,
        };
      }

      const slotsTotal = city.founders_slots_total ?? PRICING.FOUNDERS.SLOTS_PER_CITY;
      const slotsUsed = city.founders_slots_used ?? 0;
      const slotsRemaining = Math.max(0, slotsTotal - slotsUsed);
      
      // Check if offer is available (has promo code and slots)
      const hasOffer = !!city.founders_promo_code_id && slotsRemaining > 0;

      // Check if user has already claimed (if logged in)
      let hasAlreadyClaimed = false;
      if (user?.id) {
        const { data: redemption } = await supabase
          .from('founders_redemptions')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        hasAlreadyClaimed = !!redemption;
      }

      return {
        isAvailable: hasOffer && !hasAlreadyClaimed,
        slotsRemaining,
        slotsTotal,
        promoCode: city.founders_promo_code,
        cityName: city.name,
        hasAlreadyClaimed,
      };
    },
    enabled: !!cityId,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    ...data ?? {
      isAvailable: false,
      slotsRemaining: 0,
      slotsTotal: 0,
      promoCode: null,
      cityName: null,
      hasAlreadyClaimed: false,
    },
    isLoading,
    error,
    refetch,
  };
}
