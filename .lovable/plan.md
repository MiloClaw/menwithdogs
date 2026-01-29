

# Phase 3: Trail Blazer Submission UI — Implementation Plan

## Overview

This phase builds the contributor-facing experience for approved Trail Blazers to submit place-centric contextual annotations. The design follows the approved plan's commitment to:

1. Calm, editorial submission flow (not creator dashboard)
2. Place-first mental model (not content-first)
3. No performance metrics or gamification
4. Minimal "Your Contributions" view for status tracking

---

## Part A: Settings Entry Point

### Current State

`Settings.tsx` (lines 58-104) displays conditional cards:
- **Discover Together** card (always visible)
- **Admin Dashboard** card (visible when `isAdmin === true`)

### Required Enhancement

Add a **Trail Blazer** card between Admin Dashboard and the Tabs, visible only when `isAmbassador === true`.

### File to Modify

**`src/pages/Settings.tsx`**

```text
┌─────────────────────────────────────────────────────────────┐
│ [Discover Together Card]                                    │
├─────────────────────────────────────────────────────────────┤
│ [Admin Dashboard Card] (if admin)                           │
├─────────────────────────────────────────────────────────────┤
│ [NEW: Trail Blazer Card] (if ambassador)                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🧭  Add Context to a Place                              │ │
│ │     Share insight about places you know well     →     │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ [Preferences] [Account] tabs                                │
└─────────────────────────────────────────────────────────────┘
```

**Changes:**
- Import `Compass` from lucide-react
- Use existing `useUserRole()` hook's `isAmbassador` flag
- Link to `/contribute`
- Follow identical card pattern from lines 85-104

---

## Part B: Contribute Page — 5-Step Submission Flow

### Route: `/contribute`

A calm, stepped form for Trail Blazers to submit context for a place.

### State Management Approach

Use a single parent component with React state to manage the 5-step flow:

```typescript
interface SubmissionDraft {
  // Step 1: Place
  googlePlaceId: string;
  placeName: string;
  placeAddress: string;
  placeStatus: 'existing' | 'pending'; // Is place in directory?
  placeId?: string; // If already in directory
  
  // Step 2: Context Types
  contextTypes: string[]; // Max 3 selections
  
  // Step 3: Context Text
  contextText: string;
  
  // Step 4: External Link (optional, permission-gated)
  hasExternalLink: boolean;
  externalUrl?: string;
  externalContentType?: string;
  externalSummary?: string;
}
```

### Files to Create

#### Main Page: `src/pages/Contribute.tsx`

- Access guard: Redirect to `/auth` if not authenticated
- Role guard: Show message if not ambassador
- Fetch user's link permission via new hook
- Step progress indicator (subtle, not gamified)
- Step navigation (Next/Back buttons)
- Submit mutation using existing table

**Layout:**

```text
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Settings                                          │
│                                                             │
│ Add Context to a Place                                      │
│ Share what you know about places you've experienced.        │
├─────────────────────────────────────────────────────────────┤
│ Step 1 of 5 ──────○───○───○───○                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Step Content Area]                                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                    [Back] [Continue]        │
└─────────────────────────────────────────────────────────────┘
```

#### Step Components

| File | Purpose | Key Fields |
|------|---------|------------|
| `src/components/contribute/PlaceSelector.tsx` | Step 1: Select place | Google Places Autocomplete, check if place exists in directory |
| `src/components/contribute/ContextTypeSelector.tsx` | Step 2: Choose context types | Multi-select from `trail_blazer_context_types` (max 3) |
| `src/components/contribute/ContextEditor.tsx` | Step 3: Write context | Textarea with guidance copy, character count |
| `src/components/contribute/ExternalLinkEditor.tsx` | Step 4: Add external reference | URL input, content type dropdown, summary (permission-gated) |
| `src/components/contribute/ReviewSubmit.tsx` | Step 5: Review and submit | Summary card with edit buttons per section |

---

### Step 1: Place Selector

**Component:** `src/components/contribute/PlaceSelector.tsx`

**Behavior:**
1. Use existing `GooglePlacesAutocomplete` with `types="establishment"`
2. On place selection, check if `google_place_id` exists in `places` table
3. Display status badge: "In Directory" (green) or "New Submission" (amber)
4. If in directory, store `place_id` for foreign key

**UI:**

