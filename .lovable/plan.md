

# Plan: Trail Blazer Application System — Expert-First Schema Upgrade

## Summary

Comprehensive upgrade to the Trail Blazer (formerly Ambassador) application system to support expert contributors. This involves new database tables for structured signal collection, UI updates with multi-select fields and Google Places API integration, and admin tooling updates.

---

## 1. Compatibility Analysis

### Current System Assessment

**Existing Table: `ambassador_applications`**

| Column | Type | Current Usage | Compatibility |
|--------|------|---------------|---------------|
| `id` | uuid | Primary key | Keep as-is |
| `user_id` | uuid (nullable) | Auth user reference | Keep as-is |
| `email` | text | Contact info | Keep as-is |
| `name` | text (nullable) | Applicant name | Keep as-is |
| `city_name` | text (required) | Geographic region | Repurpose: optional region |
| `city_google_place_id` | text (nullable) | Google place reference | Keep for region |
| `city_state` | text (nullable) | State | Keep as-is |
| `city_country` | text | Country | Keep as-is |
| `tenure` | text (required) | Time in city | **Problem: required in DB** |
| `motivation` | text (nullable) | Why they want to help | Repurpose: expertise area |
| `specific_places` | text (nullable) | 2-3 local places | Keep: place recommendations |
| `local_knowledge` | text (required) | General knowledge | Repurpose: existing content |
| `social_links` | text (nullable) | Social presence | Repurpose: portfolio links |
| `has_business_affiliation` | boolean (nullable) | Business ties | Keep as-is |
| `business_affiliation_details` | text (nullable) | Business details | Keep as-is |
| `status` | text | pending/approved/declined | Add: `approved_limited` |
| `reviewed_at` | timestamp (nullable) | Review timestamp | Keep as-is |
| `reviewed_by` | uuid (nullable) | Reviewer ID | Keep as-is |
| `created_at` | timestamp | Submission time | Keep as-is |

### Schema Conflicts Identified

| Issue | Impact | Resolution |
|-------|--------|------------|
| `tenure` is **required** in DB | Cannot submit without value | Migrate column to nullable OR use default value |
| `city_name` is **required** in DB | Cannot submit without value | Migrate column to nullable OR use default |
| `local_knowledge` is **required** in DB | Maps to optional "existing content" | Use placeholder default if empty |
| Single text for portfolio links | Cannot store multiple structured links | Create new `trail_blazer_portfolio_links` table |
| No multi-select for roles/expertise | Stored in free-text fields | Create signal tables for structured data |

---

## 2. Recommended Schema Approach

### Option A: Extend Existing Table (Minimal Migration)
- Add new columns to `ambassador_applications`
- Create supplementary tables for structured data
- Keep backward compatibility with existing data

### Option B: Create New Normalized Tables (Proposed)
- Keep `ambassador_applications` for core application data
- Create new tables for structured signals
- Cleaner separation of concerns, aligns with Signals → Interpretation → Outcomes architecture

**Recommendation: Option B** — Aligns with existing project architecture and allows proper signal tracking.

---

## 3. Required Database Migrations

### Migration 1: Update `ambassador_applications` Table

```sql
-- Make tenure and city_name optional for new expert-first applications
ALTER TABLE ambassador_applications 
  ALTER COLUMN tenure SET DEFAULT 'not_applicable',
  ALTER COLUMN city_name SET DEFAULT 'Not specified';

-- Add new status option for limited approvals
-- (status is already a text field, no enum change needed)

-- Add admin notes column for review context
ALTER TABLE ambassador_applications 
  ADD COLUMN IF NOT EXISTS admin_notes text;
```

### Migration 2: Create Portfolio Links Table

```sql
CREATE TABLE trail_blazer_portfolio_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES ambassador_applications(id) ON DELETE CASCADE,
  url text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN (
    'article_essay',
    'guide_resource',
    'photography',
    'video_multimedia',
    'field_notes',
    'other'
  )),
  notes text,
  submitted_order smallint NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS: Users can read their own, admins can read all
ALTER TABLE trail_blazer_portfolio_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own portfolio links"
  ON trail_blazer_portfolio_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ambassador_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own portfolio links"
  ON trail_blazer_portfolio_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ambassador_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage portfolio links"
  ON trail_blazer_portfolio_links FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

### Migration 3: Create Identity Signals Table

```sql
CREATE TABLE trail_blazer_identity_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES ambassador_applications(id) ON DELETE CASCADE,
  role_types text[] NOT NULL DEFAULT '{}',
  other_role_description text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(application_id)
);

-- RLS policies
ALTER TABLE trail_blazer_identity_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own identity signals"
  ON trail_blazer_identity_signals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ambassador_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own identity signals"
  ON trail_blazer_identity_signals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ambassador_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage identity signals"
  ON trail_blazer_identity_signals FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

