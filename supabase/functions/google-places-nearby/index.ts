import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Valid Google Places API Table A types
const VALID_TABLE_A_TYPES = new Set([
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
  'bar', 'night_club', 'pub', 'wine_bar', 'comedy_club', 'karaoke',
  'movie_theater', 'performing_arts_theater', 'concert_hall', 'amphitheatre',
  'bowling_alley', 'amusement_center', 'amusement_park', 'video_arcade',
  'casino', 'water_park', 'event_venue', 'convention_center',
  'banquet_hall', 'wedding_venue',
  'museum', 'art_gallery', 'art_studio', 'library', 'tourist_attraction',
  'historical_landmark', 'cultural_landmark', 'planetarium',
  'observation_deck', 'cultural_center', 'visitor_center',
  'park', 'hiking_area', 'beach', 'marina', 'dog_park', 'campground',
  'national_park', 'state_park', 'garden', 'botanical_garden',
  'picnic_ground', 'playground', 'nature_preserve', 'wildlife_park',
  'zoo', 'aquarium',
  'gym', 'fitness_center', 'yoga_studio', 'spa', 'wellness_center',
  'pilates_studio', 'sports_club', 'hair_salon', 'beauty_salon',
  'nail_salon', 'barbershop',
  'golf_course', 'ski_resort', 'ice_skating_rink', 'swimming_pool',
  'athletic_field', 'stadium', 'sports_complex', 'tennis_court',
  'basketball_court',
  'hotel', 'motel', 'resort_hotel', 'bed_and_breakfast', 'hostel',
  'extended_stay_hotel', 'lodging', 'vacation_rental', 'rv_park',
  'shopping_mall', 'clothing_store', 'book_store', 'florist',
  'jewelry_store', 'gift_shop', 'supermarket', 'grocery_store',
  'convenience_store', 'liquor_store', 'pet_store', 'furniture_store',
  'electronics_store', 'home_goods_store', 'department_store',
  'discount_store', 'market',
  'travel_agency', 'car_rental', 'laundry', 'car_wash', 'gas_station',
  'electric_vehicle_charging_station', 'parking',
  'church', 'hindu_temple', 'mosque', 'synagogue',
]);

// Input validation
function validateRequest(body: unknown): { valid: true; data: NearbyRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }
  
  const data = body as Record<string, unknown>;
  
  if (typeof data.lat !== 'number' || data.lat < -90 || data.lat > 90) {
    return { valid: false, error: 'lat must be a number between -90 and 90' };
  }
  
  if (typeof data.lng !== 'number' || data.lng < -180 || data.lng > 180) {
    return { valid: false, error: 'lng must be a number between -180 and 180' };
  }
  
  const radius = typeof data.radius === 'number' ? Math.min(Math.max(data.radius, 100), 50000) : 5000;
  
  if (!Array.isArray(data.includedTypes) || data.includedTypes.length === 0) {
    return { valid: false, error: 'includedTypes must be a non-empty array' };
  }
  
  if (data.includedTypes.length > 50) {
    return { valid: false, error: 'includedTypes cannot exceed 50 items' };
  }
  
  // Filter to valid types only
  const validTypes: string[] = [];
  for (const type of data.includedTypes) {
    if (typeof type === 'string' && VALID_TABLE_A_TYPES.has(type)) {
      validTypes.push(type);
    }
  }
  
  if (validTypes.length === 0) {
    return { valid: false, error: 'No valid place types provided' };
  }
  
  const maxResultCount = typeof data.maxResultCount === 'number' 
    ? Math.min(Math.max(data.maxResultCount, 1), 20) 
    : 20;
  
  return {
    valid: true,
    data: {
      lat: data.lat,
      lng: data.lng,
      radius,
      includedTypes: validTypes,
      maxResultCount,
    }
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ========== AUTHENTICATION: Require authenticated user ==========
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claims?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // ========== END AUTHENTICATION ==========

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      console.error('Missing GOOGLE_PLACES_API_KEY');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const rawBody = await req.json().catch(() => null);
    const validation = validateRequest(rawBody);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { lat, lng, radius, includedTypes, maxResultCount } = validation.data;

    console.log(`Nearby search: lat=${lat}, lng=${lng}, radius=${radius}m, types=${includedTypes.join(',')}`);

    const url = 'https://places.googleapis.com/v1/places:searchNearby';
    
    const requestBody = {
      includedTypes,
      maxResultCount,
      rankPreference: 'POPULARITY',
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius
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
        JSON.stringify({ error: `Google API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log(`Found ${data.places?.length || 0} places`);

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

    const places: PlaceResult[] = (data.places || []).map((place: {
      id?: string;
      displayName?: { text?: string };
      formattedAddress?: string;
      location?: { latitude?: number; longitude?: number };
      rating?: number;
      userRatingCount?: number;
      primaryType?: string;
      primaryTypeDisplayName?: { text?: string };
      priceLevel?: string;
      photos?: Array<{ name?: string; widthPx?: number; heightPx?: number }>;
    }) => ({
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
      photos: (place.photos || []).slice(0, 5).map((photo) => ({
        name: photo.name || '',
        widthPx: photo.widthPx || 0,
        heightPx: photo.heightPx || 0,
      })),
    }));

    return new Response(
      JSON.stringify({ places }),
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
