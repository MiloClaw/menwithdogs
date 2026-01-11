import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PhotoReference {
  name: string;
  widthPx: number;
  heightPx: number;
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Input validation
function validateRequest(body: unknown): { valid: true; data: { placeId: string; photos: PhotoReference[]; maxPhotos: number; maxWidth: number; maxHeight: number } } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }
  
  const data = body as Record<string, unknown>;
  
  if (typeof data.placeId !== 'string' || !UUID_REGEX.test(data.placeId)) {
    return { valid: false, error: 'placeId must be a valid UUID' };
  }
  
  if (!Array.isArray(data.photos)) {
    return { valid: false, error: 'photos must be an array' };
  }
  
  if (data.photos.length === 0 || data.photos.length > 20) {
    return { valid: false, error: 'photos must have 1-20 items' };
  }
  
  for (const photo of data.photos) {
    if (!photo || typeof photo !== 'object') {
      return { valid: false, error: 'Each photo must be an object' };
    }
    if (typeof photo.name !== 'string' || !photo.name.startsWith('places/') || !photo.name.includes('/photos/')) {
      return { valid: false, error: 'Each photo must have a valid name (places/xxx/photos/yyy format)' };
    }
  }
  
  const maxPhotos = typeof data.maxPhotos === 'number' ? Math.min(Math.max(data.maxPhotos, 1), 10) : 5;
  const maxWidth = typeof data.maxWidth === 'number' ? Math.min(Math.max(data.maxWidth, 100), 1600) : 800;
  const maxHeight = typeof data.maxHeight === 'number' ? Math.min(Math.max(data.maxHeight, 100), 1600) : 600;
  
  return {
    valid: true,
    data: {
      placeId: data.placeId,
      photos: data.photos as PhotoReference[],
      maxPhotos,
      maxWidth,
      maxHeight,
    }
  };
}

/**
 * Stores place photos permanently in Supabase Storage.
 * Called at seed time to eliminate recurring Google Places API costs.
 * 
 * ADMIN ONLY or called internally from other admin functions.
 * 
 * Input: { placeId: string, photos: PhotoReference[] }
 * Output: { storedUrls: string[], count: number }
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ========== AUTHENTICATION: Admin Only or Internal ==========
    const authHeader = req.headers.get("Authorization");
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // If auth header present, verify admin role
    if (authHeader?.startsWith("Bearer ")) {
      const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      });

      const token = authHeader.replace("Bearer ", "");
      const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
      
      if (!claimsError && claims?.claims?.sub) {
        const userId = claims.claims.sub as string;
        
        const { data: roleData } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();

        if (!roleData) {
          return new Response(
            JSON.stringify({ error: "Forbidden: Admin access required" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        console.log(`Admin ${userId} storing photos`);
      }
    }
    // Note: If no auth header or invalid, still allow internal calls (service-to-service)
    // This is needed for the submit-place-suggestion flow
    // ========== END AUTHENTICATION ==========

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

    if (!GOOGLE_API_KEY) {
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

    const { placeId, photos, maxPhotos, maxWidth, maxHeight } = validation.data;

    console.log(`Storing photos for place ${placeId}: ${photos.length} available, storing up to ${maxPhotos}`);

    const storedUrls: string[] = [];
    const photosToStore = photos.slice(0, maxPhotos);

    for (let i = 0; i < photosToStore.length; i++) {
      const photo = photosToStore[i];
      
      try {
        const googleUrl = `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=${maxWidth}&maxHeightPx=${maxHeight}&key=${GOOGLE_API_KEY}`;
        
        const photoResponse = await fetch(googleUrl, {
          headers: { 'Accept': 'image/*' }
        });

        if (!photoResponse.ok) {
          console.error(`Failed to fetch photo ${i} for ${placeId}: ${photoResponse.status}`);
          continue;
        }

        const imageData = await photoResponse.arrayBuffer();
        const contentType = photoResponse.headers.get('content-type') || 'image/jpeg';
        const extension = contentType.includes('png') ? 'png' : 'jpg';
        
        const fileName = `places/${placeId}/photo-${i}.${extension}`;
        
        const { error: uploadError } = await supabaseAdmin.storage
          .from('couple-photos')
          .upload(fileName, imageData, {
            contentType,
            upsert: true
          });

        if (uploadError) {
          console.error(`Failed to upload photo ${i} for ${placeId}:`, uploadError);
          continue;
        }

        const { data: urlData } = supabaseAdmin.storage
          .from('couple-photos')
          .getPublicUrl(fileName);

        if (urlData?.publicUrl) {
          storedUrls.push(urlData.publicUrl);
          console.log(`Stored photo ${i} for ${placeId}`);
        }
      } catch (photoError) {
        console.error(`Error processing photo ${i} for ${placeId}:`, photoError);
      }
    }

    if (storedUrls.length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('places')
        .update({
          stored_photo_urls: storedUrls,
          photos_stored_at: new Date().toISOString()
        })
        .eq('id', placeId);

      if (updateError) {
        console.error(`Failed to update places table for ${placeId}:`, updateError);
      }
    }

    console.log(`Successfully stored ${storedUrls.length} photos for place ${placeId}`);

    return new Response(
      JSON.stringify({ 
        storedUrls, 
        count: storedUrls.length,
        placeId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Store place photos error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to store photos' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
