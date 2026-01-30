

# Explicit National Park Mapping for Places

Add a `national_park_id` column to the `places` table that allows admins to definitively link trailheads and hiking areas to specific National Parks. This eliminates false positives from geographic/type-based heuristics.

## Why This Approach?

| Approach | Accuracy | False Positives | Maintenance |
|----------|----------|-----------------|-------------|
| Geographic radius | ~70% | High (overlapping parks, nearby forests) | None |
| Google type matching | ~50% | Very high (`park` matches municipal parks) | None |
| **Explicit mapping** | **100%** | **Zero** | Admin sets once |

## Architecture

```text
places table
├── id (uuid)
├── name
├── google_types[]
├── lat, lng
└── national_park_id (NEW) ──────> References static park IDs
                                    from national-parks-data.ts
                                    e.g., "yosemite", "yellowstone"
```

The `national_park_id` column stores the park's string ID (not a foreign key to a database table, since parks are defined in static TypeScript data).

## Implementation

### 1. Database Migration

Add a nullable `national_park_id` column to the `places` table:

```sql
ALTER TABLE public.places
ADD COLUMN national_park_id text;

COMMENT ON COLUMN public.places.national_park_id IS
  'Optional link to a National Park ID from the static parks data. Used to show "Explore Trails" button in Place modal.';
```

### 2. Update TypeScript Types

The `usePlaces` hook and `Place` interface will automatically include the new column after migration.

Key changes:
- `src/hooks/usePlaces.ts`: Add `national_park_id` to the `Place` interface and `CreatePlaceInput`
- `src/hooks/usePublicPlaces.ts`: Add `national_park_id` to the select query
- `src/hooks/useMapPlaces.ts`: Add `national_park_id` to the select query

### 3. Admin Place Edit Form

Add a National Park selector dropdown to `PlaceDetailEdit.tsx`:

| Field | Description |
|-------|-------------|
| Label | "National Park Link" |
| Type | Select dropdown |
| Options | All 63 parks from `nationalParks` array + "None" |
| Helper Text | "Link this place to a National Park to show 'Explore Trails' button" |
| Position | After Metro Area assignment section |

The dropdown will:
- Import `nationalParks` from `src/lib/national-parks-data.ts`
- Sort parks alphabetically by name for easy selection
- Show park name with state abbreviation (e.g., "Yosemite (CA)")
- Save the park's `id` string (e.g., "yosemite") to the `national_park_id` column

### 4. Place Detail Modal Enhancement

Update `PlaceDetailModal.tsx` to show the "Explore Trails" button when a place has a `national_park_id`:

```text
┌─────────────────────────────────────────────────┐
│  [Mountain Icon]  Part of Yosemite National Park│
│                                                 │
│  Explore trails, viewpoints, and hiking info   │
│  on our dedicated park page.                   │
│                                                 │
│  [🥾 Explore Trails →]                          │
└─────────────────────────────────────────────────┘
```

Logic:
1. Check if `place.national_park_id` exists
2. Look up park details from static `nationalParks` array using `useMemo`
3. If found, render a highlighted card section with Link to `/places/national-parks/{parkId}`

### 5. Interface Updates

Update the `PlaceDetail` interface in `PlaceDetailModal.tsx`:

```typescript
export interface PlaceDetail {
  // ... existing fields
  national_park_id?: string | null;
}
```

## User Flow

### Admin Flow

```text
Admin opens Place Management
        │
        ▼
Selects a trailhead (e.g., "Half Dome Trailhead")
        │
        ▼
Opens Edit mode
        │
        ▼
Scrolls to "National Park Link" section
        │
        ▼
Selects "Yosemite National Park" from dropdown
        │
        ▼
Saves → national_park_id = "yosemite"
```

### User Flow

```text
User browses Places directory
        │
        ▼
Clicks "Half Dome Trailhead"
        │
        ▼
PlaceDetailModal opens
        │
        ▼
System checks: national_park_id = "yosemite" ✓
        │
        ▼
Shows: "Part of Yosemite National Park"
       [Explore Trails] button
        │
        ▼
User clicks button
        │
        ▼
Navigates to /places/national-parks/yosemite
(interactive trail map with featured hikes)
```

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| Database migration | Create | Add `national_park_id` column |
| `src/hooks/usePlaces.ts` | Modify | Add `national_park_id` to interface |
| `src/hooks/usePublicPlaces.ts` | Modify | Add `national_park_id` to select |
| `src/hooks/useMapPlaces.ts` | Modify | Add `national_park_id` to select |
| `src/components/admin/places/PlaceDetailEdit.tsx` | Modify | Add park selector dropdown |
| `src/components/directory/PlaceDetailModal.tsx` | Modify | Add "Explore Trails" section |
| `src/components/directory/DirectoryPlaceCard.tsx` | Modify (optional) | Add park badge indicator |

## UI Design Details

### Admin Dropdown

```text
┌─ National Park Link ──────────────────────────┐
│  ┌──────────────────────────────────────────┐ │
│  │ Select a park...                       ▼ │ │
│  └──────────────────────────────────────────┘ │
│  ℹ️ Link this place to show "Explore Trails"  │
│     button in the public directory            │
└───────────────────────────────────────────────┘
```

Dropdown options (sorted alphabetically):
```text
• None (no park link)
• Acadia National Park (ME)
• Arches National Park (UT)
• Badlands National Park (SD)
• ...
• Zion National Park (UT)
```

### Public Modal Section

Styled to match existing sections with a subtle outdoor theme:

- Background: Light emerald/forest tint (`bg-emerald-50/50`)
- Icon: Mountain icon from Lucide (`Mountain`)
- Park name: Bold, linked to NPS website
- Description: Brief invitation to explore trails
- Button: Primary variant with hiking boot emoji

## Advantages

1. **Zero false positives**: Only shows "Explore Trails" when admin explicitly links
2. **Full coverage**: Works for any outdoor place type, not just `hiking_area`
3. **Simple maintenance**: One-time admin action per place
4. **Flexible**: Can link campgrounds, visitor centers, lodges - not just trailheads
5. **Reversible**: Admin can remove the link at any time

## Future Considerations

- Could add a bulk-assign tool for places within park boundaries
- Could auto-suggest park links based on proximity (admin confirms)
- Could show park-linked places on the National Park detail pages

