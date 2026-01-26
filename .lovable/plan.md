
# Smart Directory Intelligence Rebuild
## Implementation Plan

---

## Executive Summary

After extensive codebase analysis, the current architecture **already implements the core Signals → Interpretation → Outcomes model** outlined in the design document. The implementation plan focuses on:

1. **Strengthening the foundation** (filling UI gaps for existing intelligence signals)
2. **Adding the Community Tag System** (new capability not yet built)
3. **Enhancing Settings UX** for better preference capture
4. **Centralizing the ranking RPC** (optional Phase 3 optimization)

**No destructive migration required** — this is an enhancement, not a rebuild.

---

## Current State Analysis

### What Already Exists

| Component | Status | Notes |
|-----------|--------|-------|
| **Unified Signals Table** | Implemented | `user_signals` with batching via `signal-batcher.ts` |
| **Signal Types** | 12+ defined | view_place, save_place, explicit_preference, etc. |
| **Affinity Computation** | Implemented | `compute_user_affinity` RPC with decay logic |
| **Preference Definitions** | 27 definitions | Activities, intents, timing, usage, openness in DB |
| **PRO Context System** | 30+ options | 4-step flow with influence_mode (overlap/boost) |
| **Meta-Preferences** | In schema | uncertainty_tolerance, choice_priority, etc. |
| **Preference Alignment** | Implemented | `get_preference_aligned_places` RPC for similar-user boost |
| **Place Niche Tags** | Schema only | `place_niche_tags` table exists, admin-only |
| **Feature Flags** | Locked | Social features permanently disabled |

### What's Missing (Gaps to Fill)

| Gap | Priority | Impact |
|-----|----------|--------|
| **Distance Preference UI** | P0 | Directly affects proximity weighting |
| **Primary Time-of-Day UI** | P0 | Feeds opening hours boost |
| **Geographic Affinity UI** | P1 | Exploration scope signal |
| **Community Tag System** | P1 | User-submitted context signals |
| **Tag Aggregation Pipeline** | P2 | k-anonymity threshold enforcement |
| **Intent Grid Icon Consistency** | P2 | Brand polish (emoji → Lucide) |

---

## Phase 1: Settings Page Intelligence Gaps
**Duration: 2-3 days**

### 1.1 Create Distance Preference Section

**New file:** `src/components/profile/DistanceSection.tsx`

Creates a single-select section for distance willingness:
- Options: "Nearby (< 30 min)" / "Worth the drive" / "Day trip distance"
- Saves to `user_preferences.distance_preference`
- Immediately affects `distanceWeight` in `usePersonalizedPlaces.ts`

**Design:**
- Uses existing section card pattern (`bg-muted/30 rounded-xl p-6`)
- Lucide icon: `MapPin` or `Navigation`
- Radio-style single-select (not checkbox)

### 1.2 Create Primary Time-of-Day Section

**New file:** `src/components/profile/TimeOfDaySection.tsx`

Creates a single-select for primary time preference:
- Options: "Dawn / Early" / "Daytime" / "Golden hour" / "Flexible"
- Saves to `user_preferences.time_preference`
- Feeds `getTimeRelevanceBoost()` in personalization

**Note:** This is separate from the existing `TimingSection` which captures multi-select arrays. The single-select `time_preference` has higher weight in ranking.

### 1.3 Create Geographic Affinity Section

**New file:** `src/components/profile/GeoAffinitySection.tsx`

Creates a single-select for exploration scope:
- Options: "Mostly one area" / "A few nearby areas" / "Anywhere nearby"
- Saves to `user_preferences.geo_affinity`
- Future: affects exploration radius in ranking

### 1.4 Wire New Sections to Settings Tab

**Modify:** `src/components/settings/SettingsPreferencesTab.tsx`

- Add state for `timePreference`, `distancePreference`, `geoAffinity`
- Add handlers to sync with `useUserPreferences`
- Position sections in logical flow (after Profile Basics, before Activities)

### 1.5 Update Profile Index

**Modify:** `src/components/profile/index.ts`

- Export new components: `DistanceSection`, `TimeOfDaySection`, `GeoAffinitySection`

### 1.6 Add Options to Profile Options

**Modify:** `src/lib/profile-options.ts`

Add new option arrays:
```typescript
export const DISTANCE_OPTIONS: ProfileOption[] = [
  { key: 'close', label: 'Nearby (< 30 min)' },
  { key: 'medium', label: 'Worth the drive' },
  { key: 'far', label: 'Day trip distance' },
];

export const TIME_OF_DAY_OPTIONS: ProfileOption[] = [
  { key: 'dawn', label: 'Dawn / Early' },
  { key: 'daytime', label: 'Daytime' },
  { key: 'golden_hour', label: 'Golden hour' },
  { key: 'flexible', label: 'Flexible' },
];

export const GEO_AFFINITY_OPTIONS: ProfileOption[] = [
  { key: 'single_area', label: 'Mostly one area' },
  { key: 'few_areas', label: 'A few nearby areas' },
  { key: 'anywhere', label: 'Anywhere nearby' },
];
```

