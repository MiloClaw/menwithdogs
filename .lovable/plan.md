

# Plan: Update Hero Copy

## Summary

Update the Hero component copy with new headline, subheadline, and CTA button text while preserving the existing image and design.

---

## Current vs New Copy

| Element | Current | New |
|---------|---------|-----|
| **Headline** | "Real Community. Real Places. Real Connection." | "Real places. Shared interests. Real-world connection." |
| **Subheadline** | (none) | "A place-based directory that helps men connect more organically through outdoor activities, shared hobbies, and the places their community already gathers." |
| **Primary CTA** | "Get Started — Free" | "Join Free" |
| **Secondary CTA** | "Explore Places" | "Explore Places" (unchanged) |

---

## Changes

**File**: `src/components/Hero.tsx`

### 1. Update Headline (Line 49-53)

Change the h1 content from three lines to the new format:

```tsx
// Before
Real Community.<br />
Real Places.<br />
Real Connection.

// After
Real places. Shared interests.<br />
Real-world connection.
```

### 2. Add Subheadline (Line 59-60 area)

Add a subheadline paragraph between the BrandStripe and the CTA buttons:

```tsx
<p className="text-muted-foreground text-center max-w-xl mx-auto mb-6 px-4 text-pretty">
  A place-based directory that helps men connect more organically through outdoor activities, shared hobbies, and the places their community already gathers.
</p>
```

### 3. Update Primary CTA Button Text (Line 62-65)

```tsx
// Before
Get Started — Free
<ChevronRight className="w-4 h-4" />

// After
Join Free
```

Remove the ChevronRight icon for cleaner button.

### 4. Secondary CTA (Line 66-69)

Keep "Explore Places" - already matches the request.

---

## Visual Structure After Update

```
┌─────────────────────────────────────┐
│          [Hero Image]               │
│                                     │
│   Real places. Shared interests.    │
│      Real-world connection.         │
└─────────────────────────────────────┘
         [BrandStripe Logo]

  A place-based directory that helps 
  men connect more organically through 
  outdoor activities, shared hobbies, 
  and the places their community 
  already gathers.

   [Join Free]    [Explore Places]
```

---

## Technical Notes

- Image remains unchanged
- Parallax effect remains unchanged
- Mobile responsive classes remain unchanged
- Button variants remain: accent (primary) and outline (secondary)

