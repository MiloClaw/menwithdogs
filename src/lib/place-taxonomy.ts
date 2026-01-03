// Editorial vibe tags for quality curation
// These help prevent "technically correct but vibes wrong" imports

export const VIBE_ENERGY_LABELS = [
  { value: 1, label: 'Quiet', description: 'Library-quiet, minimal interaction' },
  { value: 2, label: 'Calm', description: 'Low background noise, easy conversation' },
  { value: 3, label: 'Moderate', description: 'Normal ambient energy' },
  { value: 4, label: 'Lively', description: 'Active atmosphere, some noise' },
  { value: 5, label: 'High Energy', description: 'Loud, bustling, energetic' },
] as const;

export const VIBE_FORMALITY_LABELS = [
  { value: 1, label: 'Very Casual', description: 'Come as you are' },
  { value: 2, label: 'Casual', description: 'Relaxed dress code' },
  { value: 3, label: 'Smart Casual', description: 'Nice but not fancy' },
  { value: 4, label: 'Elevated', description: 'Dressy atmosphere' },
  { value: 5, label: 'Upscale', description: 'Fine dining / formal' },
] as const;

export const getVibeEnergyLabel = (value: number | null): string => {
  if (value === null) return 'Not set';
  return VIBE_ENERGY_LABELS.find(v => v.value === value)?.label || 'Unknown';
};

export const getVibeFormalityLabel = (value: number | null): string => {
  if (value === null) return 'Not set';
  return VIBE_FORMALITY_LABELS.find(v => v.value === value)?.label || 'Unknown';
};

// Check if any vibe tag is set for a place
export const hasVibeData = (place: {
  vibe_energy?: number | null;
  vibe_formality?: number | null;
  vibe_conversation?: boolean | null;
  vibe_daytime?: boolean | null;
  vibe_evening?: boolean | null;
}): boolean => {
  return (
    place.vibe_energy !== null && place.vibe_energy !== undefined ||
    place.vibe_formality !== null && place.vibe_formality !== undefined ||
    place.vibe_conversation !== null && place.vibe_conversation !== undefined ||
    place.vibe_daytime !== null && place.vibe_daytime !== undefined ||
    place.vibe_evening !== null && place.vibe_evening !== undefined
  );
};

// Suggested vibe values based on Google Place primary types
// These are non-destructive suggestions - only apply to empty/default fields
export interface VibeSuggestion {
  energy?: number;
  formality?: number;
  conversation?: boolean;
  daytime?: boolean;
  evening?: boolean;
}

