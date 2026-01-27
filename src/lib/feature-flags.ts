/**
 * Feature flags for the directory rebuild
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * ██████╗ ██████╗ ██╗███████╗████████╗      ██╗      ██████╗  ██████╗██╗  ██╗
 * ██╔══██╗██╔══██╗██║██╔════╝╚══██╔══╝      ██║     ██╔═══██╗██╔════╝██║ ██╔╝
 * ██║  ██║██████╔╝██║█████╗     ██║   █████╗██║     ██║   ██║██║     █████╔╝ 
 * ██║  ██║██╔══██╗██║██╔══╝     ██║   ╚════╝██║     ██║   ██║██║     ██╔═██╗ 
 * ██████╔╝██║  ██║██║██║        ██║         ███████╗╚██████╔╝╚██████╗██║  ██╗
 * ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝        ╚═╝         ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * WARNING: THESE FLAGS ARE PERMANENTLY DISABLED
 * 
 * Reference: MATCH APP — CANONICAL INSTRUCTIONS (DRIFT-LOCKED)
 * 
 * Enabling any social feature requires EXPLICIT product and legal review.
 * These constraints exist to prevent the product from drifting into:
 * - Social network mechanics
 * - Profile discovery systems  
 * - Matching engines
 * - Feed-based experiences
 * 
 * The product is a PLACE-CENTRIC INTELLIGENCE PLATFORM, not a social app.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export const FEATURE_FLAGS = {
  /**
   * PERMANENTLY DISABLED
   * 
   * Violates:
   * - Rule 8: Social features must be place-gated and temporary
   * - Rule 11: No social-network mechanics
   * 
   * Presence mechanics imply user-to-user visibility which contradicts
   * the private, place-centric recommendation model.
   */
  PRESENCE_ENABLED: false,
  
  /**
   * PERMANENTLY DISABLED
   * 
   * Violates:
   * - Rule 2: No profile discovery
   * - Rule 11: No user search or browsing
   * 
   * "Open to hello" creates social-app dynamics where users present
   * themselves to others. This contradicts the system-training model.
   */
  OPEN_TO_HELLO_ENABLED: false,
  
  /**
   * PERMANENTLY DISABLED
   * 
   * Violates:
   * - Rule 2: No public profile exposure
   * - Rule 8: No persistent profile visibility
   * 
   * Mutual photo reveal creates dating-app mechanics and implies
   * users are presenting themselves, not training the system.
   */
  REVEAL_ENABLED: false,
  
  /**
   * PERMANENTLY DISABLED
   * 
   * Violates:
   * - Rule 11: No DM-first social mechanics
   * - Rule 1: This product is NOT a messaging-first product
   * 
   * Chat functionality would transform this into a social/dating app.
   * The product surfaces places, not conversations.
   */
  CHAT_ENABLED: false,
  
  /**
   * ENABLED — Admin-only tag application via place_niche_tags
   * 
   * Controls admin ability to apply curated tags to places.
   * Tags are displayed in the directory as "Community tagged".
   * User suggestions are reviewed by admins before application.
   */
  NICHE_TAGS_ENABLED: true,
  
  /**
   * DEPRECATED — Replaced by admin-moderated flow
   * 
   * The k-anonymity aggregation model is deprecated in favor of
   * direct admin approval of community tag suggestions.
   * This flag controls legacy tag_signals aggregation.
   */
  COMMUNITY_TAGS_ENABLED: false,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * DECISION TEST (from canonical instructions):
 * 
 * Before enabling ANY of these flags, answer these questions:
 * 1. Does this strengthen place-based recommendations? 
 * 2. Does this preserve user privacy and intent?
 * 3. Can this be removed or rebuilt safely?
 * 4. Does this avoid social-network mechanics?
 * 5. Does this keep AI invisible?
 * 
 * If ANY answer is "no" → DO NOT ENABLE.
 */
