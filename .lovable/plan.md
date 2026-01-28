

# Trail Blazer Content Submission System — Implementation Plan

## Executive Summary

This plan implements the **Trail Blazer Submission UX** as a first-class content object layer, separate from the existing `posts` system. The implementation follows the expert guidance to:

1. Create a dedicated `trail_blazer_submissions` table (not reuse posts)
2. Use a definitions table for contribution types (not enum)
3. Implement explicit link permissions (not inferred)
4. Build admin review before the submission UI

---

## Validated Decisions (Confirmed via Codebase Analysis)

| Decision | Validation |
|----------|------------|
| **DO NOT reuse posts table** | Posts are city-centric announcements with `city_id` (required), `type`, `slug`, `cover_image_url`. Trail Blazer submissions are place-centric contextual annotations. Different mental models. |
| **ambassador role detection works** | `useUserRole()` → `isAmbassador`, `useSubscription()` → `isAmbassador`. Both flow from `user_roles` table. |
| **Settings card pattern exists** | "Discover Together" and "Admin Dashboard" cards at lines 58-104 in `Settings.tsx`. Trail Blazer card follows same pattern. |
| **Admin review pattern exists** | `ApplicationDetailModal.tsx` + `useAmbassadorApplications.ts` already handle approve/decline/revoke. Extend this pattern. |
| **Trail Blazer supplementary tables exist** | `trail_blazer_identity_signals`, `trail_blazer_expertise_signals`, `trail_blazer_portfolio_links`, `trail_blazer_place_references`, `trail_blazer_acknowledgements` all created and linked to `ambassador_applications`. |

---

## Implementation Phases

### Phase 1: Database Schema (Step 1 — Lock the Content Object)

#### 1.1 Create Contribution Types Definitions Table

```sql
CREATE TABLE trail_blazer_context_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  label text NOT NULL,
  description text,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Seed initial types
INSERT INTO trail_blazer_context_types (key, label, description, sort_order) VALUES
  ('seasonal', 'Seasonal considerations', 'Best times of year, weather patterns, crowd levels', 1),
  ('access_logistics', 'Access or logistics notes', 'Parking, permits, approach routes, facilities', 2),
  ('activity_insight', 'Activity-specific insight', 'Difficulty, gear requirements, technique tips', 3),
  ('planning', 'Planning considerations', 'Day trips vs overnight, group size, time estimates', 4),
  ('safety_conditions', 'Safety or conditions awareness', 'Hazards, current conditions, preparedness', 5);
```

#### 1.2 Create Trail Blazer Permissions Table

```sql
CREATE TABLE trail_blazer_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  can_attach_external_links boolean DEFAULT false,
  granted_at timestamptz,
  granted_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);
```

**Why separate table?**
- Follows Signals → Interpretation → Outcomes architecture
- Permissions can be granted/revoked without touching application data
- Easy to audit and extend (e.g., future: `can_suggest_new_places`, `trusted_auto_approve`)

#### 1.3 Create Trail Blazer Submissions Table

```sql
CREATE TYPE trail_blazer_submission_status AS ENUM (
  'pending',
  'approved',
  'needs_revision',
  'declined'
);

CREATE TABLE trail_blazer_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who submitted
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- What place (required - place-first thinking)
  place_id uuid REFERENCES places(id) ON DELETE SET NULL,
  google_place_id text NOT NULL,  -- Always captured (in case place not yet in directory)
  place_name text NOT NULL,
  place_address text,
  place_status text DEFAULT 'existing' CHECK (place_status IN ('existing', 'pending')),
  
  -- Contribution scope (multi-select, stored as array)
  context_types text[] NOT NULL,
  
  -- Primary content
  context_text text NOT NULL,
  
  -- Optional external reference (only if permitted)
  has_external_link boolean DEFAULT false,
  external_url text,
  external_content_type text,  -- article, guide, photography, video, field_notes, other
  external_summary text,
  
  -- Lifecycle
  status trail_blazer_submission_status DEFAULT 'pending',
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  admin_notes text,
  revision_feedback text,
  
  -- Audit
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_tb_submissions_user ON trail_blazer_submissions(user_id);
CREATE INDEX idx_tb_submissions_place ON trail_blazer_submissions(place_id);
CREATE INDEX idx_tb_submissions_status ON trail_blazer_submissions(status);
CREATE INDEX idx_tb_submissions_submitted ON trail_blazer_submissions(submitted_at DESC);
```

#### 1.4 RLS Policies

```sql
ALTER TABLE trail_blazer_submissions ENABLE ROW LEVEL SECURITY;

-- Trail Blazers can insert their own submissions
CREATE POLICY "Ambassadors can insert own submissions"
  ON trail_blazer_submissions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND has_role(auth.uid(), 'ambassador')
  );

-- Trail Blazers can view their own submissions
CREATE POLICY "Users can view own submissions"
  ON trail_blazer_submissions FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can manage all submissions
CREATE POLICY "Admins can manage all submissions"
  ON trail_blazer_submissions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Similar policies for permissions table
ALTER TABLE trail_blazer_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own permissions"
  ON trail_blazer_permissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage permissions"
  ON trail_blazer_permissions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Context types are public read
ALTER TABLE trail_blazer_context_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read context types"
  ON trail_blazer_context_types FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage context types"
  ON trail_blazer_context_types FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

---

### Phase 2: Admin Review UI (Step 2 — Build Admin First)

#### 2.1 New Admin Route: `/admin/trail-blazer`

**Files to create:**
- `src/pages/admin/TrailBlazerManagement.tsx` — Main admin page
- `src/components/admin/trail-blazer/SubmissionListPane.tsx` — List with filters
- `src/components/admin/trail-blazer/SubmissionDetailPane.tsx` — Review detail view
- `src/hooks/useTrailBlazerSubmissions.ts` — Data fetching and mutations

**Admin capabilities:**
- View all submissions with status filter tabs (Pending, Approved, Needs Revision, Declined)
- Click to review with full context
- Approve context (optionally approve without link)
- Request revision with feedback
- Decline submission
- Grant/revoke link permissions per user

#### 2.2 Enhance ApplicationDetailModal (Upgrade)

Update `src/components/admin/users/ApplicationDetailModal.tsx` to show:
- New structured fields from `trail_blazer_identity_signals`
- Expertise areas from `trail_blazer_expertise_signals`
- Portfolio links from `trail_blazer_portfolio_links`
- Place references from `trail_blazer_place_references`
- Acknowledgements from `trail_blazer_acknowledgements`

**Query pattern:**
```typescript
const { data } = await supabase
  .from('ambassador_applications')
  .select(`
    *,
    identity_signals:trail_blazer_identity_signals(*),
    expertise_signals:trail_blazer_expertise_signals(*),
    portfolio_links:trail_blazer_portfolio_links(*, order by submitted_order),
    place_references:trail_blazer_place_references(*),
    acknowledgements:trail_blazer_acknowledgements(*)
  `)
  .eq('id', applicationId)
  .single();
