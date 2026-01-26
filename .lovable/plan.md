

# Phase 2 Completion Plan
## Community Tag System — Remaining Tasks

---

## Current Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Database Schema | Complete | 4 tables + RLS + aggregation function + 12 seed tags |
| `usePlaceTags.ts` Hook | Complete | All CRUD operations, signals, suggestions |
| Feature Flag | Complete | `COMMUNITY_TAGS_ENABLED: false` |
| Admin TagManagement Page | Complete | Full CRUD, moderation queue, rebuild aggregates |
| Admin Sidebar Nav | Complete | "Community Tags" link added |
| App.tsx Route | Complete | `/admin/tags` route registered |

**Remaining: User-facing components and data integration**

---

## Remaining Tasks

### Task 1: Add `google_types` to Place Data Flow

**Why:** The `PlaceTagSubmission` component needs to filter canonical tags by applicable Google place types. Currently, `google_types` is not included in the place query or interface.

**Files to modify:**

1. **`src/hooks/usePublicPlaces.ts`**
   - Add `google_types` to the Supabase select query

2. **`src/components/directory/PlaceDetailModal.tsx`**
   - Add `google_types: string[] | null` to the `PlaceDetail` interface

3. **`src/components/directory/DirectoryPlaceCard.tsx`**
   - Add `google_types: string[] | null` to the `DirectoryPlace` interface

---

### Task 2: Create `PlaceTagDisplay` Component

**New file:** `src/components/directory/PlaceTagDisplay.tsx`

**Purpose:** Display community tags that meet k-threshold for any user viewing a place.

**Behavior:**
- Queries `usePlaceTagAggregates(placeId)` from the hook
- Only renders if `COMMUNITY_TAGS_ENABLED` is true
- Only shows tags where `meets_k_threshold = true`
- Uses language guardrail: "Community tagged as..."
- Empty state: hidden (no "No tags" message)

**UI:**
- Horizontal row of small badges grouped by category
- Subtle styling to not compete with primary place info
- Tooltip on hover showing tag description

---

### Task 3: Create `PlaceTagSubmission` Component

**New file:** `src/components/directory/PlaceTagSubmission.tsx`

**Purpose:** Allow users to add/remove tag signals on places they have saved.

**Props:**
```typescript
interface PlaceTagSubmissionProps {
  placeId: string;
  placeGoogleTypes: string[] | null;
}
```

**Behavior:**
- Only renders if `COMMUNITY_TAGS_ENABLED` is true
- Fetches applicable tags via `useActiveCanonicalTags(placeGoogleTypes)`
- Fetches user's current signals via `useUserTagSignals(placeId)`
- Computes which tags user has currently "added" (net positive signals)
- Toggle creates either "add" or "remove" signal via `useSubmitTagSignal`
- "Suggest a tag" link opens a simple dialog

**UI:**
- Collapsible section with header: "Help others discover this place"
- Grid of toggle-able tag chips (filled = active, outline = inactive)
- Grouped by category with subtle labels
- Small "Suggest a tag" text link at bottom
- Follows language guardrails (no "Rate this place")

---

### Task 4: Create Tag Suggestion Dialog

**New file:** `src/components/directory/TagSuggestionDialog.tsx`

**Purpose:** Simple form for users to suggest new canonical tags.

**Fields:**
- `suggested_label` (required): Text input
- `suggested_category` (optional): Select dropdown (culture, accessibility, social, outdoor)
- `rationale` (optional): Textarea

**Behavior:**
- Uses `useSubmitTagSuggestion` mutation
- Shows success toast on submission
- Closes dialog automatically

---

### Task 5: Integrate Components into PlaceDetailModal

**File:** `src/components/directory/PlaceDetailModal.tsx`

**Changes:**
1. Import feature flag and new components
2. After `PlaceLinkedContent`, add:

```tsx
{/* Community Tags Display - visible to all users */}
{FEATURE_FLAGS.COMMUNITY_TAGS_ENABLED && (
  <PlaceTagDisplay placeId={place.id} />
)}

{/* Community Tags Submission - only for saved places */}
{FEATURE_FLAGS.COMMUNITY_TAGS_ENABLED && saved && (
  <PlaceTagSubmission 
    placeId={place.id} 
    placeGoogleTypes={place.google_types} 
  />
)}
```

---

### Task 6: Testing Checklist

| Test | Expected Result |
|------|-----------------|
| Feature flag OFF | No tag UI visible anywhere |
| Feature flag ON, not saved | Only PlaceTagDisplay visible |
| Feature flag ON, saved | Both display and submission visible |
| Submit "add" signal | Tag chip toggles to filled state |
| Submit "remove" signal | Tag chip toggles to outline state |
| Tag with <3 taggers | Not visible in PlaceTagDisplay |
| Sensitive tag with <5 taggers | Not visible in PlaceTagDisplay |
| Rebuild Aggregates button | Updates visible tags correctly |
| Suggest tag | Creates pending entry in admin queue |
| Language guardrails | No "This place is..." copy anywhere |

---

## Files Summary

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/hooks/usePublicPlaces.ts` | Add `google_types` to query |
| Modify | `src/components/directory/PlaceDetailModal.tsx` | Add to interface + integrate components |
| Modify | `src/components/directory/DirectoryPlaceCard.tsx` | Add to interface |
| Create | `src/components/directory/PlaceTagDisplay.tsx` | Show aggregated tags |
| Create | `src/components/directory/PlaceTagSubmission.tsx` | User tag signal UI |
| Create | `src/components/directory/TagSuggestionDialog.tsx` | Suggest new tags form |

---

## Build Order

```text
Step 1: Data Layer Update
├── Add google_types to usePublicPlaces query
├── Update PlaceDetail interface
└── Update DirectoryPlace interface

Step 2: Display Component
├── Create PlaceTagDisplay.tsx
└── Test with feature flag enabled

Step 3: Submission Component
├── Create TagSuggestionDialog.tsx
├── Create PlaceTagSubmission.tsx
└── Test toggle behavior

Step 4: Integration
├── Wire components into PlaceDetailModal
├── Test full flow with saved/unsaved places
└── Verify language guardrails
```

---

## Language Guardrails Enforcement

All UI copy must follow these patterns:

| Location | Text |
|----------|------|
| PlaceTagDisplay header | "Community tagged as" (or no header, just badges) |
| PlaceTagSubmission header | "Help others discover this place" |
| Empty display state | Component hidden (not "No tags") |
| Tag suggestion prompt | "Suggest a tag that's missing" |
| Success toast | "Thank you for helping improve community insights" |

---

## Success Criteria

| Metric | Target |
|--------|--------|
| google_types flows through to modal | Verified |
| Tags display with k-threshold enforcement | Verified |
| Tag submission creates signals (not direct writes) | Verified |
| Saved-place gating works | Verified |
| Feature flag controls visibility | Verified |
| Language guardrails enforced | Verified |
| Admin can see all aggregates | Verified |
| Public only sees threshold-met tags | Verified |

