
# Plan: Fix Hero Image Subject Visibility on Desktop

## Problem

The current implementation uses:
- `object-center` on mobile (works - man is visible)
- `md:object-top` on desktop (fails - shows sky/gradient, man is cropped out)

The man swimming in the lake is positioned in the **center-to-lower portion** of the image. Using `object-top` on desktop shows the top of the image (sky and mountains) while completely cropping out the subject.

## Solution

Replace `md:object-top` with a custom `object-position` that targets the vertical center of the image where the man is located. Based on the image composition, using `object-[center_40%]` will show the upper-middle portion where the subject sits.

Alternatively, we can use a simpler approach: keep `object-center` for all screen sizes since the man is centered in the image, and the issue may be related to the **parallax transform** pushing the image up on desktop.

## Recommended Fix

Use an arbitrary Tailwind value to fine-tune the position: `md:object-[center_35%]`

This positions the visible area at 35% from the top on desktop, which should reveal the man while still showing the beautiful mountain backdrop.

## File Change

**File**: `src/pages/TagPage.tsx`  
**Line 88** - Update the className:

```tsx
// Before
className="absolute inset-0 w-full h-full object-cover object-center md:object-top"

// After  
className="absolute inset-0 w-full h-full object-cover object-center md:object-[center_35%]"
```

## Technical Details

- `object-[center_35%]` - Arbitrary value that sets `object-position: center 35%`
- This keeps horizontal centering while positioning the visible vertical area at 35% from the top
- May need adjustment after testing (could try 30%, 40%, or 45% depending on exact subject placement)

## Alternative Approach

If the arbitrary value doesn't work well, we can use inline styles for more precise control:

```tsx
<motion.img 
  src={heroImage}
  alt={`${tagPage.title} - outdoor setting`}
  className="absolute inset-0 w-full h-full object-cover"
  style={{ 
    y: imageY,
    objectPosition: 'center 35%' // Fine-tunable
  }}
/>
```

This gives us direct control over the object-position regardless of screen size and can be easily adjusted.
