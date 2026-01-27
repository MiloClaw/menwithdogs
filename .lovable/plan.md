
# Place Modal Enhancement Review

## Current State Analysis

The Place Detail Modal (`PlaceDetailModal.tsx`) is well-structured with:
- Photo gallery with navigation
- Basic info (name, category, rating, price, open status)
- Contact details (address, phone, website, directions)
- Opening hours (collapsible)
- `PlaceLinkedContent` component (events & announcements at this venue)
- `PlaceAttributeBadges` component (Google Verified + Community tags)
- Action buttons (Visit Website, Directions)

### What's Working Well
1. **Google Verified badges** are now populated and displaying
2. **TagSuggestionDialog** already accepts `placeId` and `placeName` props
3. **PlaceLinkedContent** shows events/announcements for the venue
4. **Share functionality** via Web Share API with clipboard fallback

### Gaps Identified

| Gap | Current State | Recommendation |
|-----|---------------|----------------|
| **User tag suggestions** | `TagSuggestionDialog` exists but is NOT rendered in modal | Add "Suggest a tag" button for authenticated users who saved the place |
| **Connected places** | No links to parent geo (National Park, metro) | Add "Part of [National Park]" or "Explore [City]" links |
| **PlaceTagSubmission** | Uses deprecated `COMMUNITY_TAGS_ENABLED` flag | Repurpose as suggestion-only flow since admin moderation is active |
| **Related places** | Not shown | Could show "Nearby" or "Similar" places |

---

## Proposed Enhancements

### 1. Add "Suggest a Tag" for Users (Quick Win)

**Location:** After `PlaceAttributeBadges`, before action buttons

**Logic:**
- Only show for authenticated users who have saved this place
- Opens `TagSuggestionDialog` with `placeId` and `placeName` pre-filled
- Language guardrail: "Suggest a tag to help others discover this place"

```text
┌──────────────────────────────────────────┐
│ Place Attributes Section                 │
│                                          │
│ ✓ Verified by Google                     │
│ [Dog Friendly] [Wheelchair Accessible]   │
│                                          │
│ 👥 Community tagged                      │
│ [Bear Crowd] [Sunset Views]              │
│                                          │
│ ─────────────────────────────────────    │
│ [+ Suggest a tag] ← NEW (for saved)     │
└──────────────────────────────────────────┘
```

**Files to modify:**
- `PlaceDetailModal.tsx` — Add conditional render of suggest button + dialog

---

### 2. Add "Connected Places" Section

**Concept:** Show hierarchical or geographic connections

**Possible connections:**
1. **National Park parent** — If this trailhead/beach is inside a National Park, link to `/places/national-parks/[parkId]`
2. **City page** — Link to explore more places in the same city
3. **Metro area** — Could show "Part of San Diego Metro"

**Implementation approach:**

Option A: Use `place_geo_areas` to detect if place is in a geo_area of type `national_park`
Option B: Use `google_types` array to check for `national_park` or `hiking_area` and match to static park data

**Recommended:** Option A with database extension

```text
┌──────────────────────────────────────────┐
│ 🏔️ Part of                              │
│ Torrey Pines State Natural Reserve →    │
│                                          │
│ 📍 Explore La Jolla                     │
│ View all places in La Jolla →           │
└──────────────────────────────────────────┘
```

**Files to create/modify:**
- New component: `PlaceConnectedLinks.tsx`
- Hook: `usePlaceParentGeo` (fetch geo_areas of type `national_park`, `state_park`, etc.)
- Modify `PlaceDetailModal.tsx` to render the new component

---

### 3. Improve Tag Suggestion Flow (PlaceTagSubmission Repurpose)

**Current issue:** `PlaceTagSubmission.tsx` is gated by `COMMUNITY_TAGS_ENABLED: false`

**Recommendation:** Create a simplified version that only surfaces the suggestion button, not the toggle-based tag application (since admin moderation is now the flow).

**New component:** `PlaceSuggestTagButton.tsx`

```tsx
// Shows for authenticated users who saved the place
// Opens TagSuggestionDialog with place context
<Button variant="ghost" onClick={() => setSuggestionOpen(true)}>
  <Plus className="h-4 w-4 mr-1" />
  Suggest a tag
</Button>
```

---

### 4. Visual Enhancements to PlaceAttributeBadges

**Current:** Uses `UtensilsCrossed` for Restroom (misleading icon)

**Fix:** Use `Bath` or custom icon for restroom

**Additional suggestion:** Add tooltips explaining what each badge means

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
      <Badge>Dog Friendly</Badge>
    </TooltipTrigger>
    <TooltipContent>Verified by Google Places</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## Implementation Summary

### Phase 1: Quick Wins (Minimal Changes)

| Task | File | Effort |
|------|------|--------|
| Add "Suggest a tag" button to modal | `PlaceDetailModal.tsx` | Low |
| Pass `placeId` + `placeName` to existing dialog | Already done in `TagSuggestionDialog.tsx` | Done |
| Fix restroom icon | `PlaceAttributeBadges.tsx` | Trivial |

### Phase 2: Connected Places (New Feature)

| Task | File | Effort |
|------|------|--------|
| Create `PlaceConnectedLinks.tsx` | New component | Medium |
| Create `usePlaceParentGeo` hook | New hook | Medium |
| Add city/metro links | Modal integration | Low |
| Database: Add `national_park` type to geo_areas | Migration | Low |

### Phase 3: Polish

| Task | File | Effort |
|------|------|--------|
| Add tooltips to attribute badges | `PlaceAttributeBadges.tsx` | Low |
| Deprecate/remove `PlaceTagSubmission.tsx` | Cleanup | Low |

---

## Technical Specifications

### New Component: PlaceConnectedLinks

```typescript
interface PlaceConnectedLinksProps {
  placeId: string;
  city: string | null;
  state: string | null;
  googleTypes: string[] | null;
}

// Renders:
// - Link to parent National/State Park if detected
// - Link to city directory page
// - Link to metro area if assigned
```

### New Hook: usePlaceParentGeo

```typescript
export function usePlaceParentGeo(placeId: string | undefined) {
  // Query place_geo_areas for type in ['national_park', 'state_park']
  // Return parent geo info if found
}
```

### Database Consideration

Currently `geo_areas.type` includes: `metro`, `county`, `city`

**To add:** `national_park`, `state_park` types

This would allow places like "Blacks Beach Trailhead" to be linked to "Torrey Pines State Natural Reserve" via the `place_geo_areas` junction table.

---

## Priority Recommendation

**Start with Phase 1** — Adding the "Suggest a tag" button is a quick win that immediately enables the user → admin → tag flow that was designed in the two-tier system. The Connected Places feature is valuable but requires more infrastructure.
