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

    console.log(`Nearby search: lat=${lat}, lng=${lng}, radius=${radius}m, types=${includedTypes.join(',')}`);

    // Google Places API (New) Nearby Search endpoint
    const url = 'https://places.googleapis.com/v1/places:searchNearby';
    
    const requestBody = {
      includedTypes: includedTypes,
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
