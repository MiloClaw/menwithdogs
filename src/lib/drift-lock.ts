/**
 * ═══════════════════════════════════════════════════════════════════════
 * DRIFT-LOCK: FORBIDDEN COLUMNS AND PATTERNS
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * This file documents columns and patterns that MUST NOT be used in new code.
 * Violation of these rules is a PR-blocking issue per the product thesis.
 * 
 * FORBIDDEN DATABASE COLUMNS:
 * - couples.about_us
 * - couples.profile_photo_url
 * - couples.preferred_meetup_times
 * - member_profiles.social_settings
 * - events.social_energy_level
 * 
 * FORBIDDEN PATTERNS:
 * - User-to-user discovery or search
 * - Profile completeness scores or gamification
 * - Public-facing bios, essays, or self-presentation
 * - Follower/friend mechanics
 * - Visibility based on popularity
 * - Any feature resembling a social network
 * - DM-first social mechanics
 * - Social graphs
 * - Compatibility scores between users
 * 
 * RATIONALE:
 * This product is a place-centric intelligence platform, NOT a social network.
 * The "profile" exists only to train the recommendation engine, never to
 * present users to each other. All features must resolve back to Places and
 * Events, not people.
 * 
 * Reference: Product Thesis, Rules 2, 3, and 10
 * 
 * DECISION TEST (Apply before any feature or schema change):
 * 1. Does this strengthen place-based recommendations?
 * 2. Does this respect user privacy and intent?
 * 3. Can this be rebuilt or removed safely?
 * 4. Does this avoid social-network dynamics?
 * 5. Does this keep AI invisible?
 * 
 * If "no" to any of these, do not ship it.
 * ═══════════════════════════════════════════════════════════════════════
 */

export const DRIFT_LOCK = {
  /**
   * Database columns that are deprecated and MUST NOT be used.
   * Any new usage is a PR-blocking violation.
   */
  DEPRECATED_COLUMNS: [
    'couples.about_us',
    'couples.profile_photo_url',
    'couples.preferred_meetup_times',
    'member_profiles.social_settings',
    'events.social_energy_level',
  ],
  
  /**
   * @deprecated Legacy paid tuning signal types.
   * Frontend no longer emits these. SQL may still consume for backward compatibility.
   * Plan: Remove SQL consumption after confirming no active users rely on them.
   */
  LEGACY_PAID_SIGNAL_TYPES: [
    'context_self_selected',
    'activity_pattern',
    'interest_cluster',
    'environment_preference',
  ],
  
  /**
   * @deprecated Transitional Pro signal type.
   * May exist in older sessions. Not currently emitted by frontend.
   * Retained for rollback safety. Safe to remove once migration confirmed.
   */
  LEGACY_PRO_CONTEXT: [
    'pro_context',
  ],
  
  /**
   * Signal types that receive recency decay in affinity calculation.
   * Only behavioral signals that represent temporary interest patterns.
   */
  DECAY_ELIGIBLE_SIGNALS: [
    'view_place',
    'view_event',
    'view_blog_post',
    'click_external',
    'filter_category',
  ],
  
  /**
   * Signal types that should NOT receive decay.
   * These represent stable preferences or current state.
   */
  NO_DECAY_SIGNALS: [
    'explicit_preference',
    'save_place',      // Audit trail only; affinity uses current-state joins
    'save_event',      // Audit trail only; affinity uses current-state joins
    'unsave_place',    // Audit trail only; negation via current-state
    'unsave_event',    // Audit trail only; negation via current-state
  ],
  
  /**
   * Active Pro Settings signal types (emitted from 4-step Pro Settings flow).
   * Subject to 180-day decay. Gated by influence_mode at interpretation.
   */
  PRO_SELECTION_SIGNALS: [
    'pro_selection',
  ],
} as const;