---

## Phase 2: Community Tag System
**Duration: 3-4 days**

### 2.1 Database Schema (Migration)

**Create new tables:**

```sql
-- Canonical tags (admin-controlled vocabulary)
CREATE TABLE canonical_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  category TEXT NOT NULL, -- culture, accessibility, social, outdoor
  description TEXT,
  is_sensitive BOOLEAN DEFAULT false,
  applicable_google_types TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- User tag signals (append-only)
CREATE TABLE tag_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  place_id UUID NOT NULL REFERENCES places(id),
  tag_slug TEXT NOT NULL REFERENCES canonical_tags(slug),
  action TEXT NOT NULL CHECK (action IN ('add', 'remove')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, place_id, tag_slug, action, created_at)
);

-- Aggregated tag visibility (computed, disposable)
CREATE TABLE place_tag_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES places(id),
  tag_slug TEXT NOT NULL REFERENCES canonical_tags(slug),
  unique_taggers INTEGER NOT NULL DEFAULT 0,
  meets_k_threshold BOOLEAN NOT NULL DEFAULT false,
  last_computed TIMESTAMPTZ DEFAULT now(),
  UNIQUE(place_id, tag_slug)
);

-- User tag suggestions (moderation queue)
CREATE TABLE tag_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  suggested_label TEXT NOT NULL,
  suggested_category TEXT,
  rationale TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'merged')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  merged_into_slug TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies:**
- `canonical_tags`: Public read, admin write
- `tag_signals`: User can insert own, admin can read all
- `place_tag_aggregates`: Public read (only meets_k_threshold)
- `tag_suggestions`: User can insert/view own, admin can manage

### 2.2 Admin Canonical Tags UI

**New file:** `src/pages/admin/TagManagement.tsx`

Admin interface to:
- Create/edit/archive canonical tags
- Set sensitivity levels
- Map to applicable Google place types
- Review tag suggestions

**Add route:** `/admin/tags` with `RequireRole` guard

### 2.3 User Tag Submission Component

**New file:** `src/components/directory/PlaceTagSubmission.tsx`

Component for saved places only:
- Shows available canonical tags
- Allows toggle on/off (creates signals)
- "Suggest new tag" link to submission form
- Only visible on places user has saved

**Integration:** Add to `PlaceDetailModal.tsx` (gated by favorite status)

### 2.4 Tag Aggregation Function

**New edge function or scheduled RPC:**

```sql
CREATE OR REPLACE FUNCTION compute_tag_aggregates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  k_threshold INTEGER := 3; -- Minimum unique taggers for visibility
BEGIN
  -- Recompute all aggregates
  INSERT INTO place_tag_aggregates (place_id, tag_slug, unique_taggers, meets_k_threshold)
  SELECT 
    ts.place_id,
    ts.tag_slug,
    COUNT(DISTINCT ts.user_id) as unique_taggers,
    COUNT(DISTINCT ts.user_id) >= k_threshold
  FROM tag_signals ts
  WHERE ts.action = 'add'
  GROUP BY ts.place_id, ts.tag_slug
  ON CONFLICT (place_id, tag_slug) 
  DO UPDATE SET 
    unique_taggers = EXCLUDED.unique_taggers,
    meets_k_threshold = EXCLUDED.meets_k_threshold,
    last_computed = now();
