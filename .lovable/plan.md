

# Plan: Website Copy Consistency & Sales Funnel Improvements

## Summary

Improve copy consistency, navigation clarity, and sales funnel flow while preserving the existing hero image, hero copy, and overall design/style.

---

## Scope (What This Plan Covers)

- Navigation updates for anonymous users
- CTA button text standardization (excluding Hero)
- Terminology fixes ("app" → "ThickTimber")
- HowItWorks Step 3 title and reassurance copy
- Places page subtitle improvement
- Text readability fixes (removing text-justify)

## Out of Scope (Per User Request)

- Hero image
- Hero copy ("Real Community. Real Places. Real Connection.")
- Website design or visual style

---

## Implementation Tasks

### Task 1: Update Navbar for Anonymous Users

**File**: `src/components/Navbar.tsx`

Add a "Pricing" link and prominent "Join Free" CTA button for non-authenticated users.

**Changes**:
- Add "Pricing" link between "Places" and "How It Works"
- Add "Join Free" button (accent variant) after "Sign In"

```tsx
// Desktop nav for anonymous users (around line 55)
<Link to="/pricing" className={navLinkClasses}>
  Pricing
</Link>
// ... existing links ...
<Button variant="accent" size="sm" onClick={() => navigate('/auth?mode=signup')}>
  Join Free
</Button>
```

---

### Task 2: Fix "App" Terminology

**File**: `src/components/WhyThisExists.tsx`

**Line 23-24**: Change "This app exists to:" → "ThickTimber exists to:"

```tsx
// Before
<p className="text-muted-foreground text-center mb-6">
  This app exists to:
</p>

// After
<p className="text-muted-foreground text-center mb-6">
  ThickTimber exists to:
</p>
```

---

### Task 3: Update HowItWorks Step 3

**File**: `src/components/HowItWorks.tsx`

**A. Change Step 3 title** (line 20): "Share" → "Smarter Over Time"

**B. Update Step 3 description** to align with framework:
> "As more men use the directory, recommendations improve — quietly surfacing patterns across regions, often in unexpected places."

**C. Remove `text-justify`** from description paragraphs (line 88)

**D. Add reassurance copy and CTA** after the steps grid:

```tsx
{/* After the steps grid, before section close */}
<motion.div className="text-center mt-16 md:mt-20">
  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
    This is not a dating app. There's no swiping, feeds, or public profiles.
  </p>
  <Button variant="accent" size="lg" onClick={() => navigate('/auth?mode=signup')}>
    Start Free
    <ChevronRight className="w-4 h-4" />
  </Button>
</motion.div>
```

---

### Task 4: Update Places Page Subtitle

**File**: `src/pages/Places.tsx`

**Line ~484**: Update subtitle for better brand alignment.

```tsx
// Before
"Browse spots worth knowing in your area."

// After
"Trails, campsites, and outdoor spots where men who love nature actually go."
```

---

### Task 5: Standardize Secondary CTA Text

Ensure consistency across pages (excluding Hero which is preserved).

**File**: `src/components/FinalCTA.tsx`
- Keep "Create Free Account" as primary
- Change secondary from "Explore Outdoors" → keep as-is (already correct)

**File**: `src/pages/Pricing.tsx`
- Change "Explore Places" → "Explore Outdoors" to match other pages

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/Navbar.tsx` | Add "Pricing" link + "Join Free" button for anon users |
| `src/components/WhyThisExists.tsx` | "This app" → "ThickTimber" |
| `src/components/HowItWorks.tsx` | Step 3 title, description, add reassurance + CTA, remove text-justify |
| `src/pages/Places.tsx` | Update subtitle copy |
| `src/pages/Pricing.tsx` | Standardize secondary CTA text |

---

## Navigation Before/After

**Before (Anonymous)**:
```
Places | How It Works | Sign In
```

**After (Anonymous)**:
```
Places | Pricing | How It Works | Sign In | [Join Free]
```

---

## Technical Notes

- All changes are copy/text updates or minor component additions
- No structural or design changes
- Framer Motion animations remain unchanged
- Mobile navigation will mirror desktop changes

