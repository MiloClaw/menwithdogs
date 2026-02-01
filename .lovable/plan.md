# Plan: Complete Trail Image Cleanup (Phase 4)

## ✅ COMPLETED

The Phase 4 cleanup has been executed. All `photoUrl` and `photoCredit` fields have been removed from trail objects in `src/lib/trail-data.ts`.

### What Changed
- Removed ~1,525 `photoUrl` entries
- Removed ~1,525 `photoCredit` entries  
- File reduced from ~3,793 lines to ~2,293 lines (~1,500 lines removed)
- Trail interface still supports optional `photoUrl`/`photoCredit` for future overrides

### Result
All trails now inherit their parent park's hero image via the `getTrailImage()` fallback logic:

```
getTrailImage(trail, parkId)
├── If trail.photoUrl exists → return trail image (now rare)
└── Else → return park.heroImageUrl (default for all trails)
```

Geographic accuracy is now guaranteed across all 63 parks.
