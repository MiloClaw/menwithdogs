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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { parkCode, bounds } = await req.json() as RequestBody;

    if (!bounds || bounds.length !== 4) {
      return new Response(
        JSON.stringify({ error: 'Invalid bounds parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const [minLng, minLat, maxLng, maxLat] = bounds;

    // Use simple bbox format: xmin,ymin,xmax,ymax
    const geometryParam = `${minLng},${minLat},${maxLng},${maxLat}`;

    // Build query parameters
    const params = new URLSearchParams({
      where: parkCode ? `UnitCode='${parkCode.toUpperCase()}'` : '1=1',
      geometry: geometryParam,
      geometryType: 'esriGeometryEnvelope',
      inSR: '4326',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: 'TrailName,TrailClass,TrailSurface,Miles,UnitCode',
      f: 'geojson',
      outSR: '4326',
    });

    console.log(`Fetching NPS trails for parkCode: ${parkCode || 'all'}, bounds: ${geometryParam}`);

    let response = await fetch(`${NPS_TRAILS_URL}?${params.toString()}`);
    let data = await response.json();
    
    // Check for ArcGIS error response
    if (data.error) {
      console.error(`ArcGIS error with UnitCode filter:`, JSON.stringify(data.error));
      // Try without the UnitCode filter as fallback
      params.set('where', '1=1');
      response = await fetch(`${NPS_TRAILS_URL}?${params.toString()}`);
      data = await response.json();
      
      if (data.error) {
        console.error(`ArcGIS error with bounds-only query:`, JSON.stringify(data.error));
        // Return empty FeatureCollection instead of error
        return new Response(
          JSON.stringify({ type: 'FeatureCollection', features: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const featureCount = data.features?.length || 0;
    console.log(`Found ${featureCount} trail features`);

    // If no features with UnitCode, try bounds-only
    if (featureCount === 0 && parkCode) {
      console.log('No features with UnitCode filter, retrying with bounds only...');
      params.set('where', '1=1');
      
      response = await fetch(`${NPS_TRAILS_URL}?${params.toString()}`);
      data = await response.json();
      
      if (!data.error) {
        console.log(`Found ${data.features?.length || 0} trail features with bounds-only query`);
      }
    }

    // Ensure we always return valid GeoJSON
    if (!data.type || data.type !== 'FeatureCollection') {
      return new Response(
        JSON.stringify({ type: 'FeatureCollection', features: data.features || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in nps-trails function:', error);
    
    return new Response(
      JSON.stringify({ 
        type: 'FeatureCollection',
        features: []
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