### Migration 4: Create Expertise Signals Table

```sql
CREATE TABLE trail_blazer_expertise_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES ambassador_applications(id) ON DELETE CASCADE,
  expertise_areas text[] NOT NULL DEFAULT '{}',
  other_expertise_description text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(application_id)
);

-- RLS policies
ALTER TABLE trail_blazer_expertise_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own expertise signals"
  ON trail_blazer_expertise_signals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ambassador_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own expertise signals"
  ON trail_blazer_expertise_signals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ambassador_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage expertise signals"
  ON trail_blazer_expertise_signals FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

### Migration 5: Create Place Reference Table

```sql
CREATE TABLE trail_blazer_place_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES ambassador_applications(id) ON DELETE CASCADE,
  google_place_id text NOT NULL,
  place_name text NOT NULL,
  formatted_address text,
  place_types text[] DEFAULT '{}',
  place_status text NOT NULL DEFAULT 'pending' CHECK (place_status IN (
    'existing',     -- Already in directory
    'pending',      -- Created as pending for admin review
    'approved',     -- Admin approved the place
    'rejected'      -- Admin rejected the place
  )),
  directory_place_id uuid REFERENCES places(id) ON DELETE SET NULL,
  admin_place_notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS policies
ALTER TABLE trail_blazer_place_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own place references"
  ON trail_blazer_place_references FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ambassador_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own place references"
  ON trail_blazer_place_references FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ambassador_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage place references"
  ON trail_blazer_place_references FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

### Migration 6: Create Acknowledgements Table

```sql
CREATE TABLE trail_blazer_acknowledgements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES ambassador_applications(id) ON DELETE CASCADE,
  ack_place_focus boolean NOT NULL DEFAULT false,
  ack_link_review boolean NOT NULL DEFAULT false,
  ack_no_public_profile boolean NOT NULL DEFAULT false,
  ack_no_promotion_required boolean NOT NULL DEFAULT false,
  acknowledged_at timestamp with time zone DEFAULT now(),
  UNIQUE(application_id)
);

-- RLS policies
ALTER TABLE trail_blazer_acknowledgements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own acknowledgements"
  ON trail_blazer_acknowledgements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ambassador_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own acknowledgements"
  ON trail_blazer_acknowledgements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ambassador_applications 
      WHERE id = application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage acknowledgements"
  ON trail_blazer_acknowledgements FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

---

## 4. UI Implementation Plan

### Phase 1: Form Restructure (`src/pages/Ambassadors.tsx`)

| Section | Current | New Implementation |
|---------|---------|-------------------|
| 1. Orientation | Hero text | Keep current — already aligned |
| 2. Identity | None | Multi-select chips for role types |
| 3. Portfolio | Single textarea | Repeater component for up to 5 links |
| 4. Expertise | Free text | Multi-select chips for expertise areas |
| 5. Contribution Intent | Maps to `motivation` | Keep as textarea, update label |
| 6. Place Reference | Free text for places | Google Places autocomplete (optional) |
| 7. Acknowledgements | None | Checkbox group |

### New Components to Create

```text
src/components/ambassadors/
├── RoleTypeSelector.tsx        # Multi-select for identity signals
├── ExpertiseAreaSelector.tsx   # Multi-select for expertise areas  
├── PortfolioLinksEditor.tsx    # Repeater for multiple links
├── PlaceReferenceSearch.tsx    # Google Places autocomplete
├── AcknowledgementsChecklist.tsx # Required checkboxes
└── TrailBlazerFormSection.tsx  # Wrapper for consistent styling
```

### Role Type Options (Multi-Select)

```typescript
const ROLE_TYPES = [
  { value: 'writer_blogger', label: 'Writer / Blogger' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'guide_educator', label: 'Guide / Outdoor Educator' },
  { value: 'researcher_naturalist', label: 'Researcher / Naturalist' },
  { value: 'athlete_endurance', label: 'Athlete / Endurance Specialist' },
  { value: 'travel_exploration', label: 'Travel / Exploration Writer' },
  { value: 'other', label: 'Other' },
] as const;
```

### Expertise Area Options (Multi-Select)

```typescript
const EXPERTISE_AREAS = [
  { value: 'hiking_trails', label: 'Hiking & trail systems' },
  { value: 'camping_backcountry', label: 'Camping & backcountry sites' },
  { value: 'beaches_water', label: 'Beaches, swimming holes, coastal access' },
  { value: 'trail_running', label: 'Trail running & endurance' },
  { value: 'cycling', label: 'Cycling (road / gravel / mountain)' },
  { value: 'overland_remote', label: 'Overland & remote access' },
  { value: 'urban_outdoor', label: 'Urban outdoor spaces & parks' },
  { value: 'other', label: 'Other' },
] as const;
```

### Content Type Options (Portfolio Links)

```typescript
const CONTENT_TYPES = [
  { value: 'article_essay', label: 'Article / Essay' },
  { value: 'guide_resource', label: 'Guide / Resource' },
  { value: 'photography', label: 'Photography' },
  { value: 'video_multimedia', label: 'Video / Multimedia' },
  { value: 'field_notes', label: 'Field Notes' },
  { value: 'other', label: 'Other' },
] as const;
```

---

## 5. Hook Updates

### Update `useAmbassadorApplication.ts`

```typescript
// New interface for structured submission
export interface TrailBlazerApplicationData {
  // Core fields (existing)
  name: string;
  email: string;
  region?: string;
  regionGooglePlaceId?: string;
  regionState?: string;
  regionCountry?: string;
  
