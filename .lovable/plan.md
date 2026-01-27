
# Simplified Two-Tier Place Attribute System

## Objective

Create a clean attribute system with only **two visual distinctions**:
1. **"Verified by Google"** - Automated from Google Places API
2. **"Community tagged"** - Admin-approved tags from user suggestions

No duplicates, no overlapping tags, equal weight for all approved community tags.

---

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    UNIFIED DISPLAY                                  │
│            PlaceAttributeBadges Component                          │
│                                                                     │
│  ┌─────────────────────────┐  ┌─────────────────────────────────┐  │
│  │ Verified by Google ✓    │  │ Community tagged 👥             │  │
│  │ Dog Friendly            │  │ Bear Crowd • Sunset Views       │  │
│  │ Wheelchair Accessible   │  │ Quiet on Weekdays               │  │
│  └─────────────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                        ▲                      ▲
                        │                      │
              ┌─────────┴─────────┐  ┌─────────┴─────────┐
              │   places table    │  │ place_niche_tags  │
              │                   │  │ (admin-approved)  │
              │ • allows_dogs     │  │                   │
              │ • wheelchair_*    │  │ tag + evidence    │
              │ • outdoor_seating │  │ type + confidence │
              └───────────────────┘  └───────────────────┘
                        ▲                      ▲
                        │                      │
              Google Places API         Admin Approval
                  (automated)             of user tags
```

---

## Data Flow

### Tier 1: Verified by Google (Automated)

1. Place is created or refreshed
2. Edge function fetches Google amenity fields (`allowsDogs`, `accessibilityOptions`, etc.)
3. Boolean values stored directly in `places` table columns
4. Displayed automatically with "Verified by Google" badge styling

**No user intervention, no admin approval needed - direct from Google.**

### Tier 2: Community Tagged (Admin-Moderated)

1. User saves a place (prerequisite)
2. User suggests a tag via "Suggest a tag" dialog
3. Suggestion goes to `tag_suggestions` table (status: `pending`)
4. Admin reviews in Tag Management → Approve/Reject
5. If approved: Admin applies the tag to the place via `place_niche_tags`
6. Tag displays with "Community tagged" badge styling

**All community tags carry equal weight once approved.**

---

## Key Simplifications

| Current (Complex) | New (Simplified) |
|-------------------|------------------|
| k-anonymity thresholds (3+ or 5+ taggers) | Direct admin approval |
| `tag_signals` aggregation via RPC | Admin applies tags directly |
| Three display tiers (Google, Admin, Community) | Two display tiers only |
| Automatic threshold-based visibility | Manual moderation queue |

**Tables used:**
- `places` table columns → Google-verified attributes
- `place_niche_tags` table → Admin-approved community tags

**Tables deprecated for display:**
- `tag_signals` / `place_tag_aggregates` → Can still collect signals for analytics, but not for display logic

---

## Implementation Phases

### Phase 1: Google API Integration

**Modify:** `supabase/functions/google-places-details/index.ts`

Add to field mask:
```typescript
const fields = [
  // ... existing fields ...
  "allowsDogs",
  "accessibilityOptions",  // wheelchairAccessibleEntrance, etc.
  "outdoorSeating",
  "restroom",
];
```

**Add to PlaceDetails interface:**
```typescript
allows_dogs: boolean | null;
wheelchair_accessible_entrance: boolean | null;
wheelchair_accessible_restroom: boolean | null;
wheelchair_accessible_seating: boolean | null;
outdoor_seating: boolean | null;
has_restroom: boolean | null;
```

**Database migration:**
```sql
ALTER TABLE places ADD COLUMN allows_dogs boolean;
ALTER TABLE places ADD COLUMN wheelchair_accessible_entrance boolean;
ALTER TABLE places ADD COLUMN wheelchair_accessible_restroom boolean;
ALTER TABLE places ADD COLUMN wheelchair_accessible_seating boolean;
ALTER TABLE places ADD COLUMN outdoor_seating boolean;
ALTER TABLE places ADD COLUMN has_restroom boolean;
```

---

### Phase 2: Admin Tag Application UI

**New component:** `src/components/admin/places/PlaceTagEditor.tsx`

Located in Place Detail Edit panel, allows admin to:
- View existing tags applied to the place
- Add tags from canonical_tags list
- Remove tags
- Creates records in `place_niche_tags` with:
  - `evidence_type: 'admin_approved'`
  - `confidence: 1.0`

**New hook:** `src/hooks/usePlaceNicheTags.ts`
- `usePlaceNicheTags(placeId)` - fetch tags for a place
- `useApplyPlaceTag()` - admin adds tag
- `useRemovePlaceTag()` - admin removes tag

---

### Phase 3: Unified Display Component

**New component:** `src/components/directory/PlaceAttributeBadges.tsx`

Props:
```typescript
interface PlaceAttributeBadgesProps {
  place: {
    id: string;
    allows_dogs?: boolean | null;
    wheelchair_accessible_entrance?: boolean | null;
    outdoor_seating?: boolean | null;
    // ... other Google attributes
  };
}
```

Renders two sections:

**1. Verified by Google** (solid badges with checkmark)
```tsx
{place.allows_dogs && (
  <Badge className="bg-emerald-100 text-emerald-800">
    <Check className="h-3 w-3 mr-1" />
    Dog Friendly
  </Badge>
)}
```

**2. Community Tagged** (outline badges with users icon)
```tsx
<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
  <Users className="h-3 w-3" />
  Community tagged
