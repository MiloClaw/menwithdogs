
# Fix: Tags Missing When Opening Place Modal from Map View

## Root Cause Analysis

Two issues are causing tags not to display:

### Issue 1: Google-Verified Badges Not Rendering
The `useMapPlaces` hook (used when panning the map) queries places but **omits the six amenity columns** that were recently added. When a place is fetched via map viewport, these fields are `undefined`, causing `PlaceAttributeBadges` to skip rendering.

**Data Flow:**
```text
Map pan/zoom → useMapPlaces → SELECT (missing amenity fields) → PlaceDetailModal → PlaceAttributeBadges → place.allows_dogs === undefined → No badges
```

**Additionally:** The `DirectoryPlace` TypeScript interface doesn't include the amenity fields, causing a type mismatch.

### Issue 2: Community Tags Not Rendering
The `place_niche_tags` table has **no records** for Blacks Beach Trailhead (or most places). This is expected because:
- Community tags require admin approval before appearing
- No tags have been applied yet via the admin workflow
- This is a data gap, not a code bug

---

## Implementation Plan

### Task 1: Update `useMapPlaces` Query
**File:** `src/hooks/useMapPlaces.ts`

Add the six amenity columns to the Supabase select query (lines 70-92):

```typescript
.select(`
  id,
  google_place_id,
  name,
  formatted_address,
  city,
  state,
  lat,
  lng,
  primary_category,
  rating,
  user_ratings_total,
  price_level,
  stored_photo_urls,
  photos,
  website_url,
  google_maps_url,
  phone_number,
  opening_hours,
  google_types,
  status,
  source,
  allows_dogs,
  wheelchair_accessible_entrance,
  wheelchair_accessible_restroom,
  wheelchair_accessible_seating,
  outdoor_seating,
  has_restroom
`)
```

### Task 2: Update `DirectoryPlace` Interface
**File:** `src/components/directory/DirectoryPlaceCard.tsx`

Add the amenity fields to the TypeScript interface (after line 26):

```typescript
export interface DirectoryPlace {
  id: string;
  google_place_id: string;
  name: string;
  primary_category: string;
  city: string | null;
  state: string | null;
  formatted_address: string | null;
  rating: number | null;
  user_ratings_total: number | null;
  price_level: number | null;
  photos: unknown;
  stored_photo_urls: string[] | null;
  website_url: string | null;
  google_maps_url: string | null;
  phone_number: string | null;
  opening_hours: unknown;
  lat: number | null;
  lng: number | null;
  google_types: string[] | null;
  distance?: number;
  isRelevant?: boolean;
  // Google-verified amenity attributes
  allows_dogs?: boolean | null;
  wheelchair_accessible_entrance?: boolean | null;
  wheelchair_accessible_restroom?: boolean | null;
  wheelchair_accessible_seating?: boolean | null;
  outdoor_seating?: boolean | null;
  has_restroom?: boolean | null;
}
```

---

## Why Community Tags Are Empty

The `place_niche_tags` table currently has **no records** for Blacks Beach Trailhead. This is the expected state because:

1. Community tags flow from user suggestions through admin approval
2. No users have suggested tags for this place yet
3. No admin has manually applied tags

The "Community tagged" section will appear once:
- A user suggests a tag via the "Suggest a tag" button
- An admin reviews and approves it in Tag Management
- The tag gets inserted into `place_niche_tags` with `evidence_type='admin_approved'`

---

## Technical Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| Google badges missing from map view | `useMapPlaces` query missing 6 columns | Add columns to select query |
| Type errors possible | `DirectoryPlace` interface incomplete | Add 6 optional amenity fields |
| Community tags empty | No `place_niche_tags` records exist | Data gap - no code fix needed |

---

## Expected Outcome

After these changes:
- Opening any place from the map will show "Verified by Google" badges (Dog Friendly, Wheelchair Accessible, etc.) if the data exists in the database
- Blacks Beach Trailhead will show the "Dog Friendly" badge (already has `allows_dogs: true`)
- The "Community tagged" section will remain hidden until tags are applied via the admin workflow