  // Existing fields (repurposed)
  contributionIntent: string;        // → motivation
  specificPlaces?: string;           // Keep as backup
  existingContent?: string;          // → local_knowledge
  hasBusinessAffiliation: boolean;
  businessAffiliationDetails?: string;
  
  // New structured data
  roleTypes: string[];
  otherRoleDescription?: string;
  expertiseAreas: string[];
  otherExpertiseDescription?: string;
  portfolioLinks: {
    url: string;
    contentType: string;
    notes?: string;
  }[];
  placeReference?: {
    googlePlaceId: string;
    placeName: string;
    formattedAddress?: string;
    placeTypes?: string[];
  };
  acknowledgements: {
    placeFocus: boolean;
    linkReview: boolean;
    noPublicProfile: boolean;
    noPromotionRequired: boolean;
  };
}
```

### New `useTrailBlazerApplication.ts` Hook

- Handles multi-table insert transaction
- Creates application first, then inserts related records
- Returns application ID for confirmation

---

## 6. Admin Tooling Updates

### Update `ApplicationDetailModal.tsx`

| Current Section | Update |
|-----------------|--------|
| City/Tenure | Replace with Region (optional) + Role Types |
| Specific Places | Add Place Reference with directory link |
| Motivation | Relabel to "Contribution Intent" |
| Local Knowledge | Relabel to "Existing Content" |
| Social Links | Replace with Portfolio Links list |
| (new) | Expertise Areas display |
| (new) | Acknowledgements checklist view |

### Update `AmbassadorApplicationsTab.tsx`

| Column | Update |
|--------|--------|
| City | Replace with "Region" (or "-" if not specified) |
| Tenure | Remove column |
| (new) | Add "Role Types" column with badge display |
| (new) | Add "Expertise" column with count indicator |

---

## 7. Google Places API Integration

### Place Reference Flow

```text
1. User types in place search field
   └→ google-places-autocomplete (types="establishment")

2. User selects a prediction
   └→ google-places-details (fetch full place info)

3. Check if place exists in directory
   └→ SELECT from places WHERE google_place_id = ?

4a. If exists:
   └→ Store reference with place_status = 'existing'
   └→ Link directory_place_id

4b. If not exists:
   └→ Store reference with place_status = 'pending'
   └→ Admin review will decide whether to create place
```

### No Auto-Publishing

Place references are stored as signals only. Admin must explicitly:
- Approve the place into the directory (via existing place approval flow)
- Update the reference status to 'approved'

---

## 8. Implementation Sequence

### Step 1: Database Migrations (1 PR)
1. Run all 6 migrations in order
2. Verify RLS policies work correctly
3. Test backward compatibility with existing applications

### Step 2: New Components (1 PR)
1. Create `RoleTypeSelector` component
2. Create `ExpertiseAreaSelector` component
3. Create `PortfolioLinksEditor` component
4. Create `PlaceReferenceSearch` component
5. Create `AcknowledgementsChecklist` component

### Step 3: Application Form Update (1 PR)
1. Update form schema in `Ambassadors.tsx`
2. Integrate new components
3. Create new `useTrailBlazerApplication` hook
4. Test full submission flow

### Step 4: Admin Tooling Update (1 PR)
1. Update `ApplicationDetailModal.tsx`
2. Update `AmbassadorApplicationsTab.tsx`
3. Add joins to fetch related table data
4. Update approval flow if needed

---

## 9. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking existing applications | Keep backward compatibility; existing data remains valid |
| RLS complexity with joins | Use security definer functions for cross-table queries |
| Form complexity on mobile | Keep sections collapsible; progressive disclosure |
| Google Places API costs | Place reference is optional; limits enforced |

---

## 10. Non-Goals (Confirmed)

- No public Trail Blazer profiles
- No rankings, leaderboards, or social metrics
- No auto-publishing of places or links
- No influencer or promotional mechanics
- No follower counts or audience metrics collected

---

## 11. Success Criteria

- Application collects structured expert signals
- Admin can view all signal data in review modal
- Place references link correctly to existing directory entries
- New applications don't break existing application data
- Mobile form remains usable and touch-friendly
- All acknowledgements are required before submission