```text
┌─────────────────────────────────────────────────────────────┐
│ Which place are you adding context to?                      │
│                                                             │
│ [🔍 Search for a place...                              ]   │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📍 Maroon Bells Scenic Area                            │ │
│ │    Aspen, CO 81611                                     │ │
│ │    [In Directory ✓] or [New — will be reviewed]       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

### Step 2: Context Type Selector

**Component:** `src/components/contribute/ContextTypeSelector.tsx`

**Behavior:**
1. Fetch context types from `trail_blazer_context_types` table (active only)
2. Display as selectable cards/chips
3. Limit selection to 3 types
4. Each type shows description on hover/focus

**UI:**

```text
┌─────────────────────────────────────────────────────────────┐
│ What kind of context are you sharing?                       │
│ Select up to 3                                              │
│                                                             │
│ ┌─────────────────────┐  ┌─────────────────────┐           │
│ │ ☀️ Seasonal         │  │ 🚗 Access/Logistics │           │
│ │ [selected]          │  │                     │           │
│ └─────────────────────┘  └─────────────────────┘           │
│ ┌─────────────────────┐  ┌─────────────────────┐           │
│ │ ⛷️ Activity Insight │  │ 📅 Planning         │           │
│ │ [selected]          │  │                     │           │
│ └─────────────────────┘  └─────────────────────┘           │
│ ┌─────────────────────┐                                    │
│ │ ⚠️ Safety/Conditions│                                    │
│ └─────────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
```

---

### Step 3: Context Editor

**Component:** `src/components/contribute/ContextEditor.tsx`

**Behavior:**
1. Plain text textarea (no markdown)
2. Character count with soft limit (e.g., 1500 chars)
3. Guidance copy specific to selected context types
4. Validation: minimum 100 characters

**UI:**

```text
┌─────────────────────────────────────────────────────────────┐
│ Share your knowledge                                        │
│                                                             │
│ Based on your selections: Seasonal, Activity Insight        │
│ Consider including: best times to visit, gear needed,       │
│ what to expect on the trail.                                │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │ The Maroon Bells area is best visited in late          │ │
│ │ September when the aspen leaves turn gold...           │ │
│ │                                                         │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│ 247 / 1500 characters                                       │
└─────────────────────────────────────────────────────────────┘
```

---

### Step 4: External Link Editor

**Component:** `src/components/contribute/ExternalLinkEditor.tsx`

**Behavior:**
1. **Permission check:** Fetch from `trail_blazer_permissions` table
2. If `can_attach_external_links === false`: Show locked state with explanation
3. If permitted: Show toggle + fields
4. Fields: URL, content type (dropdown), brief summary

**UI (Permitted):**

```text
┌─────────────────────────────────────────────────────────────┐
│ Link to your existing work (optional)                       │
│                                                             │
│ [Toggle: Include external reference]                        │
│                                                             │
│ URL                                                         │
│ [https://example.com/my-trail-guide                    ]   │
│                                                             │
│ Content Type                                                │
│ [Article / Essay                                    ▼]     │
│                                                             │
│ Brief description                                           │
│ [My comprehensive guide to Colorado 14ers          ]       │
└─────────────────────────────────────────────────────────────┘
```

**UI (Not Permitted):**

```text
┌─────────────────────────────────────────────────────────────┐
│ External links                                              │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔒 External links are enabled after your first         │ │
│ │    approved submission.                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Skip this step →]                                         │
└─────────────────────────────────────────────────────────────┘
```

---

### Step 5: Review and Submit

**Component:** `src/components/contribute/ReviewSubmit.tsx`

**Behavior:**
1. Display summary of all selections
2. Edit buttons to jump back to specific steps
3. Submit button with loading state
4. On success: Redirect to `/contributions` with toast

**UI:**

```text
┌─────────────────────────────────────────────────────────────┐
│ Review your submission                                      │
│                                                             │
│ PLACE                                           [Edit]      │
│ 📍 Maroon Bells Scenic Area                                │
│    Aspen, CO · In Directory                                 │
│                                                             │
│ CONTEXT TYPES                                   [Edit]      │
│ [Seasonal] [Activity Insight]                              │
│                                                             │
│ YOUR CONTEXT                                    [Edit]      │
│ "The Maroon Bells area is best visited in late             │
│  September when the aspen leaves turn gold..."             │
│                                                             │
│ EXTERNAL REFERENCE                              [Edit]      │
│ 🔗 example.com/my-trail-guide (Article)                   │
│    "My comprehensive guide to Colorado 14ers"              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Your submission will be reviewed before appearing.          │
│                                            [Submit for Review] │
└─────────────────────────────────────────────────────────────┘
```

---

## Part C: Your Contributions Page

### Route: `/contributions`

A minimal list of the user's submissions with status tracking. No metrics, no counts, no performance data.

### File to Create: `src/pages/Contributions.tsx`

**Behavior:**
1. Require authentication (redirect to `/auth` if not)
2. Require ambassador role (show message if not)
3. Fetch user's submissions from `trail_blazer_submissions` (filtered by `user_id`)
4. Display as simple list with status badges
5. Show revision feedback if status is `needs_revision`
6. Empty state with CTA to `/contribute`

**UI:**

```text
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Settings                                          │
│                                                             │
│ Your Contributions                                          │
│ Context you've shared about places.                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📍 Maroon Bells Scenic Area                            │ │
│ │    Submitted Jan 28, 2026                              │ │
│ │    [Pending]                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📍 Garden of the Gods                                  │ │
│ │    Submitted Jan 25, 2026                              │ │
│ │    [Approved ✓]                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📍 Rocky Mountain NP - Bear Lake                       │ │
│ │    Submitted Jan 20, 2026                              │ │
│ │    [Needs Revision]                                    │ │
│ │    Feedback: "Please add parking information..."       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│             [+ Add Context to Another Place]                │
└─────────────────────────────────────────────────────────────┘
```

**Empty State:**

```text
┌─────────────────────────────────────────────────────────────┐
│                         📝                                  │
│                                                             │
│               No contributions yet                          │
│                                                             │
│     Share your knowledge about places you know well.        │
│                                                             │
│            [Add Context to a Place]                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Part D: Data Layer Additions

