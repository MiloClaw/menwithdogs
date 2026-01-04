/**
 * Pure routing function for onboarding state machine.
 * Behavior-first: Users go to /places immediately after auth.
 * Profile completion is optional, not a gate.
 */

export type CoupleStatus = 'onboarding' | 'pending_match' | 'active' | 'paused';
export type MemberOnboardingStep = 'profile_pending' | 'profile_complete';

interface RouteState {
  hasCouple: boolean;
  memberStep: MemberOnboardingStep | null;
  // Legacy fields kept for type compatibility but no longer used
  coupleStatus?: CoupleStatus | null;
  coupleIsComplete?: boolean;
  coupleIsConfirmed?: boolean;
}

/**
 * Behavior-first routing: always return /places
 * Profile completion is no longer a gate, just a preference
 */
export function getRouteForState(_state: RouteState): string {
  // All users go directly to places - behavior over profiles
  return '/places';
}
