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
