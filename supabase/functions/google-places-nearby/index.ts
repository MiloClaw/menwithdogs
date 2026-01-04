import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NearbyRequest {
  lat: number;
  lng: number;
  radius: number;
  includedTypes: string[];
  maxResultCount?: number;
}

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  user_ratings_total: number | null;
  primary_type: string | null;
  primary_type_display: string | null;
  price_level: number | null;
  photos: Array<{ name: string; widthPx: number; heightPx: number }>;
}

// ========================================================================
// Google Places API (New) Table A Types - VALIDATED
// Reference: https://developers.google.com/maps/documentation/places/web-service/place-types
// IMPORTANT: Only these types are valid for Nearby Search includedTypes
// ========================================================================
const VALID_TABLE_A_TYPES = new Set([
  // Food & Dining
  'restaurant', 'cafe', 'bakery', 'coffee_shop', 'ice_cream_shop',
  'brunch_restaurant', 'fine_dining_restaurant', 'fast_food_restaurant',
  'pizza_restaurant', 'seafood_restaurant', 'steak_house', 'sushi_restaurant',
  'japanese_restaurant', 'chinese_restaurant', 'mexican_restaurant',
  'italian_restaurant', 'indian_restaurant', 'thai_restaurant',
  'vietnamese_restaurant', 'korean_restaurant', 'greek_restaurant',
  'french_restaurant', 'spanish_restaurant', 'mediterranean_restaurant',
  'middle_eastern_restaurant', 'american_restaurant', 'barbecue_restaurant',
  'hamburger_restaurant', 'sandwich_shop', 'vegetarian_restaurant',
  'vegan_restaurant', 'ramen_restaurant', 'breakfast_restaurant',
  
  // Nightlife
  'bar', 'night_club', 'pub', 'wine_bar', 'comedy_club', 'karaoke',
  
  // Entertainment
  'movie_theater', 'performing_arts_theater', 'concert_hall', 'amphitheatre',
  'bowling_alley', 'amusement_center', 'amusement_park', 'video_arcade',
  'casino', 'water_park', 'event_venue', 'convention_center',
  'banquet_hall', 'wedding_venue',
  
  // Culture & Museums
  'museum', 'art_gallery', 'art_studio', 'library', 'tourist_attraction',
  'historical_landmark', 'cultural_landmark', 'planetarium',
  'observation_deck', 'cultural_center', 'visitor_center',
  
  // Outdoor & Nature
  'park', 'hiking_area', 'beach', 'marina', 'dog_park', 'campground',
  'national_park', 'state_park', 'garden', 'botanical_garden',
  'picnic_ground', 'playground', 'nature_preserve', 'wildlife_park',
  'zoo', 'aquarium',
  
  // Fitness & Wellness
  'gym', 'fitness_center', 'yoga_studio', 'spa', 'wellness_center',
  'pilates_studio', 'sports_club', 'hair_salon', 'beauty_salon',
  'nail_salon', 'barbershop',
  
  // Sports & Recreation
  'golf_course', 'ski_resort', 'ice_skating_rink', 'swimming_pool',
  'athletic_field', 'stadium', 'sports_complex', 'tennis_court',
  'basketball_court',
  
  // Lodging
  'hotel', 'motel', 'resort_hotel', 'bed_and_breakfast', 'hostel',
  'extended_stay_hotel', 'lodging', 'vacation_rental', 'rv_park',
  
  // Shopping
  'shopping_mall', 'clothing_store', 'book_store', 'florist',
  'jewelry_store', 'gift_shop', 'supermarket', 'grocery_store',
  'convenience_store', 'liquor_store', 'pet_store', 'furniture_store',
  'electronics_store', 'home_goods_store', 'department_store',
  'discount_store', 'market',
  
  // Services
  'travel_agency', 'car_rental', 'laundry', 'car_wash', 'gas_station',
  'electric_vehicle_charging_station', 'parking',
  
  // Religious
  'church', 'hindu_temple', 'mosque', 'synagogue',
]);

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      console.error('Missing GOOGLE_PLACES_API_KEY');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { lat, lng, radius, includedTypes, maxResultCount = 20 }: NearbyRequest = await req.json();

    if (!lat || !lng || !includedTypes?.length) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: lat, lng, includedTypes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // TYPE VALIDATION - Filter out invalid types to prevent 400 errors
    // ========================================================================
    const validTypes: string[] = [];
    const invalidTypes: string[] = [];
    
    for (const type of includedTypes) {
      if (VALID_TABLE_A_TYPES.has(type)) {
        validTypes.push(type);
      } else {
        invalidTypes.push(type);
      }
    }
    
    // Log any invalid types for debugging
    if (invalidTypes.length > 0) {
      console.warn(`Filtered out ${invalidTypes.length} invalid types: ${invalidTypes.join(', ')}`);
    }
    
    // If no valid types remain, return early with descriptive error
    if (validTypes.length === 0) {
      console.error('No valid place types provided after filtering');
      return new Response(
        JSON.stringify({ 
          error: 'No valid place types provided', 
          invalidTypes,
          places: [] 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Nearby search: lat=${lat}, lng=${lng}, radius=${radius}m, validTypes=${validTypes.join(',')}`);

    // Google Places API (New) Nearby Search endpoint
    const url = 'https://places.googleapis.com/v1/places:searchNearby';
    
    const requestBody = {
      includedTypes: validTypes,
      maxResultCount: Math.min(maxResultCount, 20), // API max is 20
      rankPreference: 'POPULARITY',
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radius
        }
      }
    };

    const fieldMask = [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.location',
      'places.rating',
      'places.userRatingCount',
      'places.primaryType',
      'places.primaryTypeDisplayName',
      'places.priceLevel',
      'places.photos'
    ].join(',');

    console.log('Calling Google Places Nearby Search API...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `Google API error: ${response.status}`, details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log(`Found ${data.places?.length || 0} places`);

    // Parse price level from enum string
    const parsePriceLevel = (priceLevel: string | undefined): number | null => {
      if (!priceLevel) return null;
      const mapping: Record<string, number> = {
        'PRICE_LEVEL_FREE': 0,
        'PRICE_LEVEL_INEXPENSIVE': 1,
        'PRICE_LEVEL_MODERATE': 2,
        'PRICE_LEVEL_EXPENSIVE': 3,
        'PRICE_LEVEL_VERY_EXPENSIVE': 4,
      };
      return mapping[priceLevel] ?? null;
    };

    // Transform results to our format
    const places: PlaceResult[] = (data.places || []).map((place: any) => ({
      place_id: place.id?.replace('places/', '') || '',
      name: place.displayName?.text || '',
      formatted_address: place.formattedAddress || '',
      lat: place.location?.latitude || null,
      lng: place.location?.longitude || null,
      rating: place.rating || null,
      user_ratings_total: place.userRatingCount || null,
      primary_type: place.primaryType || null,
      primary_type_display: place.primaryTypeDisplayName?.text || null,
      price_level: parsePriceLevel(place.priceLevel),
      photos: (place.photos || []).slice(0, 5).map((photo: any) => ({
        name: photo.name || '',
        widthPx: photo.widthPx || 0,
        heightPx: photo.heightPx || 0,
      })),
    }));

    return new Response(
      JSON.stringify({ 
        places,
        // Include metadata about filtered types for debugging
        ...(invalidTypes.length > 0 && { filteredInvalidTypes: invalidTypes })
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in google-places-nearby:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
