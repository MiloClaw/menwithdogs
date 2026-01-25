/**
 * Preference prompt definitions for behavioral onboarding.
 * 
 * Prompts are triggered by real behavior, not shown upfront.
 * Each prompt captures a specific preference that helps rank places.
 * 
 * ARCHITECTURE:
 * - Phase 1 prompts: Context (time, distance, geo)
 * - Phase 2 prompts: Intent (what categories)
 * - Phase 3 prompts: Decision-style meta-preferences (HOW users choose)
 */

export type PromptType = 
  | 'time' | 'distance' | 'vibe' | 'intent' | 'geo'
  | 'choice_priority' | 'uncertainty' | 'return_pref' | 'sensory' | 'planning';

export interface PromptOption {
  value: string;
  label: string;
  icon?: string;
}

export interface PromptDefinition {
  type: PromptType;
  header: string;
  question: string;
  footer: string;
  multiSelect: boolean;
  maxSelections?: number; // For capped multi-select (e.g., "pick up to 2")
  options: PromptOption[];
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 1: CONTEXT PROMPTS
// ═══════════════════════════════════════════════════════════════════════

// Time context - maps to opening hours
export const TIME_PROMPT: PromptDefinition = {
  type: 'time',
  header: 'Quick question',
  question: 'When do you usually head out?',
  footer: 'Helps prioritize places for you.',
  multiSelect: false,
  options: [
    { value: 'dawn', label: 'Dawn / Early', icon: '🌅' },
    { value: 'daytime', label: 'Daytime', icon: '☀️' },
    { value: 'golden_hour', label: 'Golden hour', icon: '🌇' },
    { value: 'flexible', label: 'Flexible', icon: '🔀' },
  ],
};

// Distance - maps to lat/lng weighting
export const DISTANCE_PROMPT: PromptDefinition = {
  type: 'distance',
  header: 'One more thing',
  question: 'How far will you travel to get there?',
  footer: 'Helps prioritize places for you.',
  multiSelect: false,
  options: [
    { value: 'close', label: 'Nearby (< 30 min)', icon: '📍' },
    { value: 'medium', label: 'Worth the drive', icon: '🚗' },
    { value: 'far', label: 'Day trip distance', icon: '🗺️' },
  ],
};

// Vibe - maps to energy level
export const VIBE_PROMPT: PromptDefinition = {
  type: 'vibe',
  header: 'We noticed you saved a few places',
  question: 'Are you usually going for...',
  footer: 'This only tailors the places you see.',
  multiSelect: false,
  options: [
    { value: 'quiet', label: 'Quiet / low-key', icon: '🤫' },
    { value: 'balanced', label: 'Balanced', icon: '⚖️' },
    { value: 'lively', label: 'Lively', icon: '🎉' },
    { value: 'depends', label: 'Depends', icon: '🤷' },
  ],
};

// Intent - maps to place categories (multi-select)
export const INTENT_PROMPT: PromptDefinition = {
  type: 'intent',
  header: 'What are you usually looking for?',
  question: 'Select all that apply',
  footer: 'This helps us show more of what you like.',
  multiSelect: true,
  options: [
    { value: 'trails', label: 'Trails & hikes', icon: '🥾' },
    { value: 'campgrounds', label: 'Campgrounds', icon: '🏕️' },
    { value: 'water', label: 'Water spots', icon: '🏊' },
    { value: 'scenic', label: 'Scenic views', icon: '🌄' },
    { value: 'outdoor_fitness', label: 'Outdoor fitness', icon: '🏃' },
    { value: 'wildlife', label: 'Wildlife & nature', icon: '🦌' },
    { value: 'provisions', label: 'Local provisions', icon: '🍺' },
  ],
};

// Geographic affinity
export const GEO_PROMPT: PromptDefinition = {
  type: 'geo',
  header: 'One last thing',
  question: 'Do you mostly explore around one area, or all over?',
  footer: 'This only tailors the places you see.',
  multiSelect: false,
  options: [
    { value: 'single_area', label: 'Mostly one area', icon: '🎯' },
    { value: 'few_areas', label: 'A few nearby areas', icon: '🔄' },
    { value: 'anywhere', label: 'Anywhere nearby', icon: '🌐' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════
// PHASE 3: DECISION-STYLE META-PREFERENCES
// ═══════════════════════════════════════════════════════════════════════
// 
// These explain HOW users make decisions, not WHAT they want.
// They apply as soft multipliers only — never filters, never absolute.
// ═══════════════════════════════════════════════════════════════════════

// Choice Priority - what matters most when choosing (multi-select, max 2)
export const CHOICE_PRIORITY_PROMPT: PromptDefinition = {
  type: 'choice_priority',
  header: 'Quick question',
  question: 'When choosing a place, what matters most to you?',
  footer: 'Pick up to 2. Helps us surface the right places.',
  multiSelect: true,
  maxSelections: 2,
  options: [
    { value: 'convenience', label: 'Convenience & ease', icon: '⚡' },
    { value: 'atmosphere', label: 'Atmosphere & comfort', icon: '🛋️' },
    { value: 'quality', label: 'Quality & craft', icon: '✨' },
    { value: 'social_energy', label: 'Social energy', icon: '👥' },
    { value: 'familiarity', label: 'Familiarity / routine', icon: '🔁' },
    { value: 'novelty', label: 'Discovery & novelty', icon: '🗺️' },
  ],
};

// Uncertainty Tolerance - how user feels about new places
export const UNCERTAINTY_PROMPT: PromptDefinition = {
  type: 'uncertainty',
  header: 'One more thing',
  question: 'How do you usually feel about trying new places?',
  footer: 'Helps us balance familiar and new.',
  multiSelect: false,
  options: [
    { value: 'prefer_known', label: 'I prefer places I already know', icon: '🏠' },
    { value: 'mix_both', label: 'I mix familiar and new', icon: '⚖️' },
    { value: 'enjoy_new', label: 'I enjoy discovering new spots', icon: '🔍' },
  ],
};

// Return vs One-Off Preference
export const RETURN_PREF_PROMPT: PromptDefinition = {
  type: 'return_pref',
  header: 'What kind of places do you value more?',
  question: 'Think about what you usually look forward to.',
  footer: 'This helps us understand your style.',
  multiSelect: false,
  options: [
    { value: 'return_often', label: 'Places I return to often', icon: '🔄' },
    { value: 'one_off', label: 'Special occasion / one-off places', icon: '🎉' },
    { value: 'mix_both', label: 'A mix of both', icon: '⚖️' },
  ],
};

// Sensory Sensitivity - accessibility without labels
export const SENSORY_PROMPT: PromptDefinition = {
  type: 'sensory',
  header: 'Are there things that tend to make a place less enjoyable?',
  question: 'Select any that apply — or skip if none.',
  footer: 'Private. Never filters, only adjusts.',
  multiSelect: true,
  options: [
    { value: 'loud_music', label: 'Loud music', icon: '🔊' },
    { value: 'bright_lights', label: 'Bright lighting', icon: '💡' },
    { value: 'tight_spaces', label: 'Tight spaces', icon: '📦' },
    { value: 'long_waits', label: 'Long waits', icon: '⏳' },
    { value: 'crowds', label: 'Crowds', icon: '👥' },
  ],
};

// Planning Horizon - how far ahead user plans
export const PLANNING_PROMPT: PromptDefinition = {
  type: 'planning',
  header: 'How far ahead do you usually decide where to go?',
  question: 'Think about your typical planning style.',
  footer: 'Helps us with timing.',
  multiSelect: false,
  options: [
    { value: 'on_the_spot', label: 'On the spot', icon: '⚡' },
    { value: 'same_day', label: 'Same day', icon: '📅' },
    { value: 'few_days', label: 'A few days ahead', icon: '🗓️' },
    { value: 'routine', label: 'Part of a routine', icon: '🔁' },
  ],
};

export const ALL_PROMPTS: PromptDefinition[] = [
  // Phase 1: Context
  TIME_PROMPT,
  DISTANCE_PROMPT,
  VIBE_PROMPT,
  // Phase 2: Intent
  INTENT_PROMPT,
  GEO_PROMPT,
  // Phase 3: Decision-style
  CHOICE_PRIORITY_PROMPT,
  UNCERTAINTY_PROMPT,
  RETURN_PREF_PROMPT,
  SENSORY_PROMPT,
  PLANNING_PROMPT,
];

/**
 * Trigger conditions for each prompt type.
 * Prompts appear after meaningful behavior, not upfront.
 * 
 * Ordered by cognitive readiness - simpler prompts first,
 * deeper decision-style prompts after more engagement.
 */
export interface PromptTriggerCondition {
  type: PromptType;
  // Minimum saves to trigger this prompt
  minSaves: number;
  // Minimum browse count (places viewed)
  minBrowses: number;
  // Minimum sessions to trigger
  minSessions: number;
}

export const PROMPT_TRIGGERS: PromptTriggerCondition[] = [
  // Phase 1: Context prompts (early triggers)
  { type: 'time', minSaves: 1, minBrowses: 0, minSessions: 1 },
  { type: 'distance', minSaves: 2, minBrowses: 5, minSessions: 1 },
  // Phase 3: Vibe prompt disabled until vibe_energy data is available on places
  // { type: 'vibe', minSaves: 3, minBrowses: 0, minSessions: 1 },
  
  // Phase 2: Intent prompts
  { type: 'intent', minSaves: 5, minBrowses: 0, minSessions: 2 },
  { type: 'geo', minSaves: 3, minBrowses: 10, minSessions: 2 },
  
  // Phase 3: Decision-style prompts (higher thresholds)
  { type: 'uncertainty', minSaves: 4, minBrowses: 10, minSessions: 2 },
  { type: 'choice_priority', minSaves: 5, minBrowses: 15, minSessions: 3 },
  { type: 'return_pref', minSaves: 6, minBrowses: 20, minSessions: 3 },
  { type: 'planning', minSaves: 7, minBrowses: 20, minSessions: 3 },
  { type: 'sensory', minSaves: 8, minBrowses: 25, minSessions: 4 },
];

export function getPromptDefinition(type: PromptType): PromptDefinition | undefined {
  return ALL_PROMPTS.find(p => p.type === type);
}
