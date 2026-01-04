/**
 * Google Places API (New) Table A Types - AUTHORITATIVE REFERENCE
 * 
 * This file contains the validated list of Google Places types for Nearby Search.
 * Reference: https://developers.google.com/maps/documentation/places/web-service/place-types
 * 
 * IMPORTANT: Only Table A types are valid for Nearby Search includedTypes parameter.
 * Types like 'brewery', 'winery', 'escape_room', 'live_music_venue' are NOT valid.
 */

export interface GooglePlaceType {
  value: string;
  label: string;
  category: 
    | 'food' 
    | 'nightlife' 
    | 'entertainment' 
    | 'outdoor' 
    | 'wellness' 
    | 'culture' 
    | 'sports' 
    | 'lodging' 
    | 'shopping' 
    | 'services' 
    | 'other';
}

/**
 * Complete list of Google Places API (New) Table A types
 * These are the ONLY types valid for Nearby Search
 */
export const GOOGLE_PLACE_TYPES: GooglePlaceType[] = [
  // ====== FOOD & DINING ======
  { value: 'restaurant', label: 'Restaurant', category: 'food' },
  { value: 'cafe', label: 'Café', category: 'food' },
  { value: 'bakery', label: 'Bakery', category: 'food' },
  { value: 'coffee_shop', label: 'Coffee Shop', category: 'food' },
  { value: 'ice_cream_shop', label: 'Ice Cream Shop', category: 'food' },
  { value: 'brunch_restaurant', label: 'Brunch Restaurant', category: 'food' },
  { value: 'fine_dining_restaurant', label: 'Fine Dining', category: 'food' },
  { value: 'fast_food_restaurant', label: 'Fast Food', category: 'food' },
  { value: 'pizza_restaurant', label: 'Pizza Restaurant', category: 'food' },
  { value: 'seafood_restaurant', label: 'Seafood Restaurant', category: 'food' },
  { value: 'steak_house', label: 'Steak House', category: 'food' },
  { value: 'sushi_restaurant', label: 'Sushi Restaurant', category: 'food' },
  { value: 'japanese_restaurant', label: 'Japanese Restaurant', category: 'food' },
  { value: 'chinese_restaurant', label: 'Chinese Restaurant', category: 'food' },
  { value: 'mexican_restaurant', label: 'Mexican Restaurant', category: 'food' },
  { value: 'italian_restaurant', label: 'Italian Restaurant', category: 'food' },
  { value: 'indian_restaurant', label: 'Indian Restaurant', category: 'food' },
  { value: 'thai_restaurant', label: 'Thai Restaurant', category: 'food' },
  { value: 'vietnamese_restaurant', label: 'Vietnamese Restaurant', category: 'food' },
  { value: 'korean_restaurant', label: 'Korean Restaurant', category: 'food' },
  { value: 'greek_restaurant', label: 'Greek Restaurant', category: 'food' },
  { value: 'french_restaurant', label: 'French Restaurant', category: 'food' },
  { value: 'spanish_restaurant', label: 'Spanish Restaurant', category: 'food' },
  { value: 'mediterranean_restaurant', label: 'Mediterranean Restaurant', category: 'food' },
  { value: 'middle_eastern_restaurant', label: 'Middle Eastern Restaurant', category: 'food' },
  { value: 'american_restaurant', label: 'American Restaurant', category: 'food' },
  { value: 'barbecue_restaurant', label: 'Barbecue Restaurant', category: 'food' },
  { value: 'hamburger_restaurant', label: 'Hamburger Restaurant', category: 'food' },
  { value: 'sandwich_shop', label: 'Sandwich Shop', category: 'food' },
  { value: 'vegetarian_restaurant', label: 'Vegetarian Restaurant', category: 'food' },
  { value: 'vegan_restaurant', label: 'Vegan Restaurant', category: 'food' },
  { value: 'ramen_restaurant', label: 'Ramen Restaurant', category: 'food' },
  { value: 'breakfast_restaurant', label: 'Breakfast Restaurant', category: 'food' },
  
  // ====== NIGHTLIFE ======
  { value: 'bar', label: 'Bar', category: 'nightlife' },
  { value: 'night_club', label: 'Night Club', category: 'nightlife' },
  { value: 'pub', label: 'Pub', category: 'nightlife' },
  { value: 'wine_bar', label: 'Wine Bar', category: 'nightlife' },
  { value: 'comedy_club', label: 'Comedy Club', category: 'nightlife' },
  { value: 'karaoke', label: 'Karaoke', category: 'nightlife' },
  
  // ====== ENTERTAINMENT ======
  { value: 'movie_theater', label: 'Movie Theater', category: 'entertainment' },
  { value: 'performing_arts_theater', label: 'Performing Arts Theater', category: 'entertainment' },
  { value: 'concert_hall', label: 'Concert Hall', category: 'entertainment' },
  { value: 'amphitheatre', label: 'Amphitheatre', category: 'entertainment' },
  { value: 'bowling_alley', label: 'Bowling Alley', category: 'entertainment' },
  { value: 'amusement_center', label: 'Amusement Center', category: 'entertainment' },
  { value: 'amusement_park', label: 'Amusement Park', category: 'entertainment' },
  { value: 'video_arcade', label: 'Video Arcade', category: 'entertainment' },
  { value: 'casino', label: 'Casino', category: 'entertainment' },
  { value: 'water_park', label: 'Water Park', category: 'entertainment' },
  { value: 'event_venue', label: 'Event Venue', category: 'entertainment' },
  { value: 'convention_center', label: 'Convention Center', category: 'entertainment' },
  { value: 'banquet_hall', label: 'Banquet Hall', category: 'entertainment' },
  { value: 'wedding_venue', label: 'Wedding Venue', category: 'entertainment' },
  
  // ====== CULTURE & MUSEUMS ======
  { value: 'museum', label: 'Museum', category: 'culture' },
  { value: 'art_gallery', label: 'Art Gallery', category: 'culture' },
  { value: 'art_studio', label: 'Art Studio', category: 'culture' },
  { value: 'library', label: 'Library', category: 'culture' },
  { value: 'tourist_attraction', label: 'Tourist Attraction', category: 'culture' },
  { value: 'historical_landmark', label: 'Historical Landmark', category: 'culture' },
  { value: 'cultural_landmark', label: 'Cultural Landmark', category: 'culture' },
  { value: 'planetarium', label: 'Planetarium', category: 'culture' },
  { value: 'observation_deck', label: 'Observation Deck', category: 'culture' },
  { value: 'cultural_center', label: 'Cultural Center', category: 'culture' },
  { value: 'visitor_center', label: 'Visitor Center', category: 'culture' },
  
  // ====== OUTDOOR & NATURE ======
  { value: 'park', label: 'Park', category: 'outdoor' },
  { value: 'hiking_area', label: 'Hiking Area', category: 'outdoor' },
  { value: 'beach', label: 'Beach', category: 'outdoor' },
  { value: 'marina', label: 'Marina', category: 'outdoor' },
  { value: 'dog_park', label: 'Dog Park', category: 'outdoor' },
  { value: 'campground', label: 'Campground', category: 'outdoor' },
  { value: 'national_park', label: 'National Park', category: 'outdoor' },
  { value: 'state_park', label: 'State Park', category: 'outdoor' },
  { value: 'garden', label: 'Garden', category: 'outdoor' },
  { value: 'botanical_garden', label: 'Botanical Garden', category: 'outdoor' },
  { value: 'picnic_ground', label: 'Picnic Ground', category: 'outdoor' },
  { value: 'playground', label: 'Playground', category: 'outdoor' },
  { value: 'nature_preserve', label: 'Nature Preserve', category: 'outdoor' },
  { value: 'wildlife_park', label: 'Wildlife Park', category: 'outdoor' },
  { value: 'zoo', label: 'Zoo', category: 'outdoor' },
  { value: 'aquarium', label: 'Aquarium', category: 'outdoor' },
  
  // ====== FITNESS & WELLNESS ======
  { value: 'gym', label: 'Gym', category: 'wellness' },
  { value: 'fitness_center', label: 'Fitness Center', category: 'wellness' },
  { value: 'yoga_studio', label: 'Yoga Studio', category: 'wellness' },
  { value: 'spa', label: 'Spa', category: 'wellness' },
  { value: 'wellness_center', label: 'Wellness Center', category: 'wellness' },
  { value: 'pilates_studio', label: 'Pilates Studio', category: 'wellness' },
  { value: 'sports_club', label: 'Sports Club', category: 'wellness' },
  { value: 'hair_salon', label: 'Hair Salon', category: 'wellness' },
  { value: 'beauty_salon', label: 'Beauty Salon', category: 'wellness' },
  { value: 'nail_salon', label: 'Nail Salon', category: 'wellness' },
  { value: 'barbershop', label: 'Barbershop', category: 'wellness' },
  
  // ====== SPORTS & RECREATION ======
  { value: 'golf_course', label: 'Golf Course', category: 'sports' },
  { value: 'ski_resort', label: 'Ski Resort', category: 'sports' },
  { value: 'ice_skating_rink', label: 'Ice Skating Rink', category: 'sports' },
  { value: 'swimming_pool', label: 'Swimming Pool', category: 'sports' },
  { value: 'athletic_field', label: 'Athletic Field', category: 'sports' },
  { value: 'stadium', label: 'Stadium', category: 'sports' },
  { value: 'sports_complex', label: 'Sports Complex', category: 'sports' },
  { value: 'tennis_court', label: 'Tennis Court', category: 'sports' },
  { value: 'basketball_court', label: 'Basketball Court', category: 'sports' },
  
  // ====== LODGING ======
  { value: 'hotel', label: 'Hotel', category: 'lodging' },
  { value: 'motel', label: 'Motel', category: 'lodging' },
  { value: 'resort_hotel', label: 'Resort Hotel', category: 'lodging' },
  { value: 'bed_and_breakfast', label: 'Bed & Breakfast', category: 'lodging' },
  { value: 'hostel', label: 'Hostel', category: 'lodging' },
  { value: 'extended_stay_hotel', label: 'Extended Stay Hotel', category: 'lodging' },
  { value: 'lodging', label: 'Lodging', category: 'lodging' },
  { value: 'vacation_rental', label: 'Vacation Rental', category: 'lodging' },
  { value: 'rv_park', label: 'RV Park', category: 'lodging' },
  
  // ====== SHOPPING ======
  { value: 'shopping_mall', label: 'Shopping Mall', category: 'shopping' },
  { value: 'clothing_store', label: 'Clothing Store', category: 'shopping' },
  { value: 'book_store', label: 'Book Store', category: 'shopping' },
  { value: 'florist', label: 'Florist', category: 'shopping' },
  { value: 'jewelry_store', label: 'Jewelry Store', category: 'shopping' },
  { value: 'gift_shop', label: 'Gift Shop', category: 'shopping' },
  { value: 'supermarket', label: 'Supermarket', category: 'shopping' },
  { value: 'grocery_store', label: 'Grocery Store', category: 'shopping' },
  { value: 'convenience_store', label: 'Convenience Store', category: 'shopping' },
  { value: 'liquor_store', label: 'Liquor Store', category: 'shopping' },
  { value: 'pet_store', label: 'Pet Store', category: 'shopping' },
  { value: 'furniture_store', label: 'Furniture Store', category: 'shopping' },
  { value: 'electronics_store', label: 'Electronics Store', category: 'shopping' },
  { value: 'home_goods_store', label: 'Home Goods Store', category: 'shopping' },
  { value: 'department_store', label: 'Department Store', category: 'shopping' },
  { value: 'discount_store', label: 'Discount Store', category: 'shopping' },
  { value: 'market', label: 'Market', category: 'shopping' },
  
  // ====== SERVICES ======
  { value: 'travel_agency', label: 'Travel Agency', category: 'services' },
  { value: 'car_rental', label: 'Car Rental', category: 'services' },
  { value: 'laundry', label: 'Laundry', category: 'services' },
  { value: 'car_wash', label: 'Car Wash', category: 'services' },
  { value: 'gas_station', label: 'Gas Station', category: 'services' },
  { value: 'electric_vehicle_charging_station', label: 'EV Charging Station', category: 'services' },
  { value: 'parking', label: 'Parking', category: 'services' },
  
  // ====== RELIGIOUS ======
  { value: 'church', label: 'Church', category: 'culture' },
  { value: 'hindu_temple', label: 'Hindu Temple', category: 'culture' },
  { value: 'mosque', label: 'Mosque', category: 'culture' },
  { value: 'synagogue', label: 'Synagogue', category: 'culture' },
];

