

# Footer Logo Alignment Fix

## Objective

Align the footer logo to match the centered layout shown in the reference image, where:
- "ThickTimber" wordmark is centered
- "SOCIAL CLUB" subtitle is centered below
- Brand stripe (Navy, Amber, Green) is centered below the subtitle

---

## Current State

The Footer currently uses:
```tsx
<BrandLockup size="lg" variant="dark" showStripe />
```

This renders with left alignment because the `centered` prop is not set.

---

## Solution

Add the `centered` prop to the BrandLockup component in the Footer:

**File:** `src/components/Footer.tsx`

**Line 15:**
```tsx
// BEFORE
<BrandLockup size="lg" variant="dark" showStripe />

// AFTER
<BrandLockup size="lg" variant="dark" showStripe centered />
```

---

## Visual Result

```text
BEFORE (Left-aligned)              AFTER (Centered)

ThickTimber                              ThickTimber
SOCIAL CLUB                              SOCIAL CLUB
███ ███ ███                           ███ ███ ███
  ↑ left edge                            ↑ centered
```

---

## Implementation

This is a single-line change that leverages the `centered` prop we just added to the BrandLockup component. No additional changes needed.

