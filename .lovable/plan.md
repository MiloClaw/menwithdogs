

# Phase 2: Community Tag System — Implementation Plan

## Overview

This phase implements a community-powered tagging system that captures local, contextual knowledge not available in Google Places data. The design follows the **Signals → Interpretation → Outcomes** architecture and enforces k-anonymity for privacy.

---

## Architecture Summary

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        COMMUNITY TAG SYSTEM                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CANONICAL TAGS (Admin-Controlled Vocabulary)                              │
│  ├── Culture: lgbtq_friendly, bear_popular, leather_scene                  │
│  ├── Accessibility: wheelchair_accessible, dog_friendly                    │
│  ├── Social: quiet_weekdays, cruisy_vibes, good_for_groups                 │
│  └── Outdoor: clothing_optional, scenic_views, sunrise_spot                │
│                                                                             │
│  ┌──────────────┐    ┌──────────────────┐    ┌───────────────────────┐     │
│  │ tag_signals  │ →  │ compute_tag_agg  │ →  │ place_tag_aggregates  │     │
│  │ (append-only)│    │ (k≥3 threshold)  │    │ (public if threshold) │     │
│  └──────────────┘    └──────────────────┘    └───────────────────────┘     │
│       ↑                                                                     │
│  User submits tag (only on saved places)                                   │
│                                                                             │
│  TAG SUGGESTIONS (Moderation Queue)                                        │
│  └── Users suggest new tags → Admin reviews → Approved → Available         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2.1 Database Schema (Migration)

### New Tables

**Table 1: `canonical_tags`** — Admin-controlled vocabulary

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| slug | text | Unique, URL-safe identifier |
| label | text | Display name |
| category | text | culture, accessibility, social, outdoor |
| description | text | Tooltip text for users |
| is_sensitive | boolean | Requires higher k-threshold |
| applicable_google_types | text[] | Which place types can have this tag |
| is_active | boolean | Soft delete |
| created_at | timestamptz | Auto-set |
| created_by | uuid | Admin who created |

**Table 2: `tag_signals`** — Append-only user signals

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | FK to auth.users |
| place_id | uuid | FK to places |
| tag_slug | text | FK to canonical_tags.slug |
| action | text | 'add' or 'remove' |
| created_at | timestamptz | Auto-set |
| UNIQUE | | (user_id, place_id, tag_slug, action, created_at) |

**Table 3: `place_tag_aggregates`** — Computed, disposable

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| place_id | uuid | FK to places |
| tag_slug | text | FK to canonical_tags.slug |
| unique_taggers | integer | Count of distinct users |
| meets_k_threshold | boolean | True if k≥3 (or k≥5 for sensitive) |
| last_computed | timestamptz | Rebuild timestamp |
| UNIQUE | | (place_id, tag_slug) |

**Table 4: `tag_suggestions`** — Moderation queue

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | FK to auth.users |
| suggested_label | text | What user typed |
| suggested_category | text | Optional category hint |
| rationale | text | Why they want this tag |
| status | text | pending, approved, rejected, merged |
| reviewed_by | uuid | Admin who reviewed |
| reviewed_at | timestamptz | When reviewed |
| merged_into_slug | text | If merged into existing tag |
| created_at | timestamptz | Auto-set |

### RLS Policies

| Table | Policy | Command | Logic |
|-------|--------|---------|-------|
| canonical_tags | Public read | SELECT | `is_active = true` |
| canonical_tags | Admin write | ALL | `has_role(auth.uid(), 'admin')` |
| tag_signals | User insert own | INSERT | `auth.uid() = user_id` |
| tag_signals | Admin read all | SELECT | `has_role(auth.uid(), 'admin')` |
| place_tag_aggregates | Public read visible | SELECT | `meets_k_threshold = true` |
| place_tag_aggregates | Admin read all | SELECT | `has_role(auth.uid(), 'admin')` |
| tag_suggestions | User insert own | INSERT | `auth.uid() = user_id` |
| tag_suggestions | User view own | SELECT | `auth.uid() = user_id` |
| tag_suggestions | Admin manage | ALL | `has_role(auth.uid(), 'admin')` |

### Aggregation Function

```sql
CREATE OR REPLACE FUNCTION compute_tag_aggregates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  k_default INTEGER := 3;
  k_sensitive INTEGER := 5;
BEGIN
  -- Clear and recompute (rebuildable interpretation)
  TRUNCATE place_tag_aggregates;
  
  INSERT INTO place_tag_aggregates (place_id, tag_slug, unique_taggers, meets_k_threshold, last_computed)
  SELECT 
    ts.place_id,
    ts.tag_slug,
    COUNT(DISTINCT ts.user_id) as unique_taggers,
    CASE 
      WHEN ct.is_sensitive THEN COUNT(DISTINCT ts.user_id) >= k_sensitive
      ELSE COUNT(DISTINCT ts.user_id) >= k_default
    END as meets_k_threshold,
    NOW()
  FROM tag_signals ts
  JOIN canonical_tags ct ON ct.slug = ts.tag_slug AND ct.is_active = true
  WHERE ts.action = 'add'
    -- Only count if user still has net positive (more adds than removes)
    AND NOT EXISTS (
      SELECT 1 FROM tag_signals ts_remove
      WHERE ts_remove.user_id = ts.user_id
        AND ts_remove.place_id = ts.place_id
        AND ts_remove.tag_slug = ts.tag_slug
        AND ts_remove.action = 'remove'
        AND ts_remove.created_at > ts.created_at
    )
  GROUP BY ts.place_id, ts.tag_slug, ct.is_sensitive;
END;
$$;
```

---

## 2.2 Admin Tag Management UI

### New File: `src/pages/admin/TagManagement.tsx`