```

#### 2.3 Add Sidebar Navigation

Update `src/components/admin/AdminSidebar.tsx`:
```tsx
{ icon: Compass, label: 'Trail Blazers', href: '/admin/trail-blazer' }
```

---

### Phase 3: Trail Blazer Submission UI (Step 3 — Build After Admin)

#### 3.1 Settings Entry Point

Update `src/pages/Settings.tsx` to add conditional Trail Blazer card:

```tsx
// After Admin Dashboard card, before tabs
{!roleLoading && isAmbassador && (
  <Link to="/contribute" className="block mb-10 group">
    <div className="bg-muted/30 border border-border rounded-xl p-5 flex items-center gap-4 transition-all hover:bg-muted/50 hover:border-primary/20">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Compass className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-base mb-0.5">Add Context to a Place</h3>
        <p className="text-sm text-muted-foreground">
          Share insight about places you know well
        </p>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
    </div>
  </Link>
)}
```

#### 3.2 Submission Flow Page

Create `src/pages/Contribute.tsx` with 5-step flow:

| Step | Component | Fields |
|------|-----------|--------|
| 1 | PlaceSelector | Google Places autocomplete, show existing/pending status |
| 2 | ContextTypeSelector | Multi-select (max 3) from `trail_blazer_context_types` |
| 3 | ContextEditor | Plain text textarea with guidance |
| 4 | ExternalLinkEditor | Toggle + fields (only if permitted) |
| 5 | ReviewSubmit | Summary + submit CTA |

**Route:** `/contribute` (not `/create-post`, not `/publish`)

#### 3.3 Your Contributions View

Create `src/pages/Contributions.tsx`:
- Minimal list: Place name, submission date, status badge
- No counts, no metrics, no "published" language
- Link from Settings as secondary entry

---

## File Change Summary

### New Files

| Path | Purpose |
|------|---------|
| `src/pages/admin/TrailBlazerManagement.tsx` | Admin submission review |
| `src/components/admin/trail-blazer/SubmissionListPane.tsx` | Submission list |
| `src/components/admin/trail-blazer/SubmissionDetailPane.tsx` | Detail review |
| `src/hooks/useTrailBlazerSubmissions.ts` | Submission data layer |
| `src/pages/Contribute.tsx` | 5-step submission flow |
| `src/pages/Contributions.tsx` | User's submissions list |
| `src/components/contribute/PlaceSelector.tsx` | Step 1 component |
| `src/components/contribute/ContextTypeSelector.tsx` | Step 2 component |
| `src/components/contribute/ContextEditor.tsx` | Step 3 component |
| `src/components/contribute/ExternalLinkEditor.tsx` | Step 4 component |
| `src/components/contribute/ReviewSubmit.tsx` | Step 5 component |
| `src/hooks/useTrailBlazerPermissions.ts` | Permission checks |
| `src/lib/context-type-options.ts` | Type definitions |

### Modified Files

| Path | Change |
|------|--------|
| `src/pages/Settings.tsx` | Add Trail Blazer entry card (conditional on `isAmbassador`) |
| `src/components/admin/AdminSidebar.tsx` | Add Trail Blazers nav item |
| `src/components/admin/users/ApplicationDetailModal.tsx` | Display new structured fields |
| `src/hooks/useAmbassadorApplications.ts` | Fetch supplementary tables |
| `src/App.tsx` | Add `/contribute`, `/contributions`, `/admin/trail-blazer` routes |

---

## UX Language Guardrails (Locked)

| Term to Use | Term to Avoid |
|-------------|---------------|
| "Add context to a place" | "Create post" |
| "Submit for review" | "Publish" |
| "Your contributions" | "Your posts" |
| "Context" | "Content" |
| "Submission" | "Article" |
| "Place" | "Your place" |

---

## What This System Intentionally Avoids

- Creator dashboard / content feed
- Draft counts or performance metrics
- Visibility stats or view counts
- "Published" language
- Ownership language ("your place")
- Gamification or badges
- Public visibility of contributor identity

---

## Recommended Implementation Order

1. **Database migration** — Create tables, types, RLS policies
2. **Upgrade ApplicationDetailModal** — Show new structured application fields
3. **Admin submission review UI** — `/admin/trail-blazer`
4. **Settings entry card** — Conditional Trail Blazer link
5. **Submission flow** — `/contribute` with 5-step form
6. **Contributions list** — `/contributions` minimal view

This order ensures:
- Schema is stable before UI
- Admins can review before content flows in
- UX edge cases are discovered through admin use

