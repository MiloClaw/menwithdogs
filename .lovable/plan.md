
# Replace NPS API with OpenStreetMap Overpass

Replace the failing NPS ArcGIS API with OpenStreetMap Overpass API for hiking trail polyline overlays on National Park maps.

## Current State

The existing system uses NPS ArcGIS MapServer which is returning 400 errors:
- Edge function: `supabase/functions/nps-trails/index.ts`
- Frontend hook: `src/hooks/useNPSTrails.ts`
- Map component: `src/components/map/NationalParkMap.tsx`
- Park code mapping: `src/lib/nps-codes.ts`

## OpenStreetMap Overpass Advantages

| Aspect | NPS ArcGIS (Current) | OpenStreetMap Overpass |
|--------|---------------------|------------------------|
| Reliability | Failing with 400 errors | Stable, widely used |
| Coverage | US National Parks only | Global trail data |
| API Key | None (but failing) | None required |
| Rate Limits | Unknown | Reasonable (no auth) |
| Data Format | GeoJSON (when working) | GeoJSON via out:json |

## Implementation Plan

### 1. Create New Edge Function

**File:** `supabase/functions/osm-trails/index.ts`

Replace the NPS API call with Overpass API query:

```text
Overpass Query Structure:
[out:json];
(
  way["highway"="path"](bbox);
  way["highway"="footway"](bbox);
  way["highway"="track"](bbox);
  relation["route"="hiking"](bbox);
);
out body geom;
```

Key implementation details:
- Accept bounds parameter: `[minLat, minLng, maxLat, maxLng]` (Overpass uses lat,lng order)
- Query the public Overpass API endpoint: `https://overpass-api.de/api/interpreter`
- Transform response to GeoJSON FeatureCollection format matching current interface
- Extract trail properties: name, surface, sac_scale (difficulty), highway type
- Include retry logic with exponential backoff
- Return empty FeatureCollection on failure (graceful degradation)

### 2. Create Difficulty Mapping

OSM uses `sac_scale` for hiking difficulty:

```text
sac_scale mapping:
- hiking → Easy (green)
- mountain_hiking → Easy (green)
- demanding_mountain_hiking → Moderate (yellow)
- alpine_hiking → Strenuous (red)
- demanding_alpine_hiking → Strenuous (red)
- difficult_alpine_hiking → Strenuous (red)
```

### 3. Update Frontend Hook

**File:** `src/hooks/useOSMTrails.ts` (new file)

Create a new hook that:
- Accepts bounds and parkId (parkId optional, mainly for cache keys)
- Calls the new `osm-trails` edge function
- Returns the same GeoJSON interface as the current NPS hook
- Includes helper functions for difficulty label and color mapping

### 4. Update Map Component

**File:** `src/components/map/NationalParkMap.tsx`

Changes:
- Replace `useNPSTrails` import with `useOSMTrails`
- Update layer ID constants from `nps-trails-*` to `osm-trails-*`
- Update difficulty color mapping to use OSM `sac_scale` values
- Remove dependency on `nps-codes.ts` for API calls (keep for reference)

### 5. Deprecate NPS-Specific Files

Files to remove or deprecate:
- `supabase/functions/nps-trails/index.ts` → Delete
- `src/lib/nps-codes.ts` → Can keep for reference, no longer required for trails

### 6. Update Config

**File:** `supabase/config.toml`

Add new function configuration:
```toml
[functions.osm-trails]
verify_jwt = false
```

Remove old function entry for `nps-trails`.

## Data Flow Diagram

```text
User Views Park Page
        │
        ▼
┌──────────────────┐
│ NationalParkMap  │
│ (bounds from     │
│  viewport)       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  useOSMTrails    │
│  (React Query)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌────────────────────┐
│  osm-trails      │────▶│  Overpass API      │
│  Edge Function   │     │  (overpass-api.de) │
└──────────────────┘     └────────────────────┘
         │
         ▼
┌──────────────────┐
│  GeoJSON with    │
│  trail polylines │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Mapbox GL Layer │
│  (color by       │
│   difficulty)    │
└──────────────────┘
```

## Files Summary

| File | Action |
|------|--------|
| `supabase/functions/osm-trails/index.ts` | Create |
| `src/hooks/useOSMTrails.ts` | Create |
| `src/components/map/NationalParkMap.tsx` | Modify |
| `supabase/config.toml` | Modify |
| `supabase/functions/nps-trails/index.ts` | Delete |
| `src/hooks/useNPSTrails.ts` | Delete |
| `src/lib/nps-codes.ts` | Keep (optional reference) |

## Technical Notes

### Overpass API Response Transformation

The Overpass API returns data in a specific format that needs transformation:

```text
Overpass response → Transform → GeoJSON FeatureCollection
                           │
                           ├─ Extract way coordinates
                           ├─ Map tags to properties
                           └─ Build LineString geometries
```

### Bounds Handling

Current NPS API uses `[minLng, minLat, maxLng, maxLat]`
Overpass API uses `[minLat, minLng, maxLat, maxLng]`

The edge function will handle this coordinate order conversion.

### Caching Strategy

Keep the existing React Query caching:
- `staleTime: 1 hour` (trails don't change frequently)
- `gcTime: 24 hours` (keep in memory for revisits)