/**
 * Set of valid types for quick lookup - used by edge functions
 */
export const VALID_NEARBY_SEARCH_TYPES = new Set(
  GOOGLE_PLACE_TYPES.map(t => t.value)
);

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
 * Check if a type value is valid for Nearby Search
 */
export function isValidPlaceType(value: string): boolean {
  return VALID_NEARBY_SEARCH_TYPES.has(value);
}

/**
 * Get human-readable label for a type value
 */
export function getPlaceTypeLabel(value: string): string {
  return getPlaceType(value)?.label ?? value.replace(/_/g, ' ');
}

/**
 * Filter an array of types to only include valid ones
 */
export function filterValidTypes(types: string[]): string[] {
  return types.filter(t => VALID_NEARBY_SEARCH_TYPES.has(t));
}

/**
 * Categories with their labels for grouping in UI
 */
export const PLACE_TYPE_CATEGORIES: { value: GooglePlaceType['category']; label: string }[] = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'outdoor', label: 'Outdoor & Nature' },
  { value: 'wellness', label: 'Wellness & Fitness' },
  { value: 'culture', label: 'Culture & Arts' },
  { value: 'sports', label: 'Sports & Recreation' },
  { value: 'lodging', label: 'Lodging' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Other' },
];

/**
 * Types that are commonly useful for date-night / couple activities
 * This is a curated subset of all valid types
 */
export const DATE_RELEVANT_TYPES = [
  // Food
  'restaurant', 'cafe', 'bakery', 'coffee_shop', 'ice_cream_shop',
  'brunch_restaurant', 'fine_dining_restaurant', 'seafood_restaurant',
  // Nightlife
  'bar', 'wine_bar', 'pub', 'night_club', 'comedy_club', 'karaoke',
  // Entertainment
  'movie_theater', 'performing_arts_theater', 'concert_hall',
  'bowling_alley', 'amusement_center', 'amusement_park', 'video_arcade',
  'aquarium', 'zoo', 'casino',
  // Culture
  'museum', 'art_gallery', 'art_studio', 'historical_landmark', 'planetarium',
  // Outdoor
  'park', 'hiking_area', 'beach', 'marina', 'dog_park', 'botanical_garden',
  // Wellness
  'spa', 'yoga_studio',
  // Lodging (for getaways)
  'hotel', 'bed_and_breakfast', 'resort_hotel',
] as const;
