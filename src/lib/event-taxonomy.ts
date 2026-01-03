// Event Taxonomy Constants
// Canonical values for the event classification system

export const EVENT_TYPES = [
  { value: 'social', label: 'Social Gathering' },
  { value: 'cultural', label: 'Arts & Culture' },
  { value: 'food_drink', label: 'Food & Drink' },
  { value: 'fitness', label: 'Fitness & Wellness' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'community', label: 'Community' },
  { value: 'educational', label: 'Learning & Classes' },
  { value: 'outdoor', label: 'Outdoor & Adventure' },
  { value: 'seasonal', label: 'Seasonal & Holiday' },
  { value: 'special_interest', label: 'Special Interest' },
] as const;

export const EVENT_FORMATS = [
  { value: 'drop_in', label: 'Drop-in anytime' },
  { value: 'ticketed', label: 'Ticketed event' },
  { value: 'reservation_required', label: 'Reservation required' },
  { value: 'scheduled_program', label: 'Scheduled program' },
  { value: 'recurring', label: 'Recurring event' },
  { value: 'pop_up', label: 'Pop-up / Limited time' },
  { value: 'series', label: 'Part of a series' },
  { value: 'all_day', label: 'All-day event' },
] as const;

export const COST_TYPES = [
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid entry' },
  { value: 'optional_spend', label: 'Free entry, optional spend' },
  { value: 'unknown', label: 'Not specified' },
] as const;

export const SOCIAL_ENERGY_LABELS = [
  { value: 1, label: 'Quiet / Observational', description: 'Minimal interaction expected' },
  { value: 2, label: 'Low interaction', description: 'Some light conversation' },
  { value: 3, label: 'Balanced / Optional', description: 'Social but relaxed' },
  { value: 4, label: 'Social / Conversational', description: 'Active mingling expected' },
  { value: 5, label: 'High energy / Interactive', description: 'Very social atmosphere' },
] as const;

export const COMMITMENT_LABELS = [
  { value: 1, label: 'Casual drop-in', description: 'Come and go freely' },
  { value: 2, label: 'Light commitment', description: 'Show up on time preferred' },
  { value: 3, label: 'Planned attendance', description: 'Plan to stay for the event' },
  { value: 4, label: 'Significant commitment', description: 'Reserved spot, expect to stay' },
  { value: 5, label: 'High commitment', description: 'Full participation required' },
] as const;

export const CREATED_BY_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'partner', label: 'Partner' },
  { value: 'user', label: 'User' },
  { value: 'system', label: 'System' },
] as const;

// Type exports for use in components
export type EventType = typeof EVENT_TYPES[number]['value'];
export type EventFormat = typeof EVENT_FORMATS[number]['value'];
export type CostType = typeof COST_TYPES[number]['value'];
export type SocialEnergyLevel = typeof SOCIAL_ENERGY_LABELS[number]['value'];
export type CommitmentLevel = typeof COMMITMENT_LABELS[number]['value'];
export type CreatedByRole = typeof CREATED_BY_ROLES[number]['value'];

// Helper functions - accept string | number | null | undefined for flexibility with DB values
export function getEventTypeLabel(value: string | null | undefined): string {
  return EVENT_TYPES.find(t => t.value === value)?.label || 'Not specified';
}

export function getEventFormatLabel(value: string | null | undefined): string {
  return EVENT_FORMATS.find(f => f.value === value)?.label || 'Not specified';
}

export function getCostTypeLabel(value: string | null | undefined): string {
  return COST_TYPES.find(c => c.value === value)?.label || 'Not specified';
}

export function getSocialEnergyLabel(value: number | null | undefined): string {
  return SOCIAL_ENERGY_LABELS.find(s => s.value === value)?.label || 'Not specified';
}

export function getCommitmentLabel(value: number | null | undefined): string {
  return COMMITMENT_LABELS.find(c => c.value === value)?.label || 'Not specified';
}