// Mapping from google_primary_type to suggested vibes
// Based on typical characteristics of each venue type
const GOOGLE_TYPE_VIBE_MAP: Record<string, VibeSuggestion> = {
  // Quiet / Calm venues
  library: { energy: 1, formality: 2, conversation: false, daytime: true, evening: false },
  book_store: { energy: 1, formality: 2, conversation: true, daytime: true, evening: false },
  museum: { energy: 2, formality: 3, conversation: true, daytime: true, evening: false },
  art_gallery: { energy: 2, formality: 3, conversation: true, daytime: true, evening: true },
  spa: { energy: 1, formality: 3, conversation: false, daytime: true, evening: false },
  
  // Calm / Moderate venues
  cafe: { energy: 2, formality: 2, conversation: true, daytime: true, evening: false },
  coffee_shop: { energy: 2, formality: 1, conversation: true, daytime: true, evening: false },
  bakery: { energy: 2, formality: 1, conversation: true, daytime: true, evening: false },
  tea_house: { energy: 2, formality: 2, conversation: true, daytime: true, evening: false },
  
  // Moderate venues
  restaurant: { energy: 3, formality: 3, conversation: true, daytime: true, evening: true },
  american_restaurant: { energy: 3, formality: 2, conversation: true, daytime: true, evening: true },
  italian_restaurant: { energy: 3, formality: 3, conversation: true, daytime: false, evening: true },
  japanese_restaurant: { energy: 2, formality: 3, conversation: true, daytime: true, evening: true },
  mexican_restaurant: { energy: 3, formality: 2, conversation: true, daytime: true, evening: true },
  indian_restaurant: { energy: 3, formality: 2, conversation: true, daytime: true, evening: true },
  thai_restaurant: { energy: 3, formality: 2, conversation: true, daytime: true, evening: true },
  chinese_restaurant: { energy: 3, formality: 2, conversation: true, daytime: true, evening: true },
  korean_restaurant: { energy: 3, formality: 2, conversation: true, daytime: true, evening: true },
  vietnamese_restaurant: { energy: 2, formality: 2, conversation: true, daytime: true, evening: true },
  mediterranean_restaurant: { energy: 3, formality: 3, conversation: true, daytime: false, evening: true },
  french_restaurant: { energy: 2, formality: 4, conversation: true, daytime: false, evening: true },
  
  // Upscale dining
  fine_dining_restaurant: { energy: 2, formality: 5, conversation: true, daytime: false, evening: true },
  steak_house: { energy: 3, formality: 4, conversation: true, daytime: false, evening: true },
  
  // Casual dining
  fast_food_restaurant: { energy: 3, formality: 1, conversation: true, daytime: true, evening: true },
  pizza_restaurant: { energy: 3, formality: 1, conversation: true, daytime: true, evening: true },
  sandwich_shop: { energy: 2, formality: 1, conversation: true, daytime: true, evening: false },
  ice_cream_shop: { energy: 3, formality: 1, conversation: true, daytime: true, evening: true },
  
  // Bars & Nightlife
  bar: { energy: 4, formality: 2, conversation: true, daytime: false, evening: true },
  wine_bar: { energy: 3, formality: 3, conversation: true, daytime: false, evening: true },
  cocktail_bar: { energy: 3, formality: 4, conversation: true, daytime: false, evening: true },
  pub: { energy: 4, formality: 1, conversation: true, daytime: false, evening: true },
  brewery: { energy: 4, formality: 2, conversation: true, daytime: true, evening: true },
  night_club: { energy: 5, formality: 3, conversation: false, daytime: false, evening: true },
  karaoke: { energy: 5, formality: 1, conversation: false, daytime: false, evening: true },
  
  // Entertainment venues
  movie_theater: { energy: 2, formality: 2, conversation: false, daytime: true, evening: true },
  performing_arts_theater: { energy: 2, formality: 4, conversation: false, daytime: false, evening: true },
  concert_hall: { energy: 4, formality: 3, conversation: false, daytime: false, evening: true },
  comedy_club: { energy: 4, formality: 2, conversation: false, daytime: false, evening: true },
  live_music_venue: { energy: 5, formality: 2, conversation: false, daytime: false, evening: true },
  bowling_alley: { energy: 4, formality: 1, conversation: true, daytime: true, evening: true },
  amusement_park: { energy: 5, formality: 1, conversation: true, daytime: true, evening: true },
  
  // Fitness & Recreation
  gym: { energy: 4, formality: 1, conversation: false, daytime: true, evening: true },
  fitness_center: { energy: 4, formality: 1, conversation: false, daytime: true, evening: true },
  yoga_studio: { energy: 2, formality: 2, conversation: false, daytime: true, evening: true },
  
  // Outdoor spaces
  park: { energy: 2, formality: 1, conversation: true, daytime: true, evening: false },
  hiking_area: { energy: 3, formality: 1, conversation: true, daytime: true, evening: false },
  dog_park: { energy: 3, formality: 1, conversation: true, daytime: true, evening: false },
  garden: { energy: 1, formality: 2, conversation: true, daytime: true, evening: false },
  botanical_garden: { energy: 1, formality: 2, conversation: true, daytime: true, evening: false },
  beach: { energy: 3, formality: 1, conversation: true, daytime: true, evening: true },
  marina: { energy: 2, formality: 2, conversation: true, daytime: true, evening: true },
  
  // Cultural venues
  cultural_center: { energy: 2, formality: 3, conversation: true, daytime: true, evening: true },
  community_center: { energy: 3, formality: 1, conversation: true, daytime: true, evening: true },
  event_venue: { energy: 3, formality: 3, conversation: true, daytime: true, evening: true },
};

/**
 * Get suggested vibe values based on a Google Place primary type
 * Returns partial suggestions - only populated fields should be applied
 */
export const getVibeSuggestionFromGoogleType = (
  googlePrimaryType: string | null | undefined
): VibeSuggestion | null => {
  if (!googlePrimaryType) return null;
  
  // Direct match
  if (GOOGLE_TYPE_VIBE_MAP[googlePrimaryType]) {
    return GOOGLE_TYPE_VIBE_MAP[googlePrimaryType];
  }
  
  // Try to find partial matches (e.g., "french_restaurant" matches "restaurant")
  for (const [type, suggestion] of Object.entries(GOOGLE_TYPE_VIBE_MAP)) {
    if (googlePrimaryType.includes(type) || type.includes(googlePrimaryType)) {
      return suggestion;
    }
  }
  
  return null;
};