END;
$$;
```

### 2.5 Display Community Tags

**Modify:** `PlaceDetailModal.tsx` and `DirectoryPlaceCard.tsx`

- Query `place_tag_aggregates` where `meets_k_threshold = true`
- Display as: "Community tagged as: [tag labels]"
- Never say "This place is..." — always "Community tagged as..."

---

## Phase 3: Intent Grid Polish
**Duration: 1 day**

### 3.1 Replace Emoji Icons with Lucide

**Modify:** `src/lib/preference-prompts.ts`

Replace emoji strings with Lucide icon component names:
```typescript
options: [
  { value: 'trails', label: 'Trails & hikes', icon: 'Mountain' },
  { value: 'campgrounds', label: 'Campgrounds', icon: 'Tent' },
  { value: 'water', label: 'Water spots', icon: 'Waves' },
  { value: 'scenic', label: 'Scenic views', icon: 'Sunrise' },
  { value: 'outdoor_fitness', label: 'Outdoor fitness', icon: 'Footprints' },
  { value: 'wildlife', label: 'Wildlife & nature', icon: 'TreeDeciduous' },
  { value: 'provisions', label: 'Local provisions', icon: 'Beer' },
]
```

**Modify:** `src/components/settings/SettingsPreferencesTab.tsx`

- Import Lucide icons dynamically or via lookup
- Render icon component instead of emoji text

---

## Phase 4: Documentation & Architecture
**Duration: 1 day**

### 4.1 Create ARCHITECTURE.md

**New file:** `ARCHITECTURE.md`

Document the Signals → Interpretation → Outcomes model:
- Signal naming conventions
- Affinity computation weights
- Preference hierarchy
- Privacy guardrails
- Community tag k-anonymity rules

### 4.2 Update Feature Flags

**Modify:** `src/lib/feature-flags.ts`

Add:
```typescript
COMMUNITY_TAGS_ENABLED: false, // Enable when k-threshold aggregation is live
```

---

## Phase 5: Future Enhancements (Optional)
**Not in immediate scope**

### 5.1 Centralized `directory_feed` RPC

If needed for cross-platform consistency or embedding intelligence:
- Migrate ranking logic from client to database function
- Single RPC: `directory_feed(user_id, city_id, context)`
- Client renders results without knowing ranking internals

**Current state is acceptable** — client-side ranking works and allows rapid iteration.

### 5.2 Place Embeddings (pgvector)

For advanced similarity and recommendation:
- Add `embedding` column to places
- Compute via edge function using OpenAI embeddings
- Enable similarity search for "places like this"

### 5.3 Enhanced Compatibility Intelligence

Extend `get_preference_aligned_places`:
- Time-of-week behavior patterns
- Distance willingness overlap
- Activity preference intersection

---

## Files Summary

| Phase | Action | File | Purpose |
|-------|--------|------|---------|
| 1 | Create | `src/components/profile/DistanceSection.tsx` | Distance preference UI |
| 1 | Create | `src/components/profile/TimeOfDaySection.tsx` | Primary time selector |
| 1 | Create | `src/components/profile/GeoAffinitySection.tsx` | Geographic scope |
| 1 | Modify | `src/lib/profile-options.ts` | Add new option arrays |
| 1 | Modify | `src/components/profile/index.ts` | Export new components |
| 1 | Modify | `src/components/settings/SettingsPreferencesTab.tsx` | Wire new sections |
| 2 | Migration | Database | Create tag tables with RLS |
| 2 | Create | `src/pages/admin/TagManagement.tsx` | Admin tag curation |
| 2 | Create | `src/components/directory/PlaceTagSubmission.tsx` | User tag signals |
| 2 | Modify | `src/components/directory/PlaceDetailModal.tsx` | Display & submit tags |
| 2 | Modify | `src/App.tsx` | Add /admin/tags route |
| 3 | Modify | `src/lib/preference-prompts.ts` | Lucide icon mapping |
| 3 | Modify | `SettingsPreferencesTab.tsx` | Render Lucide icons |
| 4 | Create | `ARCHITECTURE.md` | System documentation |
| 4 | Modify | `src/lib/feature-flags.ts` | Add COMMUNITY_TAGS flag |

---

## Technical Guardrails (Preserved)

These patterns from the design document are **already enforced** and will remain:

1. **Ranking over Filtering** — Preferences affect order, never exclusion
2. **Signal Separation** — Signals never encode interpretation
3. **PRO influence_mode** — Step 1 = overlap, Steps 2-4 = boost
4. **Privacy by default** — No user profiles exposed
5. **k-anonymity for tags** — Minimum 3 taggers for visibility
6. **Language guardrails** — "Community tagged as..." never "This place is..."
7. **Rebuildable interpretation** — Aggregates are disposable caches

---

## Build Order

```text
Week 1: Phase 1 (Settings Intelligence Gaps)
├── Day 1: Create DistanceSection, TimeOfDaySection, GeoAffinitySection
├── Day 2: Wire to SettingsPreferencesTab, update profile-options
└── Day 3: Testing & polish

Week 2: Phase 2 (Community Tags - Foundation)
├── Day 1: Database migration (tables + RLS)
├── Day 2: Admin TagManagement page
├── Day 3: User PlaceTagSubmission component
└── Day 4: Tag aggregation function, display in modals

Week 3: Phase 3 & 4 (Polish & Documentation)
├── Day 1: Replace emoji icons with Lucide
├── Day 2: Create ARCHITECTURE.md
└── Day 3: Feature flag updates, final testing
```

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Settings completion rate | +20% (more fields = more signals) |
| Preference coverage | 100% of affinity-affecting fields in UI |
| Tag submission rate | >5% of active users submit tags |
| Tag visibility | k=3 threshold enforced, aggregates rebuildable |
| Brand consistency | 0 emoji icons in Settings (all Lucide) |
