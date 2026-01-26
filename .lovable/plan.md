

# Button Shape Standardization — Settings Page

## Objective

Replace the current `rounded-full` (pill) button shape with `rounded-lg` (8px corners) across all interactive elements on the Settings page. This creates a more structured, masculine aesthetic that aligns with the robust card styling already used in checkbox groups.

---

## Design Decision

| Shape | Visual | Use Case |
|-------|--------|----------|
| `rounded-full` | Softer, feminine | Being replaced |
| `rounded-lg` | Structured, masculine | New standard for Settings |

The `rounded-lg` shape (approx 8px radius via `--radius` CSS variable) matches the checkbox card styling the user selected, providing visual consistency.

---

## Scope

### Files to Modify

| File | Current Shape | Elements Affected |
|------|---------------|-------------------|
| `src/components/ui/button.tsx` | `rounded-full` on all variants | All button variants (default, outline, destructive, secondary, ghost, accent, accent-outline) |
| `src/components/settings/pro/ProOptionChips.tsx` | `rounded-full` override | PRO option chips |
| `src/components/settings/pro/ProSettingsFlow.tsx` | `rounded-full` on skeletons | Loading skeleton chips |

---

## Detailed Changes

### 1. Button Component — Core Variants

**File:** `src/components/ui/button.tsx`

Replace `rounded-full` with `rounded-lg` in all button variants:

```tsx
// Lines 11-27 - buttonVariants

// BEFORE
default: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-sm",
destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full shadow-sm",
outline: "border border-primary/80 bg-transparent text-primary hover:bg-primary hover:text-primary-foreground rounded-full shadow-sm",
secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-full shadow-sm",
ghost: "hover:bg-muted hover:text-foreground rounded-full",
accent: "bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold...",
"accent-outline": "border border-accent/80 bg-transparent text-accent hover:bg-accent hover:text-accent-foreground rounded-full font-semibold...",

// AFTER
default: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm",
destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg shadow-sm",
outline: "border border-primary/80 bg-transparent text-primary hover:bg-primary hover:text-primary-foreground rounded-lg shadow-sm",
secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg shadow-sm",
ghost: "hover:bg-muted hover:text-foreground rounded-lg",
accent: "bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg font-semibold...",
"accent-outline": "border border-accent/80 bg-transparent text-accent hover:bg-accent hover:text-accent-foreground rounded-lg font-semibold...",
```

**Note:** The `nav` and `link` variants don't have explicit border-radius, so no change needed.

---

### 2. PRO Option Chips

**File:** `src/components/settings/pro/ProOptionChips.tsx`

Update the chip buttons from `rounded-full` to `rounded-lg`:

```tsx
// Line 123

// BEFORE
'rounded-full min-h-[44px] px-5 transition-all duration-100 ease-out gap-2',

// AFTER
'rounded-lg min-h-[44px] px-5 transition-all duration-100 ease-out gap-2',
```

---

### 3. PRO Flow Skeleton Loaders

**File:** `src/components/settings/pro/ProSettingsFlow.tsx`

Update skeleton chips to match the new button shape:

```tsx
// Line 37

// BEFORE
<Skeleton key={j} className="h-11 w-24 rounded-full" />

// AFTER
<Skeleton key={j} className="h-11 w-24 rounded-lg" />
```

---

## Visual Result

After implementation:

```text
BEFORE (Pill Shape)              AFTER (Structured Shape)
┌──────────────────────────┐     ┌──────────────────────────┐
│  (    Update Password   )│     │  ┌──────────────────┐    │
│  (    Manage Account    )│     │  │  Update Password │    │
│  (    Delete Account    )│     │  │  Manage Account  │    │
│                          │     │  │  Delete Account  │    │
│  Intent Grid:            │     │                          │
│  ( 🏔️ Trails )           │     │  Intent Grid:            │
│  ( ⛺ Campgrounds )       │     │  ┌────────┐ ┌──────────┐ │
│                          │     │  │🏔️ Trails│ │⛺ Camps  │ │
│  PRO Chips:              │     │                          │
│  ( Solo seeker )         │     │  PRO Chips:              │
│  ( Small crew )          │     │  ┌───────────┐           │
└──────────────────────────┘     │  │Solo seeker│           │
                                 └──────────────────────────┘
```

---

## Implementation Order

```text
Step 1: Update core button component
└── src/components/ui/button.tsx (affects all buttons site-wide)

Step 2: Update settings-specific overrides (parallel)
├── src/components/settings/pro/ProOptionChips.tsx
└── src/components/settings/pro/ProSettingsFlow.tsx
```

---

## Impact Analysis

**Settings Page:**
- All buttons will have `rounded-lg` corners
- Intent grid buttons will match checkbox cards
- PRO chips will have consistent styling
- Skeleton loaders will match loaded state

**Site-Wide:**
- This change affects the core button component
- All pages using `<Button>` will get the new shape
- This creates brand consistency across the entire app
- Matches the structured, masculine aesthetic of ThickTimber

---

## Alternative Approach (If Needed)

If you want to keep `rounded-full` buttons elsewhere on the site but only use `rounded-lg` on the Settings page, I could instead:

1. Create a `settings` variant in the button component
2. Or pass `className="rounded-lg"` overrides only on Settings page buttons

Let me know if you'd prefer the site-wide change or a Settings-only approach.