### New Hook: `src/hooks/useUserSubmissions.ts`

Fetch the current user's submissions (not admin-level).

```typescript
export function useUserSubmissions() {
  // Fetch submissions where user_id === auth.uid()
  // Return: submissions, loading, refetch
}
```

### New Hook: `src/hooks/useUserLinkPermission.ts`

Check if current user has external link permission.

```typescript
export function useUserLinkPermission() {
  // Fetch trail_blazer_permissions where user_id === auth.uid()
  // Return: canAttachLinks: boolean, loading
}
```

### New Hook: `src/hooks/useContextTypes.ts`

Fetch active context types from definitions table.

```typescript
export function useContextTypes() {
  // Fetch trail_blazer_context_types where is_active = true
  // Order by sort_order
  // Return: contextTypes, loading
}
```

### New Hook: `src/hooks/useSubmitContribution.ts`

Handle the submission mutation.

```typescript
export function useSubmitContribution() {
  const submit = async (draft: SubmissionDraft) => {
    // Insert into trail_blazer_submissions
    // Return success/error
  };
  
  return { submit, isSubmitting };
}
```

---

## Part E: Route Registration

### File to Modify: `src/App.tsx`

Add new routes near line 98 (after `/settings`):

```typescript
{/* Trail Blazer Contribution Routes */}
<Route path="/contribute" element={<Contribute />} />
<Route path="/contributions" element={<Contributions />} />
```

Import statements:

```typescript
import Contribute from "./pages/Contribute";
import Contributions from "./pages/Contributions";
```

---

## Implementation Order

1. **Create `useContextTypes.ts`** — Fetch context type definitions
2. **Create `useUserLinkPermission.ts`** — Check link permission
3. **Create `useUserSubmissions.ts`** — Fetch user's own submissions
4. **Create `useSubmitContribution.ts`** — Submit mutation
5. **Create Step Components** (1-5) — Building blocks
6. **Create `Contribute.tsx`** — Main submission flow page
7. **Create `Contributions.tsx`** — User's submissions list
8. **Update `Settings.tsx`** — Add Trail Blazer entry card
9. **Update `App.tsx`** — Register routes

---

## File Summary

### New Files (11)

| Path | Purpose |
|------|---------|
| `src/pages/Contribute.tsx` | 5-step submission flow |
| `src/pages/Contributions.tsx` | User's submissions list |
| `src/components/contribute/PlaceSelector.tsx` | Step 1: Place selection |
| `src/components/contribute/ContextTypeSelector.tsx` | Step 2: Context type selection |
| `src/components/contribute/ContextEditor.tsx` | Step 3: Context text editor |
| `src/components/contribute/ExternalLinkEditor.tsx` | Step 4: Optional external link |
| `src/components/contribute/ReviewSubmit.tsx` | Step 5: Review and submit |
| `src/hooks/useContextTypes.ts` | Fetch context type definitions |
| `src/hooks/useUserLinkPermission.ts` | Check user's link permission |
| `src/hooks/useUserSubmissions.ts` | Fetch user's own submissions |
| `src/hooks/useSubmitContribution.ts` | Submit contribution mutation |

### Modified Files (2)

| Path | Change |
|------|--------|
| `src/pages/Settings.tsx` | Add Trail Blazer entry card (visible when `isAmbassador`) |
| `src/App.tsx` | Register `/contribute` and `/contributions` routes |

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

## Mobile-First Considerations

Per project guardrails:

- Touch targets ≥44px for all interactive elements
- Step navigation via bottom-fixed buttons
- Thumb-reachable primary actions
- Full-width cards on mobile
- No hover-only interactions

