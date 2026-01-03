/**
 * Feature flags for the directory rebuild
 * These control progressive rollout of new features
 */
export const FEATURE_FLAGS = {
  // Enable presence controls (interested, planning, open_to_hello)
  PRESENCE_ENABLED: false,
  
  // Enable the "open to hello" status option
  OPEN_TO_HELLO_ENABLED: false,
  
  // Enable mutual photo reveal for couples
  REVEAL_ENABLED: false,
  
  // Enable chat functionality (future phase)
  CHAT_ENABLED: false,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;
