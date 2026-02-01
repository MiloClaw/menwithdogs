

# Plan: Complete Trail Image Cleanup (Phase 4)

## Problem Summary

The "One Image Per Park" refactor was partially completed. Park hero images were added and the fallback logic was implemented, but **Phase 4 (removing redundant trail-level photos)** was never executed.

Currently, the `getTrailImage` function correctly prioritizes trail-specific images over park hero images:

```text
getTrailImage(trail, parkId)
├── If trail.photoUrl exists → return trail image (1,525 trails still have this!)
└── Else → return park hero image
```

The 1,525 trail-level `photoUrl` entries are blocking the fallback to park hero images.

---

## What Changed vs. What Didn't

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1: Add Park Hero Images | ✅ Done | All 63 parks have `heroImageUrl` |
| Phase 2: Create Image Resolution Helper | ✅ Done | `getTrailImage()` function works |
| Phase 3: Update UI Components | ✅ Done | Components use `getTrailImage()` |
| Phase 4: Clean Up Trail Data | ❌ Missing | Redundant `photoUrl` fields still present |

---

## Solution

Remove all `photoUrl` and `photoCredit` fields from trails in `src/lib/trail-data.ts`. This will cause every trail to inherit its parent park's hero image via the fallback logic.

### Files to Modify

| File | Action |
|------|--------|
| `src/lib/trail-data.ts` | Remove `photoUrl` and `photoCredit` from all trail objects (~1,525 occurrences) |

### Example: Before and After

**Before (current):**
```typescript
{
  id: 'root-glacier-trail',
  name: 'Root Glacier Trail',
  distance: 4.0,
  difficulty: 'moderate',
  elevationGain: 400,
  description: 'Walk onto glacier from historic Kennecott.',
  trailhead: [-142.8850, 61.4850],
  photoUrl: 'https://images.unsplash.com/photo-1530041539828-114de669390e?w=800&q=80',
  photoCredit: 'Unsplash',
}
```

**After (cleaned):**
```typescript
{
  id: 'root-glacier-trail',
  name: 'Root Glacier Trail',
  distance: 4.0,
  difficulty: 'moderate',
  elevationGain: 400,
  description: 'Walk onto glacier from historic Kennecott.',
  trailhead: [-142.8850, 61.4850],
}
```

The trail will now inherit the Wrangell-St. Elias park hero image automatically.

---

## Technical Approach

Since this is a large-scale cleanup (~3,000+ lines of changes across a 3,800-line file), the implementation will:

1. Process the file in sections (by park groupings)
2. Remove all `photoUrl:` and `photoCredit:` lines from trail objects
3. Preserve the Trail interface definition (keep the optional fields for future use)

---

## Outcome

After this cleanup:
- All trails will display their parent park's hero image
- Geographic accuracy is guaranteed (desert parks show deserts, cave parks show caves)
- File size reduces by ~1,500 lines
- Future trail-specific images can still be added if needed (the interface supports it)

