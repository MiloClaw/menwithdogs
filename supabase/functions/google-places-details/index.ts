import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DetailsRequest {
  place_id: string;
  sessionToken?: string;
  includeReviews?: boolean;
}

interface Review {
  text: string;
  rating: number;
  relativePublishTimeDescription?: string;
}

interface PhotoReference {
  name: string;
  widthPx: number;
  heightPx: number;
}

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  city: string | null;
  state: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  // GBP enrichment fields
  rating: number | null;
  user_ratings_total: number | null;
  price_level: number | null;
  website_url: string | null;
  phone_number: string | null;
  google_maps_url: string | null;
  opening_hours: { weekday_text: string[] } | null;
  photos: PhotoReference[] | null;
  google_primary_type: string | null;
  google_primary_type_display: string | null;
  // All Google place types for taxonomy mapping
  google_types: string[];
  // Business status from Google
  business_status: string | null;
  // UTC offset for timezone handling
  utc_offset_minutes: number | null;
  // Optional reviews for keyword scanning
  reviews?: Review[];
  // Raw response for snapshot storage
  raw_response?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!apiKey) {
      console.error("GOOGLE_PLACES_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Google Places API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { place_id, sessionToken, includeReviews }: DetailsRequest = await req.json();

    if (!place_id) {
      return new Response(
        JSON.stringify({ error: "place_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching details for place_id: ${place_id}, includeReviews: ${includeReviews}`);

    // Build field mask - add reviews if requested (Enterprise + Atmosphere SKU)
    const fields = [
      "id",
      "displayName",
      "formattedAddress",
      "addressComponents",
      "location",
      "rating",
      "userRatingCount",
      "priceLevel",
      "websiteUri",
      "internationalPhoneNumber",
      "googleMapsUri",
      "regularOpeningHours",
      "photos",
      "primaryType",
      "primaryTypeDisplayName",
      "types",
      "businessStatus",
      "utcOffsetMinutes",
    ];
    
    if (includeReviews) {
      fields.push("reviews");
    }
    
    const fieldMask = fields.join(",");

    let url = `https://places.googleapis.com/v1/places/${place_id}?languageCode=en`;
    
    // Add session token if provided (completes the billing session)
    if (sessionToken) {
      url += `&sessionToken=${sessionToken}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fieldMask,
      },
    });

    const data = await response.json();

    if (data.error) {
      console.error("Google Places API error:", data.error.message);
      return new Response(
        JSON.stringify({ error: data.error.message || "Place not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse address components (new API format)
    let city: string | null = null;
    let state: string | null = null;
    let country: string | null = null;

    for (const component of data.addressComponents || []) {
      const types = component.types || [];
      if (types.includes("locality")) {
        city = component.longText;
      } else if (types.includes("administrative_area_level_1")) {
        state = component.shortText;
      } else if (types.includes("country")) {
        country = component.shortText;
      }
    }

    // Fallback for city if no locality found
    if (!city) {
      for (const component of data.addressComponents || []) {
        const types = component.types || [];
        if (types.includes("sublocality_level_1") || types.includes("administrative_area_level_2") || types.includes("postal_town")) {
          city = component.longText;
          break;
        }
      }
    }

    // Parse photos - extract up to 5 photo references
    let photos: PhotoReference[] | null = null;
    if (data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
      photos = data.photos.slice(0, 5).map((photo: any) => ({
        name: photo.name,
        widthPx: photo.widthPx || 0,
        heightPx: photo.heightPx || 0,
      }));
    }

    // Parse opening hours
    let opening_hours: { weekday_text: string[] } | null = null;
    if (data.regularOpeningHours?.weekdayDescriptions) {
      opening_hours = {
        weekday_text: data.regularOpeningHours.weekdayDescriptions,
      };
    }

    // Map price level from string to number
    let price_level: number | null = null;
    if (data.priceLevel) {
      const priceLevelMap: Record<string, number> = {
        "PRICE_LEVEL_FREE": 0,
        "PRICE_LEVEL_INEXPENSIVE": 1,
        "PRICE_LEVEL_MODERATE": 2,
        "PRICE_LEVEL_EXPENSIVE": 3,
        "PRICE_LEVEL_VERY_EXPENSIVE": 4,
      };
      price_level = priceLevelMap[data.priceLevel] ?? null;
    }

    // Parse reviews if included
    let reviews: Review[] | undefined = undefined;
    if (includeReviews && data.reviews && Array.isArray(data.reviews)) {
      reviews = data.reviews.slice(0, 5).map((review: any) => ({
        text: review.text?.text || review.originalText?.text || "",
        rating: review.rating ?? 0,
        relativePublishTimeDescription: review.relativePublishTimeDescription,
      }));
      console.log(`Parsed ${reviews!.length} reviews for keyword scanning`);
    }

    // Extract all Google place types (for taxonomy mapping)
    const google_types: string[] = data.types || [];
    
    // Business status mapping
    let business_status: string | null = null;
    if (data.businessStatus) {
      // Map enum to readable value: OPERATIONAL, CLOSED_TEMPORARILY, CLOSED_PERMANENTLY
      business_status = data.businessStatus;
    }

    // UTC offset for timezone handling
    const utc_offset_minutes: number | null = data.utcOffsetMinutes ?? null;

    const details: PlaceDetails = {
      place_id: data.id || place_id,
      name: data.displayName?.text || "",
      formatted_address: data.formattedAddress || "",
      city,
      state,
      country,
      lat: data.location?.latitude ?? null,
      lng: data.location?.longitude ?? null,
      // GBP fields
      rating: data.rating ?? null,
      user_ratings_total: data.userRatingCount ?? null,
      price_level,
      website_url: data.websiteUri ?? null,
      phone_number: data.internationalPhoneNumber ?? null,
      google_maps_url: data.googleMapsUri ?? null,
      opening_hours,
      photos,
      google_primary_type: data.primaryType ?? null,
      google_primary_type_display: data.primaryTypeDisplayName?.text ?? null,
      // New fields for directory foundation
      google_types,
      business_status,
      utc_offset_minutes,
      reviews,
      // Include raw response for snapshot storage
      raw_response: data,
    };

    console.log(`Returning enriched details for: ${details.name} (rating: ${details.rating}, photos: ${photos?.length || 0}, reviews: ${reviews?.length || 0}, types: ${google_types.length})`);

    return new Response(
      JSON.stringify({ details }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in google-places-details:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
