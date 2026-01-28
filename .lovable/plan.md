

# Plan: Center Hero Image Subject on All Devices

## Summary

Add `object-center` to the hero image to ensure the main subject (the man) remains centered when the image is cropped on different screen sizes and aspect ratios.

---

## Current Issue

The hero image uses `object-cover` which scales the image to fill the container and crops overflow. However, without explicit positioning, the default behavior may not keep the subject centered on all devices, especially on mobile where the viewport is narrower.

---

## Solution

Add `object-center` class to the `motion.img` element. This Tailwind utility sets `object-position: center` which ensures the center of the image remains visible when cropping occurs.

---

## File Change

**File**: `src/pages/TagPage.tsx`

**Line 88** - Update the className:

```tsx
// Before
className="absolute inset-0 w-full h-full object-cover"

// After  
className="absolute inset-0 w-full h-full object-cover object-center"
```

---

## Technical Details

- `object-cover` - Scales image to fill container, cropping as needed
- `object-center` - Anchors the crop to the center of the image

This combination ensures the man swimming in the lake remains the focal point regardless of whether the user is on mobile (portrait) or desktop (landscape).

