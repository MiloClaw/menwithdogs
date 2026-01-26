

# Logo Wear Optimization Plan

## Objective

Enhance the BrandLockup and BrandStripe components to ensure they are balanced, centered, and production-ready for logo wear (t-shirts, hats, stickers, embroidery, etc.).

---

## Current Issues Identified

### BrandLockup Component

| Issue | Current | Problem |
|-------|---------|---------|
| Stripe width | Fixed widths (`w-5`, `w-6`, `w-8`) | Bars don't scale proportionally with wordmark |
| Stripe alignment | Left-aligned via `flex` | Not centered under the wordmark |
| Centering support | `inline-block` container | No easy way to center the entire lockup |
| Stripe gaps | Fixed `gap-1` or `gap-1.5` | Creates uneven spacing at different sizes |

### BrandStripe Component

| Issue | Current | Problem |
|-------|---------|---------|
| Width mode | Only `w-full` or fixed height | Cannot create a compact, centered stripe for logos |
| No fixed-width option | Uses `flex-1` | Stripe always expands to fill container |

---

## Solution Overview

### 1. Add Centering Support to BrandLockup

Add a `centered` prop that applies `text-center` and centers the stripe under the wordmark.

### 2. Make Stripe Width Proportional

Replace fixed-width bars with percentage-based widths that match the visual weight of the wordmark.

### 3. Create a Compact Stripe Variant

Add a `compact` option to BrandStripe for logo contexts where we need a self-contained, fixed-width stripe that can be centered independently.

### 4. Add Logo Wear Preview to Admin

Extend the LogoTesting page to include a dedicated "Logo Wear Preview" section showing the centered lockup on merchandise mockups.

---

## Detailed Changes

### File 1: `src/components/BrandLockup.tsx`

**Add centering support:**

```tsx
interface BrandLockupProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showSubtitle?: boolean;
  showStripe?: boolean;
  centered?: boolean;  // NEW
  className?: string;
}
```

**Update stripe configuration for centered, proportional bars:**

```tsx
const stripeConfig = {
  sm: { 
    bar: 'h-0.5',           // Height only - width set by container
    container: 'mt-2 gap-0.5 w-[60%]',  // Proportional width, centered
  },
  md: { 
    bar: 'h-0.5', 
    container: 'mt-3 gap-0.5 w-[60%]',
  },
  lg: { 
    bar: 'h-1', 
    container: 'mt-4 gap-1 w-[60%]',
  },
};
```

**Update render logic for centering:**

```tsx
const BrandLockup = ({ 
  size = 'md', 
  variant = 'light',
  showSubtitle = true,
  showStripe = false,
  centered = false,  // NEW default
  className 
}: BrandLockupProps) => {
  // ... existing code ...

  return (
    <div className={cn(
      "inline-block",
      centered && "text-center",  // Center text when enabled
      className
    )}>
      <span className={cn(
        "block font-serif font-semibold tracking-tight",
        sizes.wordmark,
        colors.wordmark
      )}>
        ThickTimber
      </span>
      {showSubtitle && (
        <span className={cn(
          "block font-sans font-medium uppercase",
          sizes.subtitle,
          colors.subtitle
        )}>
          Social Club
        </span>
      )}
      {showStripe && (
        <div className={cn(
          "flex",
          stripe.container,
          centered && "mx-auto"  // Center stripe when enabled
        )}>
          <div className={cn("flex-1 rounded-full bg-brand-navy")} />
          <div className={cn("flex-1 rounded-full bg-brand-amber")} />
          <div className={cn("flex-1 rounded-full bg-brand-green")} />
        </div>
      )}
    </div>
  );
};
```

**Key changes:**
- `centered` prop enables text centering and stripe centering via `mx-auto`
- Stripe bars now use `flex-1` (equal thirds) instead of fixed widths
- Stripe container has a proportional width (`w-[60%]`) relative to the text
- Reduced gap between bars for tighter visual cohesion

---

### File 2: `src/components/BrandStripe.tsx`

**Add fixed-width mode for logo contexts:**

```tsx
interface BrandStripeProps {
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  width?: 'full' | 'auto' | number;  // NEW - control stripe width
  className?: string;
}

const sizeConfig = {
  sm: { horizontal: 'h-0.5', vertical: 'w-0.5' },
  md: { horizontal: 'h-1', vertical: 'w-1' },
  lg: { horizontal: 'h-1.5', vertical: 'w-1.5' },
};

const widthConfig = {
  full: 'w-full',
  auto: 'w-24',  // Default auto width for logo contexts
};

const BrandStripe = ({ 
  orientation = 'horizontal', 
  size = 'md',
  width = 'full',  // Default to full-width (existing behavior)
  className 
}: BrandStripeProps) => {
  const isHorizontal = orientation === 'horizontal';
  const sizeClass = sizeConfig[size][orientation];
  
  // Determine width class or inline style
  const widthClass = typeof width === 'number' 
    ? undefined 
    : widthConfig[width];
  const widthStyle = typeof width === 'number' 
    ? { width: `${width}px` } 
    : undefined;
  
  return (
    <div 
      className={cn(
        "flex",
        isHorizontal ? "flex-row" : "flex-col h-full",
        isHorizontal && widthClass,
        sizeClass,
        className
      )}
      style={widthStyle}
    >
      <div className={cn(
        "flex-1 bg-brand-navy",
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

**Key changes:**
- `width` prop accepts `'full'` (default), `'auto'` (96px), or a custom number
- Allows fixed-width stripes for logo/merchandise contexts
- Maintains backward compatibility with existing full-width usage

---

### File 3: `src/pages/admin/LogoTesting.tsx`

**Add Logo Wear Preview section:**

```tsx
import BrandLockup from '@/components/BrandLockup';
import BrandStripe from '@/components/BrandStripe';

