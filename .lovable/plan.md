

# Plan: Three-Line Headline for All Screen Sizes

## Summary

Update the Hero headline to display each phrase on its own line on both mobile and desktop devices.

---

## Current vs New Layout

| Current | New |
|---------|-----|
| "Real places. Shared interests." / "Real-world connection." (2 lines) | "Real places." / "Shared interests." / "Real-world connection." (3 lines) |

---

## Visual Result (All Viewports)

```
Real places.
Shared interests.
Real-world connection.
```

---

## Implementation

**File**: `src/components/Hero.tsx`

**Lines 49-51**: Update the h1 content to use line breaks after each phrase:

```tsx
<h1 className={`font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 [text-shadow:_0_2px_4px_rgba(0,0,0,0.3)] ${!prefersReducedMotion ? 'animate-fade-in' : ''}`}>
  Real places.<br />
  Shared interests.<br />
  Real-world connection.
</h1>
```

---

## Technical Notes

- Simple unconditional `<br />` tags (no responsive classes needed)
- Each phrase gets its own line on all screen sizes
- No changes to font sizes, colors, animations, or image
- Single file, single edit

