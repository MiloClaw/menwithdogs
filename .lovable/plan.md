
# Scroll Indicator Animation

Add a subtle, animated scroll indicator at the bottom of the Hero section to encourage users to scroll down and discover more content.

## Design Approach

**Position**: Centered at the bottom of the CTA section, just above the fold where ValueProposition begins

**Style**: A minimal chevron/arrow pointing down with a gentle bouncing animation that:
- Appears after a short delay (giving users time to read the hero content)
- Uses a subtle bounce animation to draw attention
- Respects `prefers-reduced-motion` for accessibility
- Fades out as the user starts scrolling
- Includes "Scroll to explore" or "Learn more" text label

**Visual Design**:
- Uses brand colors (muted foreground for subtlety)
- ChevronDown icon from Lucide (already in project)
- Soft opacity that doesn't distract from main CTAs

## Implementation Details

### 1. Add scroll indicator keyframe animation to Tailwind config

```text
// tailwind.config.ts - Add to keyframes
"bounce-gentle": {
  "0%, 100%": { transform: "translateY(0)" },
  "50%": { transform: "translateY(6px)" }
}

// Add to animations
"bounce-gentle": "bounce-gentle 2s ease-in-out infinite"
```

### 2. Update Hero component

Add scroll indicator element at the bottom of the CTA section:

```text
// Below the button group, before closing </div> of CTA Section
<div 
  className="mt-8 flex flex-col items-center gap-2 cursor-pointer"
  onClick={scrollToValueProp}
  style={{ opacity: scrollY > 50 ? 0 : 1, transition: 'opacity 0.3s' }}
>
  <span className="text-xs text-muted-foreground/70 tracking-wide uppercase">
    Scroll to explore
  </span>
  <ChevronDown 
    className={`w-5 h-5 text-muted-foreground/50 ${
      !prefersReducedMotion ? 'animate-bounce-gentle' : ''
    }`} 
  />
</div>
```

Add scroll function:
```text
const scrollToValueProp = () => {
  document.querySelector('section[class*="py-28"]')?.scrollIntoView({
    behavior: 'smooth'
  });
};
```

### 3. Files to modify

| File | Change |
|------|--------|
| `tailwind.config.ts` | Add `bounce-gentle` keyframe and animation |
| `src/components/Hero.tsx` | Add scroll indicator with animation, fade-on-scroll logic |

## Accessibility Considerations

- Respects `prefers-reduced-motion` (already tracked in Hero)
- Clickable for keyboard/touch users
- Text label provides context for screen readers
- Animation is subtle and non-distracting
