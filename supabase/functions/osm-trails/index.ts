import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

interface RequestBody {
  bounds: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat] from frontend
}

interface OSMElement {
  type: 'way' | 'relation';
  id: number;
  tags?: Record<string, string>;
  geometry?: Array<{ lat: number; lon: number }>;
  members?: Array<{ type: string; ref: number; role: string; geometry?: Array<{ lat: number; lon: number }> }>;
}

interface OverpassResponse {
  elements: OSMElement[];
}

// Retry with exponential backoff
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)));
        console.log(`Retry attempt ${attempt + 1}...`);
      }
      
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      // If rate limited, wait and retry
      if (response.status === 429) {
        console.log('Rate limited, waiting before retry...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      console.error(`Fetch attempt ${attempt + 1} failed:`, error);
    }
  }
  
  throw lastError || new Error('All fetch attempts failed');
}

// Convert OSM way geometry to GeoJSON coordinates [lng, lat]
function wayToCoordinates(geometry: Array<{ lat: number; lon: number }>): number[][] {
  return geometry.map(point => [point.lon, point.lat]);
}

// Convert OSM relation members to MultiLineString coordinates
function relationToCoordinates(members: OSMElement['members']): number[][][] {
  if (!members) return [];
  
  return members
    .filter(m => m.geometry && m.geometry.length > 0)
    .map(m => wayToCoordinates(m.geometry!));
}

// Map sac_scale to difficulty level (1-5 scale for compatibility)
function sacScaleToDifficulty(sacScale: string | undefined): number {
  if (!sacScale) return 3; // Default to moderate
  
  const mapping: Record<string, number> = {
    'hiking': 1,
    'mountain_hiking': 2,
    'demanding_mountain_hiking': 3,
    'alpine_hiking': 4,
    'demanding_alpine_hiking': 5,
    'difficult_alpine_hiking': 5,
  };
  
  return mapping[sacScale] || 3;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bounds } = await req.json() as RequestBody;

    if (!bounds || bounds.length !== 4) {
      console.error('Invalid bounds parameter:', bounds);
      return new Response(
        JSON.stringify({ type: 'FeatureCollection', features: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Frontend sends [minLng, minLat, maxLng, maxLat]
    // Overpass expects (south, west, north, east) = (minLat, minLng, maxLat, maxLng)
    const [minLng, minLat, maxLng, maxLat] = bounds;
    const bbox = `${minLat},${minLng},${maxLat},${maxLng}`;

    console.log(`Fetching OSM trails for bbox: ${bbox}`);

    // Build Overpass QL query for hiking trails
    const query = `
      [out:json][timeout:30];
      (
        way["highway"="path"](${bbox});
        way["highway"="footway"](${bbox});
        way["highway"="track"]["tracktype"~"grade[1-3]"](${bbox});
        relation["route"="hiking"](${bbox});
      );
      out body geom;
    `;

    const response = await fetchWithRetry(OVERPASS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'MainStreetIRL/1.0 (hiking trail overlay)',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      console.error(`Overpass API error: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ 
          type: 'FeatureCollection', 
          features: [],
          _meta: { error: 'api_error', status: response.status }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data: OverpassResponse = await response.json();
    console.log(`Received ${data.elements?.length || 0} OSM elements`);

    // Transform OSM elements to GeoJSON features
    const features = (data.elements || [])
      .filter(el => {
        // Filter out elements without geometry
        if (el.type === 'way') return el.geometry && el.geometry.length > 1;
        if (el.type === 'relation') return el.members && el.members.some(m => m.geometry);
        return false;
      })
      .map(el => {
        const tags = el.tags || {};
        const difficulty = sacScaleToDifficulty(tags.sac_scale);
        
        if (el.type === 'way' && el.geometry) {
          return {
            type: 'Feature' as const,
            properties: {
              TrailName: tags.name || tags.ref || 'Trail',
              TrailClass: String(difficulty),
              TrailSurface: tags.surface || 'natural',
              Miles: null, // OSM doesn't provide direct distance
              highway: tags.highway,
              sac_scale: tags.sac_scale,
            },
            geometry: {
              type: 'LineString' as const,
              coordinates: wayToCoordinates(el.geometry),
            },
          };
        }
        
        if (el.type === 'relation' && el.members) {
          const coords = relationToCoordinates(el.members);
          if (coords.length === 0) return null;
          
          return {
            type: 'Feature' as const,
            properties: {
              TrailName: tags.name || tags.ref || 'Hiking Route',
              TrailClass: String(difficulty),
              TrailSurface: tags.surface || 'natural',
              Miles: null,
              route: 'hiking',
              sac_scale: tags.sac_scale,
            },
            geometry: {
              type: 'MultiLineString' as const,
              coordinates: coords,
            },
          };
        }
        
        return null;
      })
      .filter(Boolean);

    console.log(`Transformed to ${features.length} GeoJSON features`);

    return new Response(
      JSON.stringify({
        type: 'FeatureCollection',
        features,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('OSM trails error:', error);
    
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
