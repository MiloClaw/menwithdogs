

# Phase 2: Admin Review UI — Implementation Plan

## Overview

This phase builds the admin infrastructure for reviewing Trail Blazer applications (with new structured fields) and content submissions. Following the approved plan's recommendation to **build admin first**, this ensures:

1. Admins can review before content flows in
2. Edge cases are discovered through admin use
3. UX decisions are informed by real data visibility

---

## Part A: Enhance ApplicationDetailModal (Trail Blazer Application Review)

### Current State

The existing `ApplicationDetailModal.tsx` displays legacy fields only:
- Name, email, city, tenure
- Specific places (free text)
- Motivation, business affiliation, local knowledge
- Social links (free text)

### Required Enhancement

Display the new structured Trail Blazer application data from supplementary tables:

| Table | Fields to Display |
|-------|-------------------|
| `trail_blazer_identity_signals` | `role_types[]`, `other_role_description` |
| `trail_blazer_expertise_signals` | `expertise_areas[]`, `other_expertise_description` |
| `trail_blazer_portfolio_links` | `url`, `content_type`, `notes` (up to 5 links) |
| `trail_blazer_place_references` | `place_name`, `formatted_address`, `place_status` |
| `trail_blazer_acknowledgements` | All 4 boolean acknowledgement fields |

### Files to Modify

**`src/hooks/useAmbassadorApplications.ts`**
- Extend `AmbassadorApplication` interface with nested types for supplementary data
- Update `fetchApplications` query to use Supabase join syntax:
  ```typescript
  .select(`
    *,
    identity_signals:trail_blazer_identity_signals(*),
    expertise_signals:trail_blazer_expertise_signals(*),
    portfolio_links:trail_blazer_portfolio_links(*, order by submitted_order),
    place_references:trail_blazer_place_references(*),
    acknowledgements:trail_blazer_acknowledgements(*)
  `)
  ```

**`src/components/admin/users/ApplicationDetailModal.tsx`**
- Add new sections to display structured data:
  - **Identity & Role** section with role type badges
  - **Expertise Areas** section with area badges
  - **Portfolio Links** section with clickable links and content type badges
  - **Place References** section with place cards showing Google Places data
  - **Acknowledgements** section with checkmark indicators
- Use the label mappings from `src/lib/trail-blazer-options.ts`

### UI Design for Enhanced Modal

```text
┌─────────────────────────────────────────────────────────────┐
│ [Name]                                    [Status Badge]    │
│ email@example.com · Applied Jan 28, 2026                    │
├─────────────────────────────────────────────────────────────┤
│ CITY & TENURE                                               │
│ ┌──────────────────┐  ┌──────────────────┐                  │
│ │ 📍 Denver, CO    │  │ ⏱️ 5-10 years    │                  │
│ └──────────────────┘  └──────────────────┘                  │
├─────────────────────────────────────────────────────────────┤
│ IDENTITY & ROLE                                             │
│ [Writer/Blogger] [Photographer]                             │
│ Other: "Trail running content creator"                      │
├─────────────────────────────────────────────────────────────┤
│ EXPERTISE AREAS                                             │
│ [Hiking & trails] [Camping & backcountry] [Trail running]   │
├─────────────────────────────────────────────────────────────┤
│ PORTFOLIO LINKS (Trust Signal)                    [bg card] │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 1. example.com/trail-guide  [Article]                   │ │
│ │    "My comprehensive guide to Colorado 14ers"           │ │
│ │ 2. instagram.com/...        [Photography]               │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ PLACE REFERENCES                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📍 Maroon Bells Scenic Area                             │ │
│ │    Aspen, CO · [in_directory] / [pending]               │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ACKNOWLEDGEMENTS                                            │
│ ✓ Place-first focus  ✓ Link review  ✓ No public profile    │
│ ✓ No promotion required                                     │
├─────────────────────────────────────────────────────────────┤
│ [Legacy fields: motivation, business affiliation, etc.]     │
├─────────────────────────────────────────────────────────────┤
│                        [Close] [Decline] [Approve]          │
└─────────────────────────────────────────────────────────────┘
```

---

## Part B: New Admin Route — Trail Blazer Content Submissions

### Route: `/admin/trail-blazer`

A dedicated admin page for reviewing Trail Blazer content submissions (the `trail_blazer_submissions` table created in Phase 1).

### Files to Create