</div>
<div className="flex flex-wrap gap-1.5">
  {nicheTags.map(tag => (
    <Badge key={tag.id} variant="outline">{tag.label}</Badge>
  ))}
</div>
```

---

### Phase 4: Simplified User Submission Flow

**Modify:** `src/components/directory/PlaceTagSubmission.tsx`

Change from "toggle tags on/off" to "suggest tags for review":

Current behavior:
- User toggles tags → Creates `tag_signals` → Aggregation determines visibility

New behavior:
- User suggests tags → Creates `tag_suggestions` with `place_id` reference
- Admin reviews → Approves → Admin applies to place
- No automatic aggregation needed

**Add `place_id` column to `tag_suggestions` table:**
```sql
ALTER TABLE tag_suggestions ADD COLUMN place_id uuid REFERENCES places(id);
```

This links suggestions to specific places for context.

---

### Phase 5: Admin Review Workflow

**Modify:** `src/pages/admin/TagManagement.tsx`

Enhance the Suggestions tab to show:
- Which place the suggestion is for
- Quick "Apply to place" action after approving

Workflow:
1. See pending suggestion: "Dog Friendly patio" for "Joe's Coffee"
2. Click "Approve" → Creates canonical tag if new
3. Click "Apply to Place" → Creates `place_niche_tags` record
4. Tag now visible on place with "Community tagged" label

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| Migration | Create | Add Google attribute columns to `places` |
| Migration | Create | Add `place_id` to `tag_suggestions` |
| `google-places-details/index.ts` | Modify | Fetch amenity/accessibility fields |
| `src/components/admin/places/PlaceTagEditor.tsx` | Create | Admin tag application UI |
| `src/hooks/usePlaceNicheTags.ts` | Create | Hook for place niche tag CRUD |
| `src/components/directory/PlaceAttributeBadges.tsx` | Create | Unified two-tier display |
| `src/components/directory/PlaceDetailModal.tsx` | Modify | Use new badges component |
| `src/components/directory/PlaceTagSubmission.tsx` | Modify | Change to suggestion-based flow |
| `src/pages/admin/TagManagement.tsx` | Modify | Add place context to suggestions |
| `src/lib/feature-flags.ts` | Modify | Update flag comments |

---

## Visual Specification

### Google Verified Badges
- **Style:** Solid green background, dark green text
- **Icon:** Checkmark (Check from Lucide)
- **Examples:** "Dog Friendly ✓", "Wheelchair Accessible ✓", "Outdoor Seating ✓"

### Community Tagged Badges
- **Style:** Outline border, muted text
- **Icon:** Users icon in header only
- **Header:** "Community tagged" (small, muted)
- **Examples:** "Bear Crowd", "Sunset Views", "Quiet on Weekdays"

### Duplicate Prevention
- Google attributes are **never** in canonical_tags (separate data model)
- Admin cannot add a community tag that duplicates a Google attribute
- System enforces uniqueness at the canonical_tags level

---

## Privacy & Safety

- All community tags require admin approval before display
- No automatic aggregation exposes user behavior
- Admin has full control over what appears on places
- Sensitive tags (clothing_optional, etc.) require extra scrutiny in review

---

## Implementation Order

1. **Database migrations** - Add columns to `places` and `tag_suggestions`
2. **Edge function update** - Fetch Google amenity fields
3. **Admin tag editor** - Allow admins to apply tags to places
4. **Unified display component** - Show both tiers in modal
5. **Submission flow update** - Change to suggestion-based
6. **Admin workflow enhancement** - Place context in review
7. **Feature flag update** - Enable NICHE_TAGS_ENABLED
