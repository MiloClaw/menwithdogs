/**
 * Controlled vocabulary for couple and member interests.
 * 
 * EVOLUTION PATH (Phase 4+):
 * - This will migrate to a database table with id, slug, display_name
 * - interests columns will become join tables (user_interests, couple_interests)
 * - This enables: ranking, weighting, ML/vector compatibility, analytics
 * 
 * For now, enforce via UI only. Schema uses text[] arrays.
 * Do NOT expose raw strings to users - always use INTEREST_OPTIONS.
 */

export interface Interest {
  id: string;
  label: string;
  category: 'social' | 'outdoor' | 'food' | 'culture' | 'wellness' | 'games';
}

export const INTEREST_OPTIONS: Interest[] = [
  // Social
  { id: 'dinner-parties', label: 'Dinner parties', category: 'social' },
  { id: 'game-nights', label: 'Game nights', category: 'social' },
  { id: 'double-dates', label: 'Double dates', category: 'social' },
  { id: 'happy-hours', label: 'Happy hours', category: 'social' },
  { id: 'book-clubs', label: 'Book clubs', category: 'social' },
  
  // Outdoor
  { id: 'hiking', label: 'Hiking', category: 'outdoor' },
  { id: 'biking', label: 'Biking', category: 'outdoor' },
  { id: 'camping', label: 'Camping', category: 'outdoor' },
  { id: 'beach-days', label: 'Beach days', category: 'outdoor' },
  { id: 'picnics', label: 'Picnics', category: 'outdoor' },
  
  // Food & Drink
  { id: 'trying-restaurants', label: 'Trying new restaurants', category: 'food' },
  { id: 'cooking-together', label: 'Cooking together', category: 'food' },
  { id: 'wine-tasting', label: 'Wine tasting', category: 'food' },
  { id: 'brewery-hopping', label: 'Brewery hopping', category: 'food' },
  { id: 'coffee-exploring', label: 'Coffee exploring', category: 'food' },
  
  // Culture
  { id: 'concerts', label: 'Concerts', category: 'culture' },
  { id: 'museums', label: 'Museums', category: 'culture' },
  { id: 'theater', label: 'Theater', category: 'culture' },
  { id: 'art-galleries', label: 'Art galleries', category: 'culture' },
  { id: 'live-comedy', label: 'Live comedy', category: 'culture' },
  
  // Wellness
  { id: 'yoga', label: 'Yoga', category: 'wellness' },
  { id: 'fitness-classes', label: 'Fitness classes', category: 'wellness' },
  { id: 'spa-days', label: 'Spa days', category: 'wellness' },
  { id: 'meditation', label: 'Meditation', category: 'wellness' },
  
  // Games & Activities
  { id: 'board-games', label: 'Board games', category: 'games' },
  { id: 'trivia-nights', label: 'Trivia nights', category: 'games' },
  { id: 'escape-rooms', label: 'Escape rooms', category: 'games' },
  { id: 'bowling', label: 'Bowling', category: 'games' },
  { id: 'mini-golf', label: 'Mini golf', category: 'games' },
];

export const INTEREST_CATEGORIES = [
  { id: 'social', label: 'Social' },
  { id: 'outdoor', label: 'Outdoor' },
  { id: 'food', label: 'Food & Drink' },
  { id: 'culture', label: 'Culture' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'games', label: 'Games & Activities' },
] as const;

/**
 * Get interest by ID
 */
export function getInterestById(id: string): Interest | undefined {
  return INTEREST_OPTIONS.find(i => i.id === id);
}

/**
 * Get interests by category
 */
export function getInterestsByCategory(category: Interest['category']): Interest[] {
  return INTEREST_OPTIONS.filter(i => i.category === category);
}

/**
 * Validate that all interest IDs are valid
 */
export function validateInterests(ids: string[]): boolean {
  return ids.every(id => INTEREST_OPTIONS.some(i => i.id === id));
}

/**
 * Get display labels for interest IDs
 */
export function getInterestLabels(ids: string[]): string[] {
  return ids
    .map(id => getInterestById(id)?.label)
    .filter((label): label is string => !!label);
}
