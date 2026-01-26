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
  | 'adventure_style' | 'trail_companions' | 'effort_preference' 
  | 'weather_flexibility' | 'gear_readiness' | 'nature_priorities';

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
    { value: 'dawn', label: 'Dawn / Early', icon: 'Sunrise' },
    { value: 'daytime', label: 'Daytime', icon: 'Sun' },
    { value: 'golden_hour', label: 'Golden hour', icon: 'Sunset' },
    { value: 'flexible', label: 'Flexible', icon: 'Shuffle' },
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
    { value: 'close', label: 'Nearby (< 30 min)', icon: 'MapPin' },
    { value: 'medium', label: 'Worth the drive', icon: 'Car' },
    { value: 'far', label: 'Day trip distance', icon: 'Map' },
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
    { value: 'quiet', label: 'Quiet / low-key', icon: 'Volume' },
    { value: 'balanced', label: 'Balanced', icon: 'Scale' },
    { value: 'lively', label: 'Lively', icon: 'PartyPopper' },
    { value: 'depends', label: 'Depends', icon: 'HelpCircle' },
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
    { value: 'trails', label: 'Trails & hikes', icon: 'Mountain' },
    { value: 'campgrounds', label: 'Campgrounds', icon: 'Tent' },
    { value: 'water', label: 'Water spots', icon: 'Waves' },
    { value: 'scenic', label: 'Scenic views', icon: 'Sunrise' },
    { value: 'outdoor_fitness', label: 'Outdoor fitness', icon: 'HeartPulse' },
    { value: 'wildlife', label: 'Wildlife & nature', icon: 'TreeDeciduous' },
    { value: 'provisions', label: 'Local provisions', icon: 'Store' },
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
    { value: 'single_area', label: 'Mostly one area', icon: 'Target' },
    { value: 'few_areas', label: 'A few nearby areas', icon: 'RefreshCw' },
    { value: 'anywhere', label: 'Anywhere nearby', icon: 'Globe' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════
// PHASE 3: OUTDOOR DECISION-STYLE PREFERENCES
// ═══════════════════════════════════════════════════════════════════════
// 
// These explain HOW outdoor enthusiasts make decisions, not what they want.
// They apply as soft multipliers only — never filters, never absolute.
// ═══════════════════════════════════════════════════════════════════════

// Adventure Style - comfort with remote vs. established trails
export const ADVENTURE_STYLE_PROMPT: PromptDefinition = {
  type: 'adventure_style',
  header: 'Quick question',
  question: "When you head outdoors, what's your usual approach?",
  footer: 'Helps us match your comfort level.',
  multiSelect: false,
  options: [
    { value: 'well_marked', label: 'Stick to well-marked trails', icon: 'MapPin' },
    { value: 'mix_both', label: 'Mix of established and off-path', icon: 'Compass' },
    { value: 'explore_remote', label: 'Seek out remote spots', icon: 'Map' },
  ],
};

// Trail Companions - who users typically go with
export const TRAIL_COMPANIONS_PROMPT: PromptDefinition = {
  type: 'trail_companions',
  header: 'One more thing',
  question: 'Who do you usually go outdoors with?',
  footer: 'Private — just for better suggestions.',
  multiSelect: false,
  options: [
    { value: 'solo', label: 'Usually solo', icon: 'User' },
    { value: 'small_group', label: 'With 1-2 close friends', icon: 'Users' },
    { value: 'group', label: 'Larger groups / organized outings', icon: 'UsersRound' },
    { value: 'mix', label: 'Depends on the day', icon: 'Shuffle' },
  ],
};

// Effort Preference - intensity level
export const EFFORT_PREFERENCE_PROMPT: PromptDefinition = {
  type: 'effort_preference',
  header: 'What kind of effort feels right?',
  question: 'Think about your typical outings.',
  footer: 'Helps us match difficulty levels.',
  multiSelect: false,
  options: [
    { value: 'easy', label: 'Easy / casual pace', icon: 'Footprints' },
    { value: 'moderate', label: 'Moderate challenge', icon: 'TrendingUp' },
    { value: 'strenuous', label: 'Push myself / strenuous', icon: 'Mountain' },
    { value: 'varies', label: 'Varies by mood', icon: 'Shuffle' },
  ],
};

// Weather Flexibility - willingness to go out in various conditions
export const WEATHER_FLEXIBILITY_PROMPT: PromptDefinition = {
  type: 'weather_flexibility',
  header: 'How do you feel about weather?',
  question: 'When conditions are less than ideal...',
  footer: "We'll note conditions when relevant.",
  multiSelect: false,
  options: [
    { value: 'fair_only', label: 'Clear, fair conditions', icon: 'Sun' },
    { value: 'light_weather', label: 'Light rain / overcast is fine', icon: 'CloudSun' },
    { value: 'any_weather', label: 'I go out in almost anything', icon: 'CloudRain' },
  ],
};

// Gear Readiness - equipment level
export const GEAR_READINESS_PROMPT: PromptDefinition = {
  type: 'gear_readiness',
  header: 'How equipped are you?',
  question: 'Think about your outdoor gear.',
  footer: 'Helps us suggest appropriate spots.',
  multiSelect: false,
  options: [
    { value: 'casual', label: 'Basics only (day pack, sneakers)', icon: 'Backpack' },
    { value: 'equipped', label: 'Well-equipped (boots, layers)', icon: 'ShoppingBag' },
    { value: 'ultralight', label: 'Dialed in (technical, ultralight)', icon: 'Gem' },
  ],
};

// Nature Priorities - what matters most when choosing a spot (multi-select, max 2)
export const NATURE_PRIORITIES_PROMPT: PromptDefinition = {
  type: 'nature_priorities',
  header: 'When picking a spot...',
  question: 'What matters most to you?',
  footer: 'Pick up to 2. Shapes what we surface.',
  multiSelect: true,
  maxSelections: 2,
  options: [
    { value: 'solitude', label: 'Solitude & quiet', icon: 'TreePine' },
    { value: 'scenery', label: 'Scenic beauty', icon: 'Sunrise' },
    { value: 'wildlife', label: 'Wildlife / nature', icon: 'Bird' },
    { value: 'accessibility', label: 'Easy access & parking', icon: 'ParkingCircle' },
    { value: 'dog_friendly', label: 'Dog-friendly', icon: 'Dog' },
    { value: 'water_access', label: 'Water access', icon: 'Waves' },
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
  // Phase 3: Outdoor Decision-style
  ADVENTURE_STYLE_PROMPT,
  TRAIL_COMPANIONS_PROMPT,
  EFFORT_PREFERENCE_PROMPT,
  WEATHER_FLEXIBILITY_PROMPT,
  GEAR_READINESS_PROMPT,
  NATURE_PRIORITIES_PROMPT,
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
  
  // Phase 3: Outdoor decision-style prompts (higher thresholds)
  { type: 'adventure_style', minSaves: 4, minBrowses: 10, minSessions: 2 },
  { type: 'trail_companions', minSaves: 5, minBrowses: 15, minSessions: 3 },
  { type: 'effort_preference', minSaves: 6, minBrowses: 15, minSessions: 3 },
  { type: 'weather_flexibility', minSaves: 7, minBrowses: 20, minSessions: 3 },
  { type: 'gear_readiness', minSaves: 8, minBrowses: 20, minSessions: 3 },
  { type: 'nature_priorities', minSaves: 10, minBrowses: 25, minSessions: 4 },
];

export function getPromptDefinition(type: PromptType): PromptDefinition | undefined {
  return ALL_PROMPTS.find(p => p.type === type);
}
