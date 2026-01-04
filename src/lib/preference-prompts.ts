/**
 * Preference prompt definitions for behavioral onboarding.
 * 
 * Prompts are triggered by real behavior, not shown upfront.
 * Each prompt captures a specific preference that helps rank places.
 */

export type PromptType = 'time' | 'distance' | 'vibe' | 'intent' | 'geo';

export interface PromptOption {
  value: string;
  label: string;
}

export interface PromptDefinition {
  type: PromptType;
  header: string;
  question: string;
  footer: string;
  multiSelect: boolean;
  options: PromptOption[];
}

// Time context - maps to opening hours
export const TIME_PROMPT: PromptDefinition = {
  type: 'time',
  header: 'Quick question',
  question: 'When should we usually prioritize suggestions?',
  footer: 'This only tailors the places you see.',
  multiSelect: false,
  options: [
    { value: 'mornings', label: 'Mornings' },
    { value: 'evenings', label: 'Evenings' },
    { value: 'weekends', label: 'Weekends' },
    { value: 'mixed', label: 'Show a mix' },
  ],
};

// Distance - maps to lat/lng weighting
export const DISTANCE_PROMPT: PromptDefinition = {
  type: 'distance',
  header: 'One more thing',
  question: 'How far do you usually go for a place you like?',
  footer: 'This only tailors the places you see.',
  multiSelect: false,
  options: [
    { value: 'close', label: 'Close by' },
    { value: 'medium', label: 'Up to ~15 min' },
    { value: 'far', label: "I'll travel if worth it" },
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
    { value: 'quiet', label: 'Quiet / low-key' },
    { value: 'balanced', label: 'Balanced' },
    { value: 'lively', label: 'Lively' },
    { value: 'depends', label: 'Depends' },
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
    { value: 'coffee', label: 'Coffee & calm' },
    { value: 'food_casual', label: 'Good food, casual' },
    { value: 'bars', label: 'Bars & lounges' },
    { value: 'special', label: 'Something special' },
    { value: 'fitness', label: 'Fitness & wellness' },
    { value: 'outdoors', label: 'Outdoors' },
    { value: 'culture', label: 'Culture & browsing' },
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
    { value: 'single_area', label: 'Mostly one area' },
    { value: 'few_areas', label: 'A few nearby areas' },
    { value: 'anywhere', label: 'Anywhere nearby' },
  ],
};

export const ALL_PROMPTS: PromptDefinition[] = [
  TIME_PROMPT,
  DISTANCE_PROMPT,
  VIBE_PROMPT,
  INTENT_PROMPT,
  GEO_PROMPT,
];

/**
 * Trigger conditions for each prompt type.
 * Prompts appear after meaningful behavior, not upfront.
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
  { type: 'time', minSaves: 1, minBrowses: 0, minSessions: 1 },
  { type: 'distance', minSaves: 2, minBrowses: 5, minSessions: 1 },
  { type: 'vibe', minSaves: 3, minBrowses: 0, minSessions: 1 },
  { type: 'intent', minSaves: 5, minBrowses: 0, minSessions: 2 },
  { type: 'geo', minSaves: 3, minBrowses: 10, minSessions: 2 },
];

export function getPromptDefinition(type: PromptType): PromptDefinition | undefined {
  return ALL_PROMPTS.find(p => p.type === type);
}
