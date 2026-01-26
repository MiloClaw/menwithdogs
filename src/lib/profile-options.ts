/**
 * Profile preference options - used for behavioral signal collection
 * These map to preference_definitions in the database for intelligence integration
 */

export interface ProfileOption {
  key: string;
  label: string;
}

// Section 2: Activities You Actually Do
export const ACTIVITY_OPTIONS: ProfileOption[] = [
  { key: 'walking_hiking', label: 'Walking / hiking' },
  { key: 'running', label: 'Running' },
  { key: 'gym_training', label: 'Gym / training' },
  { key: 'climbing', label: 'Climbing' },
  { key: 'swimming_water', label: 'Swimming / water' },
  { key: 'camping', label: 'Camping' },
  { key: 'casual_outdoor', label: 'Casual outdoor time' },
];

// Section 3: How You Usually Use Places
export const PLACE_USAGE_OPTIONS: ProfileOption[] = [
  { key: 'routine', label: 'Part of a routine' },
  { key: 'solo_time', label: 'Solo time' },
  { key: 'staying_active', label: 'Staying active' },
  { key: 'clearing_head', label: 'Clearing my head' },
  { key: 'light_social', label: 'Light social energy' },
  { key: 'group_activities', label: 'Group activities' },
];

// Section 4: When You Usually Go
export const TIMING_OPTIONS: ProfileOption[] = [
  { key: 'early_mornings', label: 'Early mornings' },
  { key: 'late_mornings', label: 'Late mornings' },
  { key: 'afternoons', label: 'Afternoons' },
  { key: 'evenings', label: 'Evenings' },
  { key: 'weekdays', label: 'Weekdays' },
  { key: 'weekends', label: 'Weekends' },
];

// Section 5: Openness (Private)
export const OPENNESS_OPTIONS: ProfileOption[] = [
  { key: 'keep_to_myself', label: 'I usually keep to myself' },
  { key: 'familiar_faces', label: "I'm comfortable with familiar faces" },
  { key: 'casual_conversation', label: "I'm open to casual conversation" },
  { key: 'open_to_meeting', label: "I'm open to meeting others through shared activities" },
  { key: 'with_partner_friends', label: "I'm usually out with a partner or friends" },
];

// Distance Preference (single-select) - affects proximity weighting
export const DISTANCE_OPTIONS: ProfileOption[] = [
  { key: 'close', label: 'Nearby (< 30 min)' },
  { key: 'medium', label: 'Worth the drive' },
  { key: 'far', label: 'Day trip distance' },
];

// Primary Time of Day (single-select) - feeds opening hours boost
export const TIME_OF_DAY_OPTIONS: ProfileOption[] = [
  { key: 'dawn', label: 'Dawn / Early' },
  { key: 'daytime', label: 'Daytime' },
  { key: 'golden_hour', label: 'Golden hour' },
  { key: 'flexible', label: 'Flexible' },
];

// Geographic Affinity (single-select) - affects exploration radius
export const GEO_AFFINITY_OPTIONS: ProfileOption[] = [
  { key: 'single_area', label: 'Mostly one area' },
  { key: 'few_areas', label: 'A few nearby areas' },
  { key: 'anywhere', label: 'Anywhere nearby' },
];

// ═══════════════════════════════════════════════════════════════════════
// PHASE 3: OUTDOOR DECISION-STYLE PREFERENCES
// ═══════════════════════════════════════════════════════════════════════

// Adventure Style (single-select) - comfort with remote vs. established
export const ADVENTURE_STYLE_OPTIONS: ProfileOption[] = [
  { key: 'well_marked', label: 'Stick to well-marked trails' },
  { key: 'mix_both', label: 'Mix of established and off-path' },
  { key: 'explore_remote', label: 'Seek out remote spots' },
];

// Trail Companions (single-select) - who users typically go with
export const TRAIL_COMPANIONS_OPTIONS: ProfileOption[] = [
  { key: 'solo', label: 'Usually solo' },
  { key: 'small_group', label: 'With 1-2 close friends' },
  { key: 'group', label: 'Larger groups / organized outings' },
  { key: 'mix', label: 'Depends on the day' },
];

// Effort Preference (single-select) - intensity level
export const EFFORT_PREFERENCE_OPTIONS: ProfileOption[] = [
  { key: 'easy', label: 'Easy / casual pace' },
  { key: 'moderate', label: 'Moderate challenge' },
  { key: 'strenuous', label: 'Push myself / strenuous' },
  { key: 'varies', label: 'Varies by mood' },
];

// Weather Flexibility (single-select) - willingness to go out in conditions
export const WEATHER_FLEXIBILITY_OPTIONS: ProfileOption[] = [
  { key: 'fair_only', label: 'Clear, fair conditions' },
  { key: 'light_weather', label: 'Light rain / overcast is fine' },
  { key: 'any_weather', label: 'I go out in almost anything' },
];

// Gear Readiness (single-select) - equipment level
export const GEAR_READINESS_OPTIONS: ProfileOption[] = [
  { key: 'casual', label: 'Basics only (day pack, sneakers)' },
  { key: 'equipped', label: 'Well-equipped (boots, layers)' },
  { key: 'ultralight', label: 'Dialed in (technical, ultralight)' },
];

// Nature Priorities (multi-select, max 2) - what matters most when choosing
export const NATURE_PRIORITIES_OPTIONS: ProfileOption[] = [
  { key: 'solitude', label: 'Solitude & quiet' },
  { key: 'scenery', label: 'Scenic beauty' },
  { key: 'wildlife', label: 'Wildlife / nature' },
  { key: 'accessibility', label: 'Easy access & parking' },
  { key: 'dog_friendly', label: 'Dog-friendly' },
  { key: 'water_access', label: 'Water access' },
];
