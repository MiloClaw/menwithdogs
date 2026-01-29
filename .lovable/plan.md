

# Trail Blazer Context Display — Launch Completion Plan

## Objective

Close the contributor loop by rendering approved Trail Blazer context on `PlaceDetailModal`. This is the **sole launch-blocking item**.

---

## Part 1: Database RLS Policy Addition

### Problem

Current RLS policies on `trail_blazer_submissions`:
- Users can view only their own submissions
- Admins can manage all
- **No public SELECT for approved content**

Without this, the frontend cannot fetch approved context for a place.

### Solution

Add a new RLS policy:

```sql
CREATE POLICY "Anyone can view approved submissions"
ON trail_blazer_submissions
FOR SELECT
USING (status = 'approved');
```

This allows:
- All users (including anonymous) to read approved submissions
- No exposure of pending, declined, or revision-needed content
- No exposure of user identity beyond what's displayed

---

## Part 2: New Hook — `usePlaceTrailBlazerContext`

### Purpose

Fetch approved Trail Blazer context for a specific place.

### File: `src/hooks/usePlaceTrailBlazerContext.ts`

```typescript
interface PlaceContext {
  id: string;
  context_types: string[];
  context_text: string;
  has_external_link: boolean;
  external_url: string | null;
  external_content_type: string | null;
  external_summary: string | null;
  submitted_at: string;
}
```

### Behavior

1. Query `trail_blazer_submissions` where:
   - `place_id` equals the given place ID
   - `status = 'approved'`
2. Order by `submitted_at` descending (most recent first)
3. Return array of approved context entries
4. Handle loading/error states

### Query Pattern

```typescript
const { data, isLoading } = await supabase
  .from('trail_blazer_submissions')
  .select('id, context_types, context_text, has_external_link, external_url, external_content_type, external_summary, submitted_at')
  .eq('place_id', placeId)
  .eq('status', 'approved')
  .order('submitted_at', { ascending: false });
```

---

## Part 3: New Component — `PlaceTrailBlazerContext`

### Purpose

Render approved Trail Blazer context within `PlaceDetailModal`.

### File: `src/components/directory/PlaceTrailBlazerContext.tsx`

### Design Principles

Following the established pattern in `PlaceLinkedContent.tsx`:

1. **Conditional render** — Only show section if approved context exists
2. **Place-first framing** — Header: "Local Insight" (not "Contributor content")
3. **No contributor identity** — No names, avatars, or attribution
4. **Context type badges** — Show what kind of insight this is
5. **Optional external link** — Clean, non-promotional link display
6. **Separator before section** — Visual consistency

### UI Structure

```text
───────────────────────────────────────────
Local Insight
───────────────────────────────────────────
[Seasonal] [Activity Insight]

"The Maroon Bells area is best visited in 
late September when the aspen leaves turn 
gold. Arrive before 8am to avoid the crowd 
shuttle requirement. The hike to Crater Lake 
is moderate but can be icy in early fall..."

🔗 Read more: example.com/trail-guide
   "Comprehensive guide to Maroon Bells"
───────────────────────────────────────────
```

### Props

```typescript
interface PlaceTrailBlazerContextProps {
  placeId: string;
}
```

### Component Logic

1. Fetch context using `usePlaceTrailBlazerContext(placeId)`
2. If loading or no approved context, return `null`
3. Render section with:
   - Separator
   - Header with subtle icon (e.g., `MessageSquare` or `Info`)
   - Context type badges using `getContextTypeLabel()`
   - Context text (full display, no truncation)
   - External link (if present and approved)

---

## Part 4: Integration into PlaceDetailModal

### File: `src/components/directory/PlaceDetailModal.tsx`

### Changes

1. Import new component:
   ```typescript
   import PlaceTrailBlazerContext from '@/components/directory/PlaceTrailBlazerContext';
   ```

2. Add component after `PlaceLinkedContent` (around line 375):
   ```typescript
   {/* Linked Content: Events & Announcements */}
   <PlaceLinkedContent placeId={place.id} placeName={place.name} placeWebsite={place.website_url} />

   {/* Trail Blazer Context: Local Insight */}
   <PlaceTrailBlazerContext placeId={place.id} />

   {/* Place Attributes: Google-verified + Community tagged */}
   <Separator />
   <PlaceAttributeBadges place={place} />
   ```

