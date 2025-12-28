import { useCoupleContext } from '@/contexts/CoupleContext';

// Re-export the hook from context for backward compatibility
export function useCouple() {
  return useCoupleContext();
}
