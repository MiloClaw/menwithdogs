/**
 * Google Places API types reference
 * 
 * This file contains the validated list of Google Places types
 * for autocomplete and validation in the mapping editor.
 * 
 * Reference: https://developers.google.com/maps/documentation/places/web-service/supported_types
 */

export interface GooglePlaceType {
  value: string;
  label: string;
  category: 'food' | 'entertainment' | 'outdoor' | 'wellness' | 'culture' | 'nightlife' | 'shopping' | 'services' | 'other';
}

/**
 * Curated list of Google Places types relevant to couple activities
 * Grouped by category for easier navigation
 */
export const GOOGLE_PLACE_TYPES: GooglePlaceType[] = [
  // Food & Drink
  { value: 'restaurant', label: 'Restaurant', category: 'food' },
  { value: 'cafe', label: 'Café', category: 'food' },
  { value: 'bakery', label: 'Bakery', category: 'food' },
  { value: 'bar', label: 'Bar', category: 'nightlife' },
  { value: 'night_club', label: 'Night Club', category: 'nightlife' },
  { value: 'meal_delivery', label: 'Meal Delivery', category: 'food' },
  { value: 'meal_takeaway', label: 'Meal Takeaway', category: 'food' },
  
  // Entertainment
  { value: 'movie_theater', label: 'Movie Theater', category: 'entertainment' },
  { value: 'bowling_alley', label: 'Bowling Alley', category: 'entertainment' },
  { value: 'amusement_park', label: 'Amusement Park', category: 'entertainment' },
  { value: 'aquarium', label: 'Aquarium', category: 'entertainment' },
  { value: 'zoo', label: 'Zoo', category: 'entertainment' },
  { value: 'casino', label: 'Casino', category: 'entertainment' },
  { value: 'stadium', label: 'Stadium', category: 'entertainment' },
  
  // Outdoor & Nature
  { value: 'park', label: 'Park', category: 'outdoor' },
  { value: 'campground', label: 'Campground', category: 'outdoor' },
  { value: 'natural_feature', label: 'Natural Feature', category: 'outdoor' },
  { value: 'hiking_area', label: 'Hiking Area', category: 'outdoor' },
  
  // Wellness & Fitness
  { value: 'gym', label: 'Gym', category: 'wellness' },
  { value: 'spa', label: 'Spa', category: 'wellness' },
  { value: 'beauty_salon', label: 'Beauty Salon', category: 'wellness' },
  { value: 'hair_care', label: 'Hair Care', category: 'wellness' },
  { value: 'physiotherapist', label: 'Physiotherapist', category: 'wellness' },
  
  // Culture & Arts
  { value: 'museum', label: 'Museum', category: 'culture' },
  { value: 'art_gallery', label: 'Art Gallery', category: 'culture' },
  { value: 'library', label: 'Library', category: 'culture' },
  { value: 'tourist_attraction', label: 'Tourist Attraction', category: 'culture' },
  { value: 'church', label: 'Church', category: 'culture' },
  { value: 'hindu_temple', label: 'Hindu Temple', category: 'culture' },
  { value: 'mosque', label: 'Mosque', category: 'culture' },
  { value: 'synagogue', label: 'Synagogue', category: 'culture' },
  
  // Shopping
  { value: 'shopping_mall', label: 'Shopping Mall', category: 'shopping' },
  { value: 'clothing_store', label: 'Clothing Store', category: 'shopping' },
  { value: 'book_store', label: 'Book Store', category: 'shopping' },
  { value: 'florist', label: 'Florist', category: 'shopping' },
  { value: 'jewelry_store', label: 'Jewelry Store', category: 'shopping' },
  { value: 'home_goods_store', label: 'Home Goods Store', category: 'shopping' },
  { value: 'furniture_store', label: 'Furniture Store', category: 'shopping' },
  { value: 'electronics_store', label: 'Electronics Store', category: 'shopping' },
  { value: 'pet_store', label: 'Pet Store', category: 'shopping' },
  { value: 'supermarket', label: 'Supermarket', category: 'shopping' },
  { value: 'liquor_store', label: 'Liquor Store', category: 'shopping' },
  
  // Services & Misc
  { value: 'lodging', label: 'Lodging / Hotel', category: 'services' },
  { value: 'travel_agency', label: 'Travel Agency', category: 'services' },
  { value: 'car_rental', label: 'Car Rental', category: 'services' },
  { value: 'laundry', label: 'Laundry', category: 'services' },
  
  // Other useful types
  { value: 'point_of_interest', label: 'Point of Interest', category: 'other' },
  { value: 'establishment', label: 'Establishment', category: 'other' },
];

/**
 * Get a place type by its value
 */
export function getPlaceType(value: string): GooglePlaceType | undefined {
  return GOOGLE_PLACE_TYPES.find(t => t.value === value);
}

/**
 * Get place types by category
 */
export function getPlaceTypesByCategory(category: GooglePlaceType['category']): GooglePlaceType[] {
  return GOOGLE_PLACE_TYPES.filter(t => t.category === category);
}

/**
 * Check if a type value is valid
 */
export function isValidPlaceType(value: string): boolean {
  return GOOGLE_PLACE_TYPES.some(t => t.value === value);
}

/**
 * Get human-readable label for a type value
 */
export function getPlaceTypeLabel(value: string): string {
  return getPlaceType(value)?.label ?? value;
}

/**
 * Categories with their labels for grouping in UI
 */
export const PLACE_TYPE_CATEGORIES: { value: GooglePlaceType['category']; label: string }[] = [
  { value: 'food', label: 'Food & Drink' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'outdoor', label: 'Outdoor & Nature' },
  { value: 'wellness', label: 'Wellness & Fitness' },
  { value: 'culture', label: 'Culture & Arts' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Other' },
];
