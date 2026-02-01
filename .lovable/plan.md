
# Admin Dashboard & Pages UI/UX Cleanup

## Summary

This plan addresses cleanup, consistency, and functionality improvements across the admin interface following the recent Founders subscription removal and simplification to a single PRO product.

---

## Issues Identified

### 1. Stale Data in useAdminStats Hook

The `useAdminStats.ts` hook still queries and processes Founders-related data that no longer exists in the application model:

| Issue | Location | Impact |
|-------|----------|--------|
| Founders interfaces still defined | Lines 40-53 | Dead code |
| Founders queries still running | Lines 173-178 | Unnecessary database queries |
| Founders stats processing | Lines 405-424 | Dead code |
| Returns `founders` object | Line 476-480 | Unused return value |

### 2. Inconsistent Product Branding

The dashboard subtitle still references "ThickTimber" which should be updated to reflect the actual product name if different, or kept consistent.

### 3. AdminHeader Stale Route Labels

The `AdminHeader.tsx` still contains a route label for the removed Founders page:
```
'/admin/founders': 'Founders Program',
```

### 4. Dashboard Layout Improvements

Current issues with the dashboard layout:
- HeroStatsBar skeleton shows 5 cards but renders 6 stats
- Action Queue + Trends + Location cards are cramped on smaller screens
- GrowthProgramsCard could be more compact since it only shows Ambassador stats now

### 5. Mobile Navigation UX

The mobile sidebar hamburger button overlaps with content on some pages and lacks visual prominence.

---

## Implementation Plan

### Phase 1: Clean Up Dead Code

#### 1.1 Update `src/hooks/useAdminStats.ts`

Remove all Founders-related code:

```text
- Delete FoundersCityStats interface (lines 40-45)
- Delete FoundersStats interface (lines 47-53)
- Remove founders from AdminStats interface (line 114)
- Remove Founders queries from Promise.all (lines 173-178)
- Remove Founders stats calculation (lines 405-424)
- Remove founders from return object (lines 476-480)
```

This reduces database queries from 11 to 9 and removes ~50 lines of dead code.

#### 1.2 Update `src/components/admin/AdminHeader.tsx`

Remove stale route label:
```text
Line 10: Delete '/admin/founders': 'Founders Program',
```

Add missing route labels for completeness:
```text
+ '/admin/trail-blazer': 'Trail Blazers',
+ '/admin/tags': 'Community Tags',
```

---

### Phase 2: Dashboard UI Improvements

#### 2.1 Fix HeroStatsBar Skeleton

Update loading skeleton to show 6 cards instead of 5 to match actual content:

```text
src/components/admin/dashboard/HeroStatsBar.tsx
Line 117: Change grid-cols-5 → grid-cols-6
Line 118: Change [1,2,3,4,5] → [1,2,3,4,5,6]
```

#### 2.2 Improve Dashboard Grid Layout

Adjust the 3-column grid for better mobile responsiveness:

```text
src/pages/admin/AdminDashboard.tsx
Current: grid gap-6 lg:grid-cols-3
Update:  grid gap-4 md:grid-cols-2 lg:grid-cols-3
```

This allows cards to stack 1-2-3 columns progressively.

#### 2.3 Simplify GrowthProgramsCard

Since Founders is removed, rename and simplify:

Current structure:
```
GrowthProgramsCard
└── Ambassador Program section
```

Changes:
- Keep the current Ambassador-only structure
- Update the card title from "Ambassador Program" icon to use Megaphone (already done)
- Reduce vertical padding for compactness

---

### Phase 3: Mobile Navigation Polish

#### 3.1 Improve Mobile Hamburger Button

Update `src/components/admin/AdminSidebar.tsx`:

```text
Current: fixed top-3 left-3 z-50
Update:  fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm shadow-sm
```

This adds a subtle background and shadow for better visibility.

#### 3.2 Fix AdminLayout Mobile Padding

Update `src/components/admin/AdminLayout.tsx`:

```text
Current: pt-16 (conditional on mobile)
Update:  pt-14 (matches header height h-14)
```

---

### Phase 4: Consistency Improvements

#### 4.1 Standardize Page Headers

Ensure all admin pages follow the same header pattern:

```text
Current patterns (inconsistent):
- AdminDashboard: h1 + p.text-muted-foreground
- UserManagement: h1.tracking-tight + p.text-muted-foreground
- PlaceManagement: Breadcrumb + h1
- CityManagement: Breadcrumb + h1
```

Recommendation: Keep current patterns as they serve different purposes (dashboard vs detail pages), but ensure text styles match.

#### 4.2 Update Dashboard Subtitle

If "ThickTimber" is not the final product name, update it. Otherwise, keep for brand consistency.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useAdminStats.ts` | Remove Founders interfaces, queries, and processing |
| `src/components/admin/AdminHeader.tsx` | Remove stale route, add missing routes |
| `src/components/admin/dashboard/HeroStatsBar.tsx` | Fix skeleton grid to 6 columns |
| `src/pages/admin/AdminDashboard.tsx` | Improve grid responsiveness |
| `src/components/admin/AdminSidebar.tsx` | Polish mobile hamburger button styling |
| `src/components/admin/AdminLayout.tsx` | Fix mobile padding calculation |

---

## Technical Details

```text
Files to modify:

src/hooks/useAdminStats.ts
├── Delete lines 40-53 (FoundersCityStats, FoundersStats interfaces)
├── Remove 'founders: FoundersStats' from AdminStats interface (line 114)
├── Remove foundersRedemptionsResult, foundersCitiesResult from Promise.all
├── Remove lines 405-424 (founders stats calculation)
└── Remove founders from return object

src/components/admin/AdminHeader.tsx
├── Delete '/admin/founders': 'Founders Program' (line 10)
├── Add '/admin/trail-blazer': 'Trail Blazers'
└── Add '/admin/tags': 'Community Tags'

src/components/admin/dashboard/HeroStatsBar.tsx
├── Line 117: lg:grid-cols-5 → lg:grid-cols-6
└── Line 118: [1,2,3,4,5] → [1,2,3,4,5,6]

src/pages/admin/AdminDashboard.tsx
└── Line 68: "grid gap-6 lg:grid-cols-3" → "grid gap-4 md:grid-cols-2 lg:grid-cols-3"

src/components/admin/AdminSidebar.tsx
└── Line 171: Add bg-background/80 backdrop-blur-sm shadow-sm border rounded-lg

src/components/admin/AdminLayout.tsx
└── Line 22: pt-16 → pt-14
```

---

## Result After Changes

- Cleaner codebase with no dead Founders code
- Faster dashboard load (fewer database queries)
- Better mobile navigation experience
- Consistent loading states
- Improved responsive layout on tablets
