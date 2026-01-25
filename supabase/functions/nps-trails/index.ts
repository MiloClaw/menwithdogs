import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// NPS ArcGIS MapServer for public trails
const NPS_TRAILS_URL = 'https://mapservices.nps.gov/arcgis/rest/services/NationalDatasets/NPS_Public_Trails/MapServer/0/query';

interface RequestBody {
  parkCode: string;
  bounds: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
}

// Retry with exponential backoff
async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Exponential backoff: 500ms, 1000ms, 2000ms
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)));
        console.log(`Retry attempt ${attempt + 1}...`);
      }
      
      const response = await fetch(url);
      return response;
    } catch (error) {
      lastError = error as Error;
      console.error(`Fetch attempt ${attempt + 1} failed:`, error);
    }
  }
  
  throw lastError || new Error('All fetch attempts failed');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { parkCode, bounds } = await req.json() as RequestBody;

    if (!bounds || bounds.length !== 4) {
      console.error('Invalid bounds parameter:', bounds);
      return new Response(
        JSON.stringify({ type: 'FeatureCollection', features: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const [minLng, minLat, maxLng, maxLat] = bounds;

    // Use JSON envelope format for geometry (ArcGIS standard)
    const geometryParam = JSON.stringify({
      xmin: minLng,
      ymin: minLat,
      xmax: maxLng,
      ymax: maxLat,
      spatialReference: { wkid: 4326 }
    });

    // Build query with geometry filter
    const params = new URLSearchParams({
      where: parkCode ? `UnitCode='${parkCode.toUpperCase()}'` : '1=1',
      geometry: geometryParam,
      geometryType: 'esriGeometryEnvelope',
      inSR: '4326',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: 'TrailName,TrailClass,TrailSurface,Miles,UnitCode',
      f: 'geojson',
      outSR: '4326',
      resultRecordCount: '500', // Limit to prevent timeouts
    });

    console.log(`Fetching NPS trails for parkCode: ${parkCode || 'all'}`);
    console.log(`Bounds: [${minLng.toFixed(4)}, ${minLat.toFixed(4)}, ${maxLng.toFixed(4)}, ${maxLat.toFixed(4)}]`);

    const url = `${NPS_TRAILS_URL}?${params.toString()}`;
    
    let data;
    try {
      const response = await fetchWithRetry(url);
      data = await response.json();
    } catch (fetchError) {
      console.error('Network error fetching NPS trails:', fetchError);
      return new Response(
        JSON.stringify({ 
          type: 'FeatureCollection', 
          features: [],
          _meta: { error: 'network_error', message: 'Could not reach NPS API' }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check for ArcGIS error response
    if (data.error) {
      console.error(`ArcGIS API error:`, JSON.stringify(data.error));
      
      // Try simpler query without geometry (fallback)
      const fallbackParams = new URLSearchParams({
        where: parkCode ? `UnitCode='${parkCode.toUpperCase()}'` : '1=1',
        outFields: 'TrailName,TrailClass,TrailSurface,Miles,UnitCode',
        f: 'geojson',
        outSR: '4326',
        resultRecordCount: '200',
      });
      
      console.log('Trying fallback query without geometry filter...');
      
      try {
        const fallbackResponse = await fetchWithRetry(`${NPS_TRAILS_URL}?${fallbackParams.toString()}`);
        const fallbackData = await fallbackResponse.json();
        
        if (!fallbackData.error && fallbackData.features?.length > 0) {
          console.log(`Fallback found ${fallbackData.features.length} features`);
          
          // Client-side filter by bounds
          const filteredFeatures = (fallbackData.features || []).filter((f: any) => {
            if (!f.geometry?.coordinates) return false;
            const coords = f.geometry.type === 'LineString' 
              ? f.geometry.coordinates[0]
              : f.geometry.coordinates[0]?.[0];
            if (!coords) return false;
            const [lng, lat] = coords;
            return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
          });
          
          console.log(`After bounds filter: ${filteredFeatures.length} features`);
          
          return new Response(
            JSON.stringify({ type: 'FeatureCollection', features: filteredFeatures }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
      }
      
      // Both queries failed - return empty with metadata
      return new Response(
        JSON.stringify({ 
          type: 'FeatureCollection', 
          features: [],
          _meta: { 
            error: 'api_error', 
            code: data.error.code,
            message: 'NPS trail data temporarily unavailable'
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const featureCount = data.features?.length || 0;
    console.log(`Found ${featureCount} trail features`);

    // Return successful response
    return new Response(
      JSON.stringify({
        type: 'FeatureCollection',
        features: data.features || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('NPS trails error:', error);
    
    return new Response(
      JSON.stringify({ 
        type: 'FeatureCollection', 
        features: [],
        _meta: { error: 'internal_error' }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
