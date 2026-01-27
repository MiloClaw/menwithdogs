
# Plan: Improve UX for User-Suggested Tags

## Summary

This plan addresses the user experience for community tag submissions and ensures the complete workflow from user suggestion through admin approval to tag display is functioning correctly.

## Current State

| Component | Status | Issue |
|-----------|--------|-------|
| Tag suggestion dialog | Working | Only available if user saved the place |
| Admin review UI | Working | Shows place context correctly |
| Tag application on approval | Fixed | Uses `useApplyPlaceTag` hook |
| RLS for public read | Fixed | Policy exists: "Anyone can read niche tags" |
| Tag display in modal | Ready | Will show once `place_niche_tags` has data |

**Critical Issue**: The previously approved "Clothing Optional" tag was approved before the fix was deployed, so it was never inserted into `place_niche_tags`. The admin needs to re-approve it to trigger the new workflow.

---

## Implementation Tasks

### Task 1: Reduce Friction for Tag Suggestions

**Problem**: Users must save a place before they can suggest a tag (high friction).

**Solution**: Allow any authenticated user to suggest tags, regardless of save status.

**File**: `src/components/directory/PlaceDetailModal.tsx`

**Current Code (lines 381-392)**:
```tsx
{isAuthenticated && saved && (
  <Button
    variant="ghost"
    ...
    onClick={() => setSuggestionOpen(true)}
  >
    <Plus className="h-4 w-4 mr-1.5" />
    Suggest a tag to help others discover this place
  </Button>
)}
```

**Proposed Change**:
```tsx
{isAuthenticated && (
  <Button
    variant="ghost"
    size="sm"
    className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto"
    onClick={() => setSuggestionOpen(true)}
  >
    <Plus className="h-4 w-4 mr-1.5" />
    Suggest a tag to help others discover this place
  </Button>
)}
```

---

### Task 2: Add Success Feedback for Tag Submissions

**Problem**: Users don't get clear feedback when their suggestion is submitted.

**File**: `src/hooks/usePlaceTags.ts` (useSubmitTagSuggestion hook, around line 220)

**Proposed Change**: Add success toast in the mutation's `onSuccess`:

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['tag-suggestions'] });
  toast({
    title: 'Tag suggested',
    description: 'Thanks for helping! We\'ll review your suggestion.',
  });
},
```

---

### Task 3: Re-approve Existing Tag to Populate place_niche_tags

**Problem**: The "Clothing Optional" tag was approved before the fix, so `place_niche_tags` remains empty.

**Solution**: Manual admin action needed:

1. Go to `/admin/tags` -> Suggestions tab
2. Change the filter to show all suggestions (not just pending)
3. Find the approved "Clothing Optional" suggestion for Blacks Beach Trailhead
4. Either:
   - Delete and re-submit the suggestion, then re-approve
   - OR run a one-time data fix query to insert the missing tag

**Alternative - Data Fix Query** (run in backend):
```sql
INSERT INTO place_niche_tags (place_id, tag, confidence, evidence_type, evidence_ref)
SELECT 
  ts.place_id,
  ct.slug,
  1.0,
  'admin_approved',
  ts.id::text
FROM tag_suggestions ts
JOIN canonical_tags ct ON LOWER(REPLACE(ts.suggested_label, ' ', '_')) = ct.slug
WHERE ts.status = 'approved'
  AND ts.place_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM place_niche_tags pnt 
    WHERE pnt.place_id = ts.place_id AND pnt.tag = ct.slug
  );
```

---

### Task 4: Add "Re-Apply" Button for Previously Approved Suggestions (Optional Enhancement)

**Problem**: Admin cannot easily re-apply tags that were approved before the fix.

**File**: `src/pages/admin/TagManagement.tsx`

**Proposed Change**: In the Suggestions tab, add a "Re-Apply" button for approved suggestions that don't have a corresponding `place_niche_tags` entry.

This would require:
1. Joining `tag_suggestions` with `place_niche_tags` to detect missing applications
2. Adding a "Re-Apply" action button for these cases

---

## Visual Flow After Implementation

```text
User Flow:
┌─────────────────────────────────────────────────────────────────┐
│ 1. User opens Place Modal (from list or map)                   │
├─────────────────────────────────────────────────────────────────┤
│ 2. User clicks "Suggest a tag to help others discover..."      │
│    (Now available to ALL authenticated users)                  │
├─────────────────────────────────────────────────────────────────┤
│ 3. Tag Suggestion Dialog opens                                 │
│    - Shows place name for context                              │
│    - User enters tag name, category, rationale                 │
├─────────────────────────────────────────────────────────────────┤
│ 4. User submits → Toast confirms "Tag suggested"               │
│    - Suggestion stored with place_id                           │
└─────────────────────────────────────────────────────────────────┘

Admin Flow:
┌─────────────────────────────────────────────────────────────────┐
│ 1. Admin opens /admin/tags → Suggestions tab                   │
├─────────────────────────────────────────────────────────────────┤
│ 2. Sees suggestion with:                                       │
│    - Suggested label                                           │
│    - Place name (e.g., "Blacks Beach Trailhead")              │
│    - User's rationale                                          │
├─────────────────────────────────────────────────────────────────┤
│ 3. Admin clicks "Approve"                                      │
│    - Checks if canonical tag exists                            │
│    - Inserts into place_niche_tags                             │
│    - Updates suggestion status                                 │
└─────────────────────────────────────────────────────────────────┘

Display Flow:
┌─────────────────────────────────────────────────────────────────┐
│ 1. User opens Place Modal                                      │
├─────────────────────────────────────────────────────────────────┤
│ 2. PlaceAttributeBadges component fetches place_niche_tags     │
├─────────────────────────────────────────────────────────────────┤
│ 3. Displays under "Community tagged" section:                  │
│    [Clothing Optional]                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/directory/PlaceDetailModal.tsx` | Remove `saved` requirement for tag suggestion button |
| `src/hooks/usePlaceTags.ts` | Add success toast in `useSubmitTagSuggestion` |

## Data Migration

Run backfill query to apply any previously-approved suggestions that weren't inserted into `place_niche_tags`.

---

## Technical Notes

- The `PlaceTagSubmission` component (for toggling existing tags) remains disabled via `COMMUNITY_TAGS_ENABLED: false`. This is intentional per the product rules - direct tag application bypasses admin moderation.
- The suggestion workflow requires admin review before tags become visible, maintaining quality control.
- All changes are consistent across list view and map view since they both use `PlaceDetailModal`.
