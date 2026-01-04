/**
 * Pure routing function for onboarding state machine.
 * Simplified to 3 states: no-couple, profile-pending, done.
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

export function getRouteForState(state: RouteState): string {
  const { hasCouple, memberStep } = state;

  // No couple yet = need to complete profile (which will auto-create couple)
  if (!hasCouple) {
    return '/onboarding/my-profile';
  }

  // Profile pending = still on MyProfile
  if (memberStep === 'profile_pending') {
    return '/onboarding/my-profile';
  }

  // All done = dashboard
  return '/dashboard';
}
