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

/**
 * Stores place photos permanently in Supabase Storage.
 * Called at seed time to eliminate recurring Google Places API costs.
 * 
 * Input: { placeId: string, photos: PhotoReference[] }
 * Output: { storedUrls: string[], count: number }
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GOOGLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { placeId, photos, maxPhotos = 5, maxWidth = 800, maxHeight = 600 } = await req.json();

    if (!placeId || !photos || !Array.isArray(photos)) {
      return new Response(
        JSON.stringify({ error: 'placeId and photos array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Storing photos for place ${placeId}: ${photos.length} available, storing up to ${maxPhotos}`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const storedUrls: string[] = [];
    const photosToStore = photos.slice(0, maxPhotos) as PhotoReference[];

    for (let i = 0; i < photosToStore.length; i++) {
      const photo = photosToStore[i];
      
      try {
        // Fetch photo from Google Places API
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
        
        // Upload to Supabase Storage
        const fileName = `places/${placeId}/photo-${i}.${extension}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('couple-photos')
          .upload(fileName, imageData, {
            contentType,
            upsert: true
          });

        if (uploadError) {
          console.error(`Failed to upload photo ${i} for ${placeId}:`, uploadError);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('couple-photos')
          .getPublicUrl(fileName);

        if (urlData?.publicUrl) {
          storedUrls.push(urlData.publicUrl);
          console.log(`Stored photo ${i} for ${placeId}: ${urlData.publicUrl}`);
        }
      } catch (photoError) {
        console.error(`Error processing photo ${i} for ${placeId}:`, photoError);
      }
    }

    // Update places table with stored URLs
    if (storedUrls.length > 0) {
      const { error: updateError } = await supabase
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