### Rationale for Placement

- **After events/announcements** — Timely content first
- **Before attribute badges** — Context is richer than tags
- **Self-contained section** — Handles its own separator

---

## Part 5: Settings → Contributions Link (Strongly Recommended)

### File: `src/pages/Settings.tsx`

### Current State (lines 106-125)

Trail Blazer card links only to `/contribute`.

### Enhancement

Add secondary link or update copy to include access to `/contributions`:

**Option A: Two-line description with link**
```tsx
<div className="flex-1 min-w-0">
  <h3 className="font-medium text-base mb-0.5">Trail Blazer</h3>
  <p className="text-sm text-muted-foreground">
    <Link to="/contribute" className="text-primary hover:underline">Add context</Link>
    {' · '}
    <Link to="/contributions" className="hover:underline">View your contributions</Link>
  </p>
</div>
```

**Option B: Card with expandable actions (simpler)**

Update the single card to link to `/contributions` with a CTA to add new context there.

### Recommendation

Option A provides clearest access to both actions without changing navigation patterns.

---

## Part 6: Privacy Policy Update

### File: `src/pages/Privacy.tsx`

### Section to Add

Insert as new Section 3.5 (after "Information You Provide"):

```tsx
<p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
  <strong className="text-foreground">Trail Blazer Contributions:</strong>
</p>
<p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
  If you participate in our Trail Blazer contributor program, we collect:
</p>
<ul className="list-disc list-inside text-sm md:text-base text-muted-foreground leading-relaxed space-y-2 ml-4 mb-4">
  <li>Application information (expertise areas, portfolio links, place references)</li>
  <li>Contextual annotations you submit about places</li>
  <li>Optional external links to your existing published work</li>
</ul>
<p className="text-sm md:text-base text-muted-foreground leading-relaxed">
  Trail Blazer contributions are reviewed before publication and appear anonymously—your 
  identity is not displayed alongside your contributions. You may view and manage your 
  submissions through your Settings.
</p>
```

### Update "Last Updated" Date

Change line 9 from "December 2024" to "January 2026".

---

## Implementation Order

| Step | Task | Blocking? |
|------|------|-----------|
| 1 | Add RLS policy for public SELECT on approved submissions | Yes |
| 2 | Create `usePlaceTrailBlazerContext.ts` hook | Yes |
| 3 | Create `PlaceTrailBlazerContext.tsx` component | Yes |
| 4 | Integrate into `PlaceDetailModal.tsx` | Yes |
| 5 | Update `Settings.tsx` with contributions link | No (recommended) |
| 6 | Update `Privacy.tsx` with Trail Blazer disclosure | No (recommended) |

---

## Files Summary

### New Files (2)

| Path | Purpose |
|------|---------|
| `src/hooks/usePlaceTrailBlazerContext.ts` | Fetch approved context for a place |
| `src/components/directory/PlaceTrailBlazerContext.tsx` | Render context section in modal |

### Modified Files (3)

| Path | Change |
|------|--------|
| `src/components/directory/PlaceDetailModal.tsx` | Add `PlaceTrailBlazerContext` component |
| `src/pages/Settings.tsx` | Add link to `/contributions` |
| `src/pages/Privacy.tsx` | Add Trail Blazer disclosure section |

### Database Changes (1)

| Change | Purpose |
|--------|---------|
| Add RLS policy on `trail_blazer_submissions` | Enable public read of approved content |

---

## Post-Implementation Validation

After implementation, verify:

1. **Approve a test Trail Blazer application** (admin action)
2. **Submit context as that Trail Blazer** (contributor action)
3. **Approve the submission** (admin action)
4. **View the place in directory** (public action)
5. **Confirm context appears** in PlaceDetailModal

This completes the contributor loop and achieves launch readiness.

---

## What This Intentionally Excludes

- Contributor attribution (names, avatars)
- Performance metrics (views, engagement)
- Edit/revise flow for contributors (post-launch)
- Multiple context entries display logic (first approved is sufficient for launch)