**Features:**
- List all canonical tags with category/status filters
- Create new tags with slug auto-generation
- Edit tag label, category, sensitivity, applicable place types
- Toggle active/inactive
- View tag suggestion queue with approve/reject/merge actions

**UI Pattern:** Follow existing `InterestManagement.tsx` structure:
- Stats cards (Total Tags, Active, Pending Suggestions)
- Filter bar (Category, Status)
- Data table with actions
- Edit/Create dialogs

### Route Addition

**File:** `src/App.tsx`
- Add: `<Route path="/admin/tags" element={<RequireRole role="admin"><TagManagement /></RequireRole>} />`

**File:** `src/components/admin/AdminSidebar.tsx`
- Add `{ title: 'Community Tags', href: '/admin/tags', icon: Tag }` after Pro Contexts

---

## 2.3 User Tag Submission Component

### New File: `src/components/directory/PlaceTagSubmission.tsx`

**Behavior:**
- Only visible when user has saved the place (gated by `isFavorited`)
- Shows available canonical tags for this place type
- Toggle on/off creates signals (not direct writes)
- "Suggest a tag" link opens suggestion modal

**UI:**
- Collapsible section: "Help others discover this place"
- Grid of tag chips (toggle-able)
- Subtle suggestion CTA

### New Hook: `src/hooks/usePlaceTags.ts`

```typescript
export function usePlaceTags(placeId: string) {
  // Fetch visible aggregates for this place
  // Fetch canonical tags applicable to place's Google types
  // Submit tag signal (add/remove)
  // Submit tag suggestion
}
```

### Integration Point

**File:** `src/components/directory/PlaceDetailModal.tsx`

Add after `PlaceLinkedContent`:
```tsx
{/* Community Tags - only for saved places */}
{saved && <PlaceTagSubmission placeId={place.id} placeGoogleTypes={place.google_types} />}

{/* Display visible tags for all users */}
<PlaceTagDisplay placeId={place.id} />
```

---

## 2.4 Feature Flag Integration

**File:** `src/lib/feature-flags.ts`

Add new flag:
```typescript
/**
 * DISABLED BY DEFAULT — Requires k-threshold aggregation
 * 
 * Controls visibility of community tags in directory.
 * When enabled:
 * - Users can submit tags on saved places
 * - Aggregated tags appear on places meeting k-threshold
 */
COMMUNITY_TAGS_ENABLED: false,
```

---

## 2.5 Language Guardrails

All UI copy must follow these patterns:

| Context | Correct | Incorrect |
|---------|---------|-----------|
| Tag display | "Community tagged as..." | "This place is..." |
| Tag prompt | "Help others discover this place" | "Rate this place" |
| Tag submission | "Add your experience" | "Tag this place" |
| Empty state | "No community insights yet" | "No tags" |

---

## Files Summary

| Action | File | Purpose |
|--------|------|---------|
| Migration | `supabase/migrations/YYYYMMDD_community_tags.sql` | 4 tables + RLS + function |
| Create | `src/pages/admin/TagManagement.tsx` | Admin tag curation UI |
| Create | `src/components/directory/PlaceTagSubmission.tsx` | User tag signals UI |
| Create | `src/components/directory/PlaceTagDisplay.tsx` | Show visible tags |
| Create | `src/hooks/usePlaceTags.ts` | Tag data + mutations |
| Modify | `src/App.tsx` | Add /admin/tags route |
| Modify | `src/components/admin/AdminSidebar.tsx` | Add nav item |
| Modify | `src/components/directory/PlaceDetailModal.tsx` | Integrate tag components |
| Modify | `src/lib/feature-flags.ts` | Add COMMUNITY_TAGS_ENABLED |

---

## Build Order

```text
Day 1: Database Migration
├── Create canonical_tags table with seed data
├── Create tag_signals table
├── Create place_tag_aggregates table
├── Create tag_suggestions table
├── Add RLS policies
└── Create compute_tag_aggregates() function

Day 2: Admin UI
├── Create TagManagement.tsx page
├── Add route to App.tsx
├── Add nav item to AdminSidebar.tsx
└── Test CRUD operations

Day 3: User-Facing Components
├── Create usePlaceTags hook
├── Create PlaceTagSubmission component
├── Create PlaceTagDisplay component
├── Integrate into PlaceDetailModal
└── Add feature flag

Day 4: Testing & Polish
├── Test k-threshold enforcement
├── Verify RLS policies
├── Test suggestion queue workflow
└── Language audit for guardrails
```

---

## Seed Data (Canonical Tags)

Initial tags to seed:

| Slug | Label | Category | Sensitive |
|------|-------|----------|-----------|
| lgbtq_friendly | LGBTQ+ Friendly | culture | false |
| bear_crowd | Bear Crowd | culture | false |
| leather_scene | Leather Scene | culture | true |
| clothing_optional | Clothing Optional | outdoor | true |
| cruisy_vibes | Cruisy Vibes | social | true |
| quiet_weekdays | Quiet on Weekdays | social | false |
| good_for_groups | Good for Groups | social | false |
| dog_friendly | Dog Friendly | accessibility | false |
| wheelchair_accessible | Wheelchair Accessible | accessibility | false |
| sunrise_spot | Great for Sunrise | outdoor | false |
| sunset_views | Great for Sunset | outdoor | false |
| picnic_friendly | Picnic Friendly | outdoor | false |

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Admin can create/edit canonical tags | ✓ |
| Users can only tag saved places | ✓ |
| Tags only visible at k≥3 threshold | ✓ |
| Sensitive tags require k≥5 | ✓ |
| Aggregates are fully rebuildable | ✓ |
| Language guardrails enforced | ✓ |

