
# Fix: Admin Tag Approval Workflow Missing Tag Application Step

## Problem Identified

When an admin approves a user-submitted tag suggestion:
- The `tag_suggestions.status` is updated to `'approved'`
- **But the tag is never actually applied to the place**

Database evidence:
- `tag_suggestions` has 1 approved record for "Clothing Optional" on Blacks Beach Trailhead (`place_id: c0aca251-...`)
- `place_niche_tags` table is **completely empty** (0 records)

This means the modal correctly shows nothing because no tags have been inserted into `place_niche_tags`.

## Root Cause

The `useReviewTagSuggestion` hook in `src/hooks/usePlaceTags.ts` only updates the suggestion status:

```typescript
// Current behavior - only updates status, doesn't apply tag
const { error } = await supabase
  .from('tag_suggestions')
  .update({
    status,
    merged_into_slug: mergedIntoSlug,
    reviewed_at: new Date().toISOString(),
  })
  .eq('id', id);
```

It does NOT:
1. Create a canonical tag entry (if the tag is new)
2. Insert a record into `place_niche_tags` to link the tag to the place

## Solution

Enhance the admin approval workflow to:

1. **Show place context** in the Suggestions tab so admins know which place the tag is for
2. **When approving**, automatically apply the tag to `place_niche_tags` using the existing `useApplyPlaceTag` hook
3. **Handle canonical tag creation** - either require the tag to exist first, or prompt admin to create it

### Implementation Plan

#### Task 1: Fetch Place Context for Suggestions

**File:** `src/hooks/usePlaceTags.ts` (lines 167-186)

Update `useTagSuggestions` to join with `places` table to get the place name:

```typescript
const { data, error } = await supabase
  .from('tag_suggestions')
  .select('*, places!tag_suggestions_place_id_fkey(id, name)')
  .order('created_at', { ascending: false });
```

#### Task 2: Display Place Name in Suggestions UI

**File:** `src/pages/admin/TagManagement.tsx` (lines 308-324)

Show which place the suggestion is for in the card:

```tsx
<p className="text-sm text-muted-foreground mt-2">
  <strong>Place:</strong> {suggestion.places?.name ?? 'No place linked'}
</p>
```

#### Task 3: Update Approval Handler to Apply Tag

**File:** `src/pages/admin/TagManagement.tsx`

When approving a suggestion that has a `place_id`:
1. Check if a matching canonical tag exists by slug
2. If not, prompt admin to create it first OR auto-create it
3. Insert into `place_niche_tags` with:
   - `place_id` from suggestion
   - `tag` = canonical tag slug
   - `evidence_type` = `'admin_approved'`
   - `evidence_ref` = suggestion ID
   - `confidence` = 1.0

Create a new handler:

```typescript
const applyTag = useApplyPlaceTag(); // from usePlaceNicheTags

const handleApproveSuggestion = async (suggestion: TagSuggestion) => {
  const slug = suggestion.suggested_label
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  
  // Check if canonical tag exists
  const existingTag = tags?.find(t => t.slug === slug);
  if (!existingTag) {
    // Option A: Create it automatically
    // Option B: Show toast asking admin to create it first
    toast.error('Create this canonical tag first before approving');
    return;
  }
  
  // Apply tag to place
  if (suggestion.place_id) {
    await applyTag.mutateAsync({
      placeId: suggestion.place_id,
      tag: slug,
      evidenceRef: suggestion.id,
    });
  }
  
  // Mark suggestion as approved
  reviewSuggestion.mutate({ id: suggestion.id, status: 'approved' });
};
```

#### Task 4: Import and Use `useApplyPlaceTag`

**File:** `src/pages/admin/TagManagement.tsx`

```typescript
import { useApplyPlaceTag } from '@/hooks/usePlaceNicheTags';

// In component:
const applyTag = useApplyPlaceTag();
```

#### Task 5: Fix RLS Policy for Public Tag Display

**Issue:** The `place_niche_tags` table has admin-only RLS:
```sql
Policy: Admins can manage niche tags
Command: ALL
Using: has_role(auth.uid(), 'admin')
```

**Need to add:** A SELECT policy for public/authenticated users to read tags:

```sql
CREATE POLICY "Anyone can read niche tags"
ON place_niche_tags FOR SELECT
USING (true);
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/hooks/usePlaceTags.ts` | Join `places` table in `useTagSuggestions` query |
| `src/pages/admin/TagManagement.tsx` | Display place name in suggestion cards |
| `src/pages/admin/TagManagement.tsx` | Import `useApplyPlaceTag` hook |
| `src/pages/admin/TagManagement.tsx` | Create `handleApproveSuggestion` that applies tag + updates status |
| Database migration | Add public SELECT policy on `place_niche_tags` |

---

## Expected Outcome

After implementation:
1. Admin sees which place each tag suggestion is for
2. Clicking "Approve" on a suggestion:
   - Inserts a record into `place_niche_tags` linking the tag to the place
   - Updates suggestion status to `approved`
3. Users viewing the place modal will see "Community tagged" section with the approved tag
4. The "Clothing Optional" tag will appear on Blacks Beach Trailhead after re-approval
