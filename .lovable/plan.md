

# Plan: Responsive Hero Image Positioning for Desktop

## Problem

The hero image uses `object-center` which works well on mobile (portrait orientation). On desktop (landscape orientation with wider aspect ratio), the image crops differently and the man swimming in the lake gets cut off.

## Solution

Use Tailwind's responsive `object-position` utilities to apply different positioning based on screen size:
- **Mobile**: Keep `object-center` (subject is visible in portrait crop)
- **Desktop**: Use `object-top` to shift the visible portion upward, revealing the man

## File Change

**File**: `src/pages/TagPage.tsx`

**Line 88** - Update the className with responsive positioning:

```tsx
// Before
className="absolute inset-0 w-full h-full object-cover object-center"

// After  
className="absolute inset-0 w-full h-full object-cover object-center md:object-top"
```

## Technical Details

- `object-center` - Default position, keeps center of image visible (good for mobile)
- `md:object-top` - On medium screens and up, anchors to top of image where the man is positioned

This responsive approach ensures the subject remains the focal point on both mobile (using center crop) and desktop (shifting up to reveal the swimmer).

