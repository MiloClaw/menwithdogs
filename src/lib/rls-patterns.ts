/**
 * RLS PATTERN RULES (Non-Negotiable)
 * ===================================
 * 
 * Rule 1: RLS enforces access. Application logic enforces product state.
 *         Never mix the two.
 * 
 * Rule 2: No UX routing based on row existence.
 *         Only enums and explicit states.
 * 
 * Rule 3: INSERTs are blind. SELECTs require earned visibility.
 *         Always establish the relationship first.
 * 
 * Rule 4: One concept = one source of truth.
 *         If eligibility depends on three booleans, you've already lost.
 * 
 * ---
 * 
 * Member state = what I have done.
 * Couple state = what we are ready for.
 * 
 * ---
 * 
 * Pattern for creating linked records (e.g., couples + member_profiles):
 * 
 * 1. INSERT parent row (couples) - get only ID back
 * 2. INSERT child row (member_profiles) linking user to parent
 * 3. NOW user has RLS read rights via the link
 * 4. SELECT parent row with full data
 * 
 * Never SELECT a row you just created unless the user already has read rights.
 */

export const RLS_PATTERNS = {
  // This file exists for documentation and team alignment.
  // Reference in PR reviews.
} as const;
