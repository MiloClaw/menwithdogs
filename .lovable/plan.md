
# Fix: Google Verified Badges Not Displaying in Place Modal

## Problem Identified

The Place Detail Modal is **missing Google-verified attribute badges** (Dog Friendly, Wheelchair Accessible, etc.) even though the data exists in the database. For example, "Blacks Beach Trailhead" has `allows_dogs=true` in the database, but the badge doesn't display.

## Root Cause

The `usePublicPlaces` hook fetches places for the directory but **does not include the six new amenity columns** in its select query. These columns were added to the database and edge functions, but the frontend query was never updated.

**Current query (missing columns):**
```
id, google_place_id, name, primary_category, city, state, 
formatted_address, rating, user_ratings_total, price_level, 
photos, stored_photo_urls, website_url, google_maps_url, 
phone_number, opening_hours, lat, lng, google_types
```

**Missing columns:**
- `allows_dogs`
- `wheelchair_accessible_entrance`
- `wheelchair_accessible_restroom`  
- `wheelchair_accessible_seating`
- `outdoor_seating`
- `has_restroom`

## Fix Required

### Update `src/hooks/usePublicPlaces.ts`

Add the six amenity columns to the select query at lines 32-52:

```typescript
.select(`
  id,
  google_place_id,
  name,
  primary_category,
  city,
  state,
  formatted_address,
  rating,
  user_ratings_total,
  price_level,
  photos,
  stored_photo_urls,
  website_url,
  google_maps_url,
  phone_number,
  opening_hours,
  lat,
  lng,
  google_types,
  allows_dogs,
  wheelchair_accessible_entrance,
  wheelchair_accessible_restroom,
  wheelchair_accessible_seating,
  outdoor_seating,
  has_restroom
`)
```

## Expected Outcome

After this fix:
- Places with Google-verified attributes will display badges
- "Blacks Beach Trailhead" will show the "Dog Friendly" badge
- Other places will show their respective verified badges (9 places have Dog Friendly, 7 have Restroom, 6 have Wheelchair Accessible based on earlier backfill)

## Technical Details

| File | Change |
|------|--------|
| `src/hooks/usePublicPlaces.ts` | Add 6 amenity columns to select query |

**Effort:** Trivial (single line additions)  
**Risk:** None - just adding columns to an existing query