**`src/pages/admin/TrailBlazerManagement.tsx`**
- Main admin page using `AdminLayout`
- Two tabs: "Content Submissions" and "Permissions"
- Stats row showing pending/approved/needs_revision/declined counts
- Status filter tabs (reuse `StatusFilterTabs` pattern)
- List/detail layout using master-detail pattern

**`src/components/admin/trail-blazer/SubmissionListPane.tsx`**
- Table view of submissions with columns:
  - Place name
  - Context types (badges)
  - Submitted by (user indicator)
  - Status
  - Submitted date
  - Actions (view/quick approve/decline)
- Search by place name
- Status filter

**`src/components/admin/trail-blazer/SubmissionDetailPane.tsx`**
- Full view of submission for review:
  - Place card (name, address, existing/pending status)
  - Context type badges
  - Full context text (the main content)
  - External link section (if present, with permission indicator)
  - Admin actions:
    - **Approve** — Mark as approved
    - **Approve without link** — Approve content but strip external link
    - **Request revision** — Set status + add feedback text
    - **Decline** — Set status declined

**`src/components/admin/trail-blazer/PermissionsPane.tsx`**
- List of approved Trail Blazers with permission controls
- Toggle for `can_attach_external_links`
- Notes field for admin context

**`src/hooks/useTrailBlazerSubmissions.ts`**
- Fetch submissions with status filter
- Approve/decline/request revision mutations
- Stats calculation (pending, approved, etc.)

**`src/hooks/useTrailBlazerPermissions.ts`**
- Fetch permissions for all ambassadors
- Toggle permission mutations
- Create permission record if missing

### Sidebar Navigation Update

**`src/components/admin/AdminSidebar.tsx`**
- Add new nav item after "Community Tags":
  ```typescript
  { title: 'Trail Blazers', href: '/admin/trail-blazer', icon: Compass }
  ```

### Route Registration

**`src/App.tsx`**
- Add new admin route:
  ```typescript
  <Route path="/admin/trail-blazer" element={<RequireRole role="admin"><TrailBlazerManagement /></RequireRole>} />
  ```

---

## Part C: Type Definitions

**`src/lib/context-type-options.ts`** (New file)
- TypeScript types matching `trail_blazer_context_types` table
- Helper functions for displaying context type labels

---

## Implementation Order

1. **Update `useAmbassadorApplications.ts`** — Add supplementary table joins and extended types
2. **Enhance `ApplicationDetailModal.tsx`** — Display new structured fields
3. **Create `useTrailBlazerSubmissions.ts`** — Data layer for submissions
4. **Create `useTrailBlazerPermissions.ts`** — Data layer for permissions
5. **Create `SubmissionListPane.tsx`** — List component
6. **Create `SubmissionDetailPane.tsx`** — Detail/review component
7. **Create `PermissionsPane.tsx`** — Permission management
8. **Create `TrailBlazerManagement.tsx`** — Main admin page
9. **Update `AdminSidebar.tsx`** — Add navigation link
10. **Update `App.tsx`** — Register route

---

## File Summary

### New Files (8)

| Path | Purpose |
|------|---------|
| `src/pages/admin/TrailBlazerManagement.tsx` | Main admin page for Trail Blazer management |
| `src/components/admin/trail-blazer/SubmissionListPane.tsx` | Submission list with filters |
| `src/components/admin/trail-blazer/SubmissionDetailPane.tsx` | Submission detail/review view |
| `src/components/admin/trail-blazer/PermissionsPane.tsx` | Permission management for ambassadors |
| `src/hooks/useTrailBlazerSubmissions.ts` | Submissions data layer |
| `src/hooks/useTrailBlazerPermissions.ts` | Permissions data layer |
| `src/lib/context-type-options.ts` | Context type definitions and helpers |
| `src/components/admin/trail-blazer/index.ts` | Barrel export (optional) |

### Modified Files (4)

| Path | Change |
|------|--------|
| `src/hooks/useAmbassadorApplications.ts` | Add supplementary table joins and extended interface |
| `src/components/admin/users/ApplicationDetailModal.tsx` | Display new structured Trail Blazer fields |
| `src/components/admin/AdminSidebar.tsx` | Add Trail Blazers nav item |
| `src/App.tsx` | Register `/admin/trail-blazer` route |

---

## UX Language (Locked)

| Admin UI Term | Rationale |
|---------------|-----------|
| "Content Submissions" | Not "posts" or "articles" |
| "Context" | Place-first annotation framing |
| "Request Revision" | Collaborative, not punitive |
| "Approve without link" | Granular control without rejection |

