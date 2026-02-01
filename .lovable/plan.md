

# Plan: One Image Per Park Refactor

## Overview

This refactor simplifies trail imagery by moving from 200+ individual trail photos to a single high-quality "hero" image per National Park. Trail UIs will fall back to the parent park's image, ensuring geographic accuracy (desert parks show deserts, tropical parks show tropical landscapes) while dramatically reducing maintenance burden.

## Current State

- **Trail Interface** (`src/lib/trail-data.ts`): Each trail has optional `photoUrl` and `photoCredit` fields
- **Park Interface** (`src/lib/national-parks-data.ts`): Parks have no image fields currently
- **UI Components**: TrailDetailSheet, TrailListPanel, and TrailMarker all render trail-specific images when available

## What Changes

### Phase 1: Add Park Hero Images

Extend the `NationalPark` interface with image fields:

```text
national-parks-data.ts
+-------------------------------+
| NationalPark interface        |
| + heroImageUrl: string        |
| + heroImageCredit: string     |
+-------------------------------+
```

Add a curated hero image URL and credit to each of the 63 parks in the `nationalParks` array, sourced from NPS.gov or geographically-accurate Unsplash photos.

### Phase 2: Create Image Resolution Helper

Add a new utility function in `trail-data.ts`:

```text
getTrailImage(trail, parkId)
├── If trail.photoUrl exists → return trail.photoUrl + credit
└── Else → lookup park by parkId → return park.heroImageUrl + credit
```

This enables gradual migration: high-value trails can keep custom images while others inherit from the park.

### Phase 3: Update UI Components

Modify the three components that render trail images to use the new helper:

| Component | Change |
|-----------|--------|
| `TrailListPanel.tsx` | Use `getTrailImage()` for TrailCard photos |
| `TrailDetailSheet.tsx` | Use `getTrailImage()` for hero photo |
| `TrailMarker.tsx` | Use `getTrailImage()` for popup photo |

### Phase 4: Clean Up Trail Data

Remove redundant `photoUrl` and `photoCredit` from most trails:

- **Keep**: Trails with genuinely unique, accurate imagery
- **Remove**: Duplicate Unsplash URLs used across 10+ trails
- **Remove**: Geographically inaccurate images (forest photo on desert trail)

This reduces `src/lib/trail-data.ts` by approximately 400+ lines of photo metadata.

---

## Files to Modify

| File | Action |
|------|--------|
| `src/lib/national-parks-data.ts` | Add `heroImageUrl` and `heroImageCredit` to interface + all 63 park entries |
| `src/lib/trail-data.ts` | Add `getTrailImage()` helper + remove redundant trail photos |
| `src/components/map/TrailListPanel.tsx` | Use `getTrailImage()` in TrailCard |
| `src/components/map/TrailDetailSheet.tsx` | Use `getTrailImage()` for hero photo |
| `src/components/map/TrailMarker.tsx` | Use `getTrailImage()` in popup content |

---

## Image Sourcing Strategy

For the 63 park hero images, prioritize in this order:

1. **NPS.gov Media Library** - Official, free, geographically accurate
2. **Unsplash with specific park name search** - High quality, properly licensed
3. **Wikipedia Commons** - CC-licensed backup option

Focus on iconic views that immediately identify the park:
- Grand Canyon: layered canyon walls
- Joshua Tree: Joshua trees in desert
- Mammoth Cave: cave interior or historic entrance
- Gateway Arch: the Arch with St. Louis skyline

---

## Technical Details

### Updated Interface (national-parks-data.ts)

```typescript
export interface NationalPark {
  id: string;
  name: string;
  state: string;
  states: string[];
  lat: number;
  lng: number;
  established: number;
  acreage: number;
  npsUrl: string;
  description: string;
  heroImageUrl: string;      // NEW
  heroImageCredit: string;   // NEW
}
```

### Image Resolution Helper (trail-data.ts)

```typescript
import { nationalParks } from './national-parks-data';

interface TrailImage {
  url: string;
  credit: string;
}

export function getTrailImage(trail: Trail, parkId: string): TrailImage | null {
  // Prefer trail-specific image if available
  if (trail.photoUrl) {
    return { url: trail.photoUrl, credit: trail.photoCredit || 'Unsplash' };
  }
  
  // Fall back to park hero image
  const park = nationalParks.find(p => p.id === parkId);
  if (park?.heroImageUrl) {
    return { url: park.heroImageUrl, credit: park.heroImageCredit };
  }
  
  return null;
}
```

### Component Update Example (TrailListPanel.tsx)

```typescript
import { getTrailImage } from '@/lib/trail-data';

// In TrailCard component:
const trailImage = getTrailImage(trail, parkId);

{trailImage && !imageError ? (
  <div className="relative h-32 w-full">
    <img 
      src={trailImage.url} 
      alt={trail.name}
      // ... rest of img props
    />
    {/* Credit badge uses trailImage.credit */}
  </div>
) : (
  // Fallback placeholder
)}
```

---

## Benefits

| Before | After |
|--------|-------|
| 200+ individual trail images to maintain | 63 park images + optional trail overrides |
| Duplicate images across unrelated parks | Each park has unique, curated imagery |
| Desert trails showing forests | Geographic accuracy guaranteed |
| Cave parks with outdoor mountain photos | Context-appropriate images |

---

## Risk Mitigation

- **Fallback pattern**: Trails without images gracefully show park image, not broken state
- **Optional override**: Exceptional trails can still have custom photos
- **No data loss**: Trail photo fields remain in interface, just become optional with fallback

