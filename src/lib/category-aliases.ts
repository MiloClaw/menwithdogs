/**
 * PHASE 1: Intent-to-Category Mapping
 * 
 * Maps INTENT_PROMPT values from preference-prompts.ts to actual 
 * primary_category strings in the places table.
 * 
 * This is the bridge between explicit user preferences and place ranking.
 * These values MUST match the maps_to_primary_categories in preference_definitions table.
 * 
 * IMPORTANT: Keep this in sync with the database preference_definitions table.
 */

export const INTENT_TO_CATEGORIES: Record<string, string[]> = {
  // Coffee & Cafes
  coffee: ['Coffee shop', 'Cafe', 'Donut shop', 'Bakery', 'Chocolate shop'],
  
  // Food Exploration (casual dining)
  food_casual: [
    'Restaurant', 
    'American restaurant', 
    'Mexican restaurant', 
    'Breakfast restaurant', 
    'Brunch restaurant', 
    'Hamburger restaurant', 
    'Thai restaurant', 
    'Vietnamese restaurant', 
    'Japanese restaurant', 
    'Sushi restaurant', 
    'Seafood restaurant', 
    'Italian restaurant',
    'Dessert restaurant',
  ],
  
  // Bars & Nightlife
  bars: ['Bar', 'Pub'],
  
  // Special Occasions
  special: ['Performing arts theater', 'Botanical garden', 'Museum', 'Zoo'],
  
  // Fitness & Wellness
  fitness: ['Sports activity location', 'Health'],
  
  // Outdoors & Nature
  outdoors: ['Park', 'Botanical garden', 'Zoo'],
  
  // Culture & Arts
  culture: ['Museum', 'Performing arts theater', 'Book store'],
};

/**
 * Get all category strings for a set of intent preferences.
 * Used to expand user intent selections into matchable place categories.
 */
export function getExpandedCategories(intents: string[]): string[] {
  const categories = new Set<string>();
  
  for (const intent of intents) {
    const mapped = INTENT_TO_CATEGORIES[intent];
    if (mapped) {
      mapped.forEach(cat => categories.add(cat));
    }
  }
  
  return Array.from(categories);
}

/**
 * Check if a place category matches any of the user's intent preferences.
 */
export function categoryMatchesIntents(
  category: string | null | undefined,
  intents: string[]
): boolean {
  if (!category || intents.length === 0) return false;
  
  const expandedCategories = getExpandedCategories(intents);
  return expandedCategories.includes(category);
}
