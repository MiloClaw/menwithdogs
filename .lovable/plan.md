

# Plan: Update "Who This Is For" Section

## Summary

Transform the current contrarian "WhoThisIsNotFor" section into a positive, welcoming "Who This Works Well For" section with structured copy about the ideal user profile.

---

## Current vs New Content

| Element | Current | New |
|---------|---------|-----|
| **Headline** | "Real community doesn't happen in an app." | "Who This Works Well For" |
| **Body Structure** | 4-item exclusion list | Intro paragraph + 5-item checklist + closing statements + boundary statement |
| **Tone** | Contrarian/negative framing | Positive/inclusive framing |
| **Content Focus** | What we don't have | Who benefits from this tool |

---

## New Content Structure

```text
Headline: Who This Works Well For

Intro: ThickTimber is designed for men who enjoy outdoor and active 
lifestyles and are curious about connecting more organically through 
shared interests and places.

Label: It works especially well if you:

Checklist:
✓ Spend time hiking, camping, running, cycling, or being active outdoors
✓ Enjoy discovering new places and revisiting the ones that feel right
✓ Prefer low-pressure ways to meet people in the real world
✓ Value privacy and don't want your interests or routines on public display
✓ Like the idea of a tool that supports real-world experiences without demanding constant attention

Closing Statements:
You don't need to be especially social.
You don't need to be new to an area.
You just need to enjoy showing up.

Boundary Statement:
ThickTimber isn't built around browsing people or chasing attention.
It's built around places—and what happens when people keep returning to them.
```

---

## Implementation

**File**: `src/components/WhoThisIsNotFor.tsx`

### 1. Update Component Data

Replace the `exclusions` array with a `traits` array for the checklist items:

```tsx
const traits = [
  "Spend time hiking, camping, running, cycling, or being active outdoors",
  "Enjoy discovering new places and revisiting the ones that feel right",
  "Prefer low-pressure ways to meet people in the real world",
  "Value privacy and don't want your interests or routines on public display",
  "Like the idea of a tool that supports real-world experiences without demanding constant attention"
];
```

### 2. Restructure JSX Layout

Replace the current grid layout with a new structure:

```tsx
{/* Headline */}
<h2>Who This Works Well For</h2>

{/* Intro paragraph */}
<p>ThickTimber is designed for men who enjoy outdoor and active lifestyles...</p>

{/* Checklist label */}
<p>It works especially well if you:</p>

{/* Traits checklist with Check icons */}
<ul>
  {traits.map((trait, i) => (
    <li><Check /> {trait}</li>
  ))}
</ul>

{/* Closing statements */}
<div>
  <p>You don't need to be especially social.</p>
  <p>You don't need to be new to an area.</p>
  <p>You just need to enjoy showing up.</p>
</div>

{/* Boundary statement */}
<p>ThickTimber isn't built around browsing people or chasing attention.
   It's built around places—and what happens when people keep returning to them.</p>
```

### 3. Add Check Icon Import

```tsx
import { Check } from "lucide-react";
```

---

## Visual Design

| Element | Styling |
|---------|---------|
| Background | Keep `bg-primary text-primary-foreground` (dark section) |
| Headline | `font-serif text-3xl md:text-4xl lg:text-5xl font-semibold` |
| Intro paragraph | `text-lg md:text-xl text-primary-foreground/80` |
| Checklist label | `text-primary-foreground/70 font-medium` |
| Checklist items | `text-primary-foreground/80` with Check icon in accent color |
| Closing statements | `text-primary-foreground/90 font-medium` (stacked, centered) |
| Boundary statement | `text-primary-foreground/60 text-base` (subtle, smaller) |

---

## Animation Preservation

- Keep existing Framer Motion scroll-triggered animations
- Keep parallax ghost symbol effect (update symbol if desired)
- Stagger checklist item animations similar to current exclusions

---

## Technical Notes

- Component filename remains `WhoThisIsNotFor.tsx` (can be renamed later if desired)
- Keep the dark `bg-primary` section styling for visual contrast
- Use `Check` icon from lucide-react for checklist items
- Maintain mobile-first responsive design with centered text on small screens

