/**
 * Venue Type → Event Taxonomy Suggestions
 * 
 * Maps Google Place types to suggested event taxonomy defaults.
 * These are NON-DESTRUCTIVE suggestions - only applied if form fields are at defaults.
 * Admins can always override.
 */

export interface EventTaxonomySuggestion {
  event_type?: string;
  social_energy_level?: number;
  cost_type?: string;
}

/**
 * Mapping from google_primary_type to suggested event taxonomy.
 * Keep this lightweight - only include types where we have confident suggestions.
 */
export const VENUE_TYPE_SUGGESTIONS: Record<string, EventTaxonomySuggestion> = {
  // Food & Drink venues
  restaurant: { event_type: 'food_drink', social_energy_level: 3 },
  cafe: { event_type: 'social', social_energy_level: 2 },
  coffee_shop: { event_type: 'social', social_energy_level: 2 },
  bar: { event_type: 'social', social_energy_level: 4 },
  night_club: { event_type: 'entertainment', social_energy_level: 5 },
  pub: { event_type: 'social', social_energy_level: 4 },
  wine_bar: { event_type: 'food_drink', social_energy_level: 3 },
  brewery: { event_type: 'food_drink', social_energy_level: 3 },
  
  // Arts & Culture
  museum: { event_type: 'cultural', social_energy_level: 2 },
  art_gallery: { event_type: 'cultural', social_energy_level: 2 },
  performing_arts_theater: { event_type: 'cultural', social_energy_level: 2 },
  concert_hall: { event_type: 'entertainment', social_energy_level: 4 },
  movie_theater: { event_type: 'entertainment', social_energy_level: 1 },
  
  // Entertainment
  bowling_alley: { event_type: 'entertainment', social_energy_level: 4 },
  amusement_park: { event_type: 'entertainment', social_energy_level: 5 },
  casino: { event_type: 'entertainment', social_energy_level: 4 },
  comedy_club: { event_type: 'entertainment', social_energy_level: 4 },
  karaoke: { event_type: 'entertainment', social_energy_level: 5 },
  
  // Fitness & Wellness
  gym: { event_type: 'fitness', social_energy_level: 3 },
  yoga_studio: { event_type: 'fitness', social_energy_level: 2 },
  spa: { event_type: 'fitness', social_energy_level: 1 },
  swimming_pool: { event_type: 'fitness', social_energy_level: 3 },
  fitness_center: { event_type: 'fitness', social_energy_level: 3 },
  
  // Outdoor
  park: { event_type: 'outdoor', social_energy_level: 3 },
  hiking_area: { event_type: 'outdoor', social_energy_level: 3 },
  garden: { event_type: 'outdoor', social_energy_level: 2 },
  campground: { event_type: 'outdoor', social_energy_level: 3 },
  beach: { event_type: 'outdoor', social_energy_level: 3 },
  
  // Learning
  library: { event_type: 'educational', social_energy_level: 1 },
  book_store: { event_type: 'educational', social_energy_level: 2 },
  school: { event_type: 'educational', social_energy_level: 3 },
  
  // Community
  community_center: { event_type: 'community', social_energy_level: 3 },
  place_of_worship: { event_type: 'community', social_energy_level: 2 },
  
  // Sports venues
  stadium: { event_type: 'entertainment', social_energy_level: 5 },
  sports_club: { event_type: 'fitness', social_energy_level: 4 },
  golf_course: { event_type: 'outdoor', social_energy_level: 2 },
} as const;

/**
 * Get suggested event taxonomy for a venue type.
 * Returns undefined if no mapping exists.
 */
export function getVenueTaxonomySuggestions(
  googlePrimaryType: string | null | undefined
): EventTaxonomySuggestion | undefined {
  if (!googlePrimaryType) return undefined;
  return VENUE_TYPE_SUGGESTIONS[googlePrimaryType];
}

/**
 * Check if a form value is at its default (empty or default slider value).
 * Used to determine if we should apply suggestions.
 */
export function isFieldAtDefault(
  fieldName: keyof EventTaxonomySuggestion,
  value: string | number | null | undefined,
  defaultValues: { social_energy_level: number; cost_type: string }
): boolean {
  switch (fieldName) {
    case 'event_type':
      return !value || value === '';
    case 'social_energy_level':
      return value === defaultValues.social_energy_level || value === null || value === undefined;
    case 'cost_type':
      return value === defaultValues.cost_type || value === 'unknown' || !value;
    default:
      return true;
  }
}
