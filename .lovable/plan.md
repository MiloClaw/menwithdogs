
# Plan: Restyle TagPage to Match Landing Page Design

## Summary

Transform the existing TagPage from a basic article layout into a branded editorial experience matching the site's landing pages (like /outdoors, /about, /couples). The uploaded image of a man swimming in a mountain lake will be incorporated as a hero image.

---

## Design Analysis

The current TagPage uses:
- Simple container with `max-w-3xl` constraint
- Basic typography without serif headings
- No motion/animation
- No branded sections or visual hierarchy

Landing pages use:
- Framer Motion animations with scroll-triggered reveals
- Serif typography (`font-serif`) for all headings
- Numbered section markers (`01 — Section Name`)
- Ghost/parallax background elements
- Alternating section backgrounds (light → primary → light)
- Card grids for feature lists
- Strong CTA sections with `bg-primary`

---

## Implementation Tasks

### Task 1: Add Hero Image to Assets

Copy the uploaded image to the project assets folder for use in the hero section.

**Action**: Copy `user-uploads://Gemini_Generated_Image_we85zswe85zswe85.png` to `src/assets/tag-clothing-optional-hero.png`

---

### Task 2: Restructure TagPage Component

Transform the layout to match landing page patterns:

```text
NEW STRUCTURE:
┌─────────────────────────────────────────────────────────────────┐
│ Hero Section (with image, parallax effect)                      │
│   - Full-width image with gradient overlay                      │
│   - Title + subtitle centered over image                        │
│   - Framer Motion fade-in animations                           │
├─────────────────────────────────────────────────────────────────┤
│ Section 01 — Understanding (markdown body)                      │
│   - Ghost parallax number in background                         │
│   - Prose styling with serif headings                          │
├─────────────────────────────────────────────────────────────────┤
│ Section 02 — Community Guidelines (if applicable)               │
│   - bg-primary text-primary-foreground                          │
│   - Bullet list with styled markers                            │
├─────────────────────────────────────────────────────────────────┤
│ Section 03 — Places with this Tag                               │
│   - Card grid (existing, enhanced styling)                      │
├─────────────────────────────────────────────────────────────────┤
│ CTA Section (external link)                                     │
│   - bg-primary with accent buttons                              │
│   - "Join the Community" call to action                        │
└─────────────────────────────────────────────────────────────────┘
```

---

### Task 3: Component Code Changes

**File**: `src/pages/TagPage.tsx`

Key modifications:

**A. Add imports for Framer Motion and hero image**
```tsx
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import heroImage from "@/assets/tag-clothing-optional-hero.png";
```

**B. Create hero section with image overlay**
```tsx
<section ref={heroRef} className="relative h-[400px] md:h-[500px] overflow-hidden">
  <motion.img 
    src={heroImage}
    alt="Outdoor swimming in nature"
    className="absolute inset-0 w-full h-full object-cover"
    style={{ y: imageY }} // parallax effect
  />
  <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/50 to-primary/80" />
  
  <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 px-4">
    <motion.span className="font-mono text-xs tracking-[0.2em] uppercase text-white/80 mb-4">
      Community Tag
    </motion.span>
    <motion.h1 className="font-serif text-4xl md:text-5xl text-white text-center">
      {tagPage.title}
    </motion.h1>
  </div>
</section>
```

**C. Add numbered section structure**
```tsx
<section className="py-16 md:py-24 relative overflow-hidden">
  <motion.div className="absolute text-[25vw] font-serif text-primary/[0.03]">01</motion.div>
  <div className="container max-w-3xl relative z-10">
    <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground">
      01 — Understanding
    </span>
    <article className="prose prose-lg font-serif">
      <ReactMarkdown>{tagPage.body_markdown}</ReactMarkdown>
    </article>
  </div>
</section>
```

**D. Style CTA section with primary background**
```tsx
<section className="py-16 md:py-24 bg-primary text-primary-foreground">
  <div className="container max-w-2xl text-center">
    <span className="font-mono text-xs tracking-[0.2em] uppercase text-primary-foreground/70">
      Connect
    </span>
    <h2 className="font-serif text-2xl md:text-3xl mb-6">
      Looking for more?
    </h2>
    <p className="text-primary-foreground/80 mb-8">
      For members who want to discuss more sensitive topics...
    </p>
    <Button size="lg" variant="secondary">Join the Community</Button>
  </div>
</section>
```

---

### Task 4: Enhanced Place Cards Section

Add motion animations to the places grid:

```tsx
<section className="py-16 md:py-24 bg-surface/50">
  <div className="container max-w-4xl">
    <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
      Discover
    </span>
    <h2 className="font-serif text-2xl md:text-3xl mb-8">
      Places tagged "{tagPage.canonical_tags.label}"
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {places.map((place, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {/* Card content */}
        </motion.div>
      ))}
    </div>
  </div>
</section>
```

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/assets/tag-clothing-optional-hero.png` | Create (copy) | Hero image for clothing optional page |
| `src/pages/TagPage.tsx` | Modify | Complete redesign with motion, sections, hero image |

---

## Visual Comparison

**Before (Current)**
```text
┌────────────────────────────────┐
│ ← Back to Places               │
│ Clothing Optional              │
│ Understanding this community   │
│                                │
│ [Plain markdown body]          │
│                                │
│ [Simple external link card]    │
│                                │
│ Places tagged...               │
│ [Basic card grid]              │
└────────────────────────────────┘
```

**After (Redesigned)**
```text
┌────────────────────────────────┐
│ [HERO IMAGE - Mountain Lake]  │
│     ░░░░░ gradient ░░░░░      │
│                                │
│     COMMUNITY TAG              │
│     Clothing Optional          │
│     (centered serif heading)   │
├────────────────────────────────┤
│ 01 — Understanding             │
│ ┌──────────────────────────┐  │
│ │ Ghost "01" in background │  │
│ └──────────────────────────┘  │
│ [Prose content with motion]    │
├────────────────────────────────┤
│ [PRIMARY BACKGROUND SECTION]  │
│                                │
│ 02 — Community Guidelines      │
│ • Respect local laws           │
│ • Practice consent             │
│ • Leave no trace               │
├────────────────────────────────┤
│ [LIGHT BACKGROUND]             │
│                                │
│ 03 — Discover                  │
│ [Animated place cards grid]    │
├────────────────────────────────┤
│ [PRIMARY BACKGROUND CTA]       │
│                                │
│ Looking for more?              │
│ [Join the Community] button    │
└────────────────────────────────┘
```

---

## Technical Considerations

- **Conditional hero image**: The hero image is specifically for the "clothing_optional" tag. Other tag pages will fall back to a text-only hero with a subtle background pattern
- **Framer Motion**: Already installed in the project (used by /outdoors, /about, /couples)
- **Responsive design**: Hero height adjusts for mobile (`h-[400px] md:h-[500px]`)
- **Mobile-first**: All touch targets remain accessible, parallax respects reduced-motion preferences
- **SEO preserved**: Schema and meta tags remain intact
