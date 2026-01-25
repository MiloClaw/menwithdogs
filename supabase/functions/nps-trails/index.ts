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

    // Build geometry envelope for the bounding box query
    const geometryParam = JSON.stringify({
      xmin: minLng,
      ymin: minLat,
      xmax: maxLng,
      ymax: maxLat,
      spatialReference: { wkid: 4326 }
    });

    // Build query parameters
    const params = new URLSearchParams({
      where: '1=1', // All trails in bounds
      geometry: geometryParam,
      geometryType: 'esriGeometryEnvelope',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: 'TrailName,TrailClass,TrailSurface,Miles,UnitCode',
      f: 'geojson',
      outSR: '4326',
    });

    // If parkCode provided, filter by unit code (e.g., 'JOTR' for Joshua Tree)
    if (parkCode) {
      params.set('where', `UnitCode = '${parkCode.toUpperCase()}'`);
    }

    console.log(`Fetching NPS trails for bounds: ${bounds.join(', ')}, parkCode: ${parkCode || 'all'}`);

    const response = await fetch(`${NPS_TRAILS_URL}?${params.toString()}`);
    
    if (!response.ok) {
      console.error(`NPS API error: ${response.status} ${response.statusText}`);
      throw new Error(`NPS API returned ${response.status}`);
    }

    const data = await response.json();

    console.log(`Found ${data.features?.length || 0} trail features`);

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in nps-trails function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch trail data',
        type: 'FeatureCollection',
        features: []
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
