

# Brand Stripe Dark Mode Visibility Fix

## Problem

The brand stripe's navy bar (`#152638`) is nearly invisible on dark backgrounds because:
- The footer background is `bg-primary` → `hsl(213, 52%, 12%)` ≈ `#152638`
- The brand-navy color is `#152638`
- Navy on navy = invisible

## Solution

Make both `BrandLockup` and `BrandStripe` components context-aware, swapping the navy bar to white when displayed on dark backgrounds.

---

## Changes

### File 1: `src/components/BrandLockup.tsx`

Update the stripe rendering to use white instead of navy when `variant="dark"`:

```tsx
// Line 84: Change navy bar color based on variant
<div className={cn(
  "flex-1 rounded-full",
  variant === 'dark' ? 'bg-white' : 'bg-brand-navy',
  stripe.bar
)} />
```

**Full context (lines 78-88):**
```tsx
{showStripe && (
  <div className={cn(
    "flex",
    stripe.container,
    centered && "mx-auto"
  )}>
    <div className={cn(
      "flex-1 rounded-full",
      variant === 'dark' ? 'bg-white' : 'bg-brand-navy',  // Context-aware
      stripe.bar
    )} />
    <div className={cn("flex-1 rounded-full bg-brand-amber", stripe.bar)} />
    <div className={cn("flex-1 rounded-full bg-brand-green", stripe.bar)} />
  </div>
)}
```

---

### File 2: `src/components/BrandStripe.tsx`

Add a `variant` prop to control the color scheme:

```tsx
interface BrandStripeProps {
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  width?: 'full' | 'auto' | number;
  variant?: 'light' | 'dark';  // NEW
  className?: string;
}

const BrandStripe = ({ 
  orientation = 'horizontal', 
  size = 'md',
  width = 'full',
  variant = 'light',  // Default to light (navy bar)
  className 
}: BrandStripeProps) => {
  // ... existing code ...
  
  // First bar: white on dark, navy on light
  const firstBarColor = variant === 'dark' ? 'bg-white' : 'bg-brand-navy';
  
  return (
    <div className={cn(...)}>
      <div className={cn(
        "flex-1",
        firstBarColor,  // Context-aware
        isHorizontal ? "rounded-l-full" : "rounded-t-full"
      )} />
      <div className="flex-1 bg-brand-amber" />
      <div className={cn(
        "flex-1 bg-brand-green",
        isHorizontal ? "rounded-r-full" : "rounded-b-full"
      )} />
    </div>
  );
};
```

---

### File 3: `src/components/FinalCTA.tsx`

Update the BrandStripe usage to use dark variant:

```tsx
// Line 20: Add variant="dark"
<BrandStripe size="lg" variant="dark" />
```

---

### File 4: `src/pages/admin/LogoTesting.tsx`

Update the Logo Wear Preview section to demonstrate the dark variant behavior, confirming visibility on both backgrounds.

---

## Visual Result

```text
BEFORE (Navy bar invisible)         AFTER (White bar visible)

Light Background:                   Light Background:
███ ███ ███                         ███ ███ ███
Navy Amber Green                    Navy Amber Green
  ↑ visible                           ↑ visible

Dark Background:                    Dark Background:
    ███ ███                         ███ ███ ███
    Amber Green                     White Amber Green
  ↑ invisible!                        ↑ visible!
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/BrandLockup.tsx` | Swap navy to white when `variant="dark"` |
| `src/components/BrandStripe.tsx` | Add `variant` prop, swap navy to white on dark |
| `src/components/FinalCTA.tsx` | Pass `variant="dark"` to BrandStripe |
| `src/pages/admin/LogoTesting.tsx` | Update previews to show both variants |

---

## Design Rationale

1. **Accessibility**: Ensures the brand stripe is always visible regardless of background
2. **Brand Integrity**: Maintains the 3-color sequence (first-amber-green) with appropriate contrast
3. **Consistency**: Both `BrandLockup` and `BrandStripe` follow the same variant logic
4. **Backward Compatible**: Default `variant="light"` preserves existing navy behavior

