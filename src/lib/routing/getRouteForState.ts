/**
 * Pure routing function for onboarding state machine.
 * No side effects - testable, callable from anywhere.
 * 
 * Member state = what I have done.
 * Couple state = what we are ready for.
 */

export type CoupleStatus = 'onboarding' | 'pending_match' | 'active' | 'paused';
export type MemberOnboardingStep = 'profile_pending' | 'profile_complete';

interface RouteState {
  hasCouple: boolean;
  coupleStatus: CoupleStatus | null;
  memberStep: MemberOnboardingStep | null;
  coupleIsComplete: boolean;
}

export function getRouteForState(state: RouteState): string {
  const { hasCouple, memberStep, coupleStatus, coupleIsComplete } = state;

  // No couple yet - create one
  if (!hasCouple) {
    return '/onboarding/create-couple';
  }

  // Member profile incomplete
  if (memberStep === 'profile_pending') {
    return '/onboarding/my-profile';
  }

  // Member done, but couple still onboarding
  if (coupleStatus === 'onboarding') {
    // If partner hasn't joined yet, show invite
    if (!coupleIsComplete) {
      return '/onboarding/invite-partner';
    }
    // Both joined, complete couple profile
    return '/onboarding/couple-profile';
  }

  // Couple in pending_match state - show holding view
  if (coupleStatus === 'pending_match') {
    return '/pending-match';
  }

  // Active or paused = dashboard
  return '/dashboard';
}