// Add inside the component, after existing cards:

{/* Logo Wear Preview */}
<Card>
  <CardHeader>
    <CardTitle className="text-lg">Logo Wear Preview</CardTitle>
  </CardHeader>
  <CardContent className="space-y-8">
    <p className="text-sm text-muted-foreground">
      Centered lockup optimized for t-shirts, hats, and merchandise.
    </p>
    
    {/* Light Background - T-shirt */}
    <div className="bg-gray-100 rounded-lg p-12 flex items-center justify-center min-h-[200px]">
      <BrandLockup 
        size="lg" 
        variant="light" 
        showStripe 
        centered 
      />
    </div>
    
    {/* Dark Background - Navy T-shirt */}
    <div className="bg-[hsl(213,52%,12%)] rounded-lg p-12 flex items-center justify-center min-h-[200px]">
      <BrandLockup 
        size="lg" 
        variant="dark" 
        showStripe 
        centered 
      />
    </div>
    
    {/* Stacked Sizes */}
    <div className="grid grid-cols-3 gap-4">
      {(['sm', 'md', 'lg'] as const).map((sz) => (
        <div key={sz} className="bg-muted rounded-lg p-6 flex flex-col items-center justify-center min-h-[160px]">
          <BrandLockup 
            size={sz} 
            showStripe 
            centered 
          />
          <p className="text-xs text-muted-foreground mt-4">{sz}</p>
        </div>
      ))}
    </div>
    
    {/* Standalone Stripe for Hat Brim / Accessory */}
    <div className="space-y-2">
      <p className="text-sm font-medium">Standalone Brand Stripe (hat brim, wristband)</p>
      <div className="flex gap-4 items-center">
        <BrandStripe size="md" width={120} />
        <span className="text-xs text-muted-foreground">120px</span>
      </div>
      <div className="flex gap-4 items-center">
        <BrandStripe size="lg" width={200} />
        <span className="text-xs text-muted-foreground">200px</span>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## Files Summary

| File | Type | Changes |
|------|------|---------|
| `src/components/BrandLockup.tsx` | Update | Add `centered` prop, proportional stripe width, centered stripe via `mx-auto` |
| `src/components/BrandStripe.tsx` | Update | Add `width` prop for fixed-width mode |
| `src/pages/admin/LogoTesting.tsx` | Update | Add Logo Wear Preview section with centered lockups and standalone stripes |

---

## Visual Result

After implementation:

```text
BEFORE (Left-aligned, fixed bars)       AFTER (Centered, proportional)
                                        
ThickTimber                                    ThickTimber
SOCIAL CLUB                                    SOCIAL CLUB
█ █ █ ← uneven gaps, left-aligned        ████████████ ← centered, balanced
                                        
```

**Logo Wear Preview Card:**

```text
┌─────────────────────────────────────────────────────────────────┐
│  Logo Wear Preview                                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │                     ThickTimber                         │    │
│  │                     SOCIAL CLUB                         │    │
│  │                   ██████████████                        │    │
│  │           (Gray T-shirt mockup background)              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │                     ThickTimber                         │    │
│  │                     SOCIAL CLUB                         │    │
│  │                   ██████████████                        │    │
│  │          (Navy T-shirt mockup background)               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Standalone Brand Stripe:                                       │
│  ████████████████████████████████████ 120px                    │
│  ████████████████████████████████████████████████████ 200px    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Order

```text
Step 1: Update BrandLockup component
└── Add centered prop and proportional stripe

Step 2: Update BrandStripe component
└── Add width prop for fixed-width mode

Step 3: Update LogoTesting page
└── Add Logo Wear Preview section with mockups
```

---

## Design Rationale

1. **Centering:** The `centered` prop makes it trivial to use the lockup in any centered context (merchandise, hero sections, email headers)

2. **Proportional stripe:** Using `w-[60%]` ensures the stripe scales visually with the wordmark at any size

3. **Equal-width bars:** `flex-1` on each bar guarantees perfect 1:1:1 color distribution

4. **Backward compatibility:** All existing usages continue to work unchanged; new props are optional

5. **Fixed-width stripe:** Enables use of the brand stripe on accessories where full-width doesn't make sense (hat brims, wristbands, labels)

6. **Admin preview:** Gives stakeholders a dedicated view for approving logo wear assets before production

