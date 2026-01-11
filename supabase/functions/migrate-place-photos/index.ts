import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * One-time migration to store photos for all existing places.
 * Finds places with photos but no stored_photo_urls and calls store-place-photos for each.
 * ADMIN ONLY - requires authentication and admin role.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ========== AUTHENTICATION: Admin Only ==========
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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

    const userId = claims.claims.sub as string;
    
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
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
    // ========== END AUTHENTICATION ==========

    console.log(`Admin ${userId} starting photo migration`);

    // Find places with photos but no stored URLs
    const { data: places, error: fetchError } = await supabaseAdmin
      .from('places')
      .select('id, google_place_id, name, photos')
      .not('photos', 'is', null)
      .is('stored_photo_urls', null)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Failed to fetch places:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch places', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${places?.length || 0} places needing photo migration`);

    if (!places || places.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No places need photo migration', migrated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: { placeId: string; name: string; status: 'success' | 'failed'; photoCount?: number; error?: string }[] = [];

    for (const place of places) {
      try {
        const photos = place.photos as { name: string; widthPx: number; heightPx: number }[] | null;
        
        if (!photos || photos.length === 0) {
          console.log(`Skipping ${place.name} - no photos array`);
          results.push({ placeId: place.id, name: place.name, status: 'failed', error: 'No photos array' });
          continue;
        }

        console.log(`Processing ${place.name} with ${photos.length} photos...`);

        const { data, error } = await supabaseAdmin.functions.invoke('store-place-photos', {
          body: {
            placeId: place.id,
            photos: photos,
            maxPhotos: 5,
            maxWidth: 800,
            maxHeight: 600
          }
        });

        if (error) {
          console.error(`Failed to store photos for ${place.name}:`, error);
          results.push({ placeId: place.id, name: place.name, status: 'failed', error: error.message });
        } else {
          console.log(`Successfully stored ${data?.count || 0} photos for ${place.name}`);
          results.push({ placeId: place.id, name: place.name, status: 'success', photoCount: data?.count || 0 });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (placeError) {
        console.error(`Error processing ${place.name}:`, placeError);
        results.push({ 
          placeId: place.id, 
          name: place.name, 
          status: 'failed', 
          error: placeError instanceof Error ? placeError.message : 'Unknown error' 
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'failed').length;
    const totalPhotos = results.reduce((sum, r) => sum + (r.photoCount || 0), 0);

    console.log(`Migration complete: ${successCount} succeeded, ${failedCount} failed, ${totalPhotos} total photos stored`);

    return new Response(
      JSON.stringify({
        message: 'Migration complete',
        summary: {
          total: places.length,
          succeeded: successCount,
          failed: failedCount,
          totalPhotosStored: totalPhotos
        },
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
