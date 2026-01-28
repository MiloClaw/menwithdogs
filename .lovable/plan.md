
# Plan: Update Value Proposition Section Copy

## Summary

Replace all copy in the "What This Is" section with the new messaging that emphasizes ThickTimber as a place-based directory tool focused on shared interests and organic connection.

---

## Current vs New Copy

| Element | Current | New |
|---------|---------|-----|
| **Section Label** | "What This Is" | "What This Is" (unchanged) |
| **Headline** | "An alternative to the dating apps, built around trails, campsites, and the outdoors." | "A place-based directory built around shared interests and the outdoors." |
| **Body Copy** | Single long paragraph | 4 structured paragraphs |
| **Closing Line** | "When you're done with the apps and ready to find your trail." | "Connection starts with showing up." |

---

## Implementation

**File**: `src/components/ValueProposition.tsx`

### 1. Update Headline (Lines 37-38)

```tsx
// Before
An alternative to the dating apps, built around trails, campsites, and the outdoors.

// After
A place-based directory built around shared interests and the outdoors.
```

### 2. Replace Body Copy (Lines 49-55)

Replace the current single paragraph with structured multi-paragraph content:

```tsx
<p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
  ThickTimber is a personalized directory of hiking trails, campsites, beaches, and outdoor places where men with similar interests tend to spend time.
</p>

<p className="text-muted-foreground text-base md:text-lg leading-relaxed">
  Instead of focusing on profiles or constant interaction, the directory is shaped by the places people genuinely enjoy and return to. Members privately save their favorite spots, share hidden gems, and contribute to a growing picture of where community naturally forms in the real world.
</p>

<p className="text-muted-foreground text-base md:text-lg leading-relaxed">
  Over time, patterns emerge. The directory quietly highlights places where men who value similar activities, routines, and outdoor experiences tend to gather—making it easier to plan a day out, discover new areas, and increase the chances of organic connection.
</p>

<p className="text-muted-foreground text-base md:text-lg leading-relaxed">
  ThickTimber is designed as a tool, not a pastime. It works in the background, helping you understand where to go—so you can focus on actually being there.
</p>

<p className="text-muted-foreground/70 text-base md:text-lg font-medium">
  Connection starts with showing up.
</p>
```

---

## Typography Hierarchy

| Element | Style |
|---------|-------|
| First paragraph (intro) | `text-lg md:text-xl` - slightly larger for emphasis |
| Middle paragraphs | `text-base md:text-lg` - standard body size |
| Closing line | `text-base md:text-lg font-medium text-muted-foreground/70` - subtle emphasis |

---

## Technical Notes

- Section label remains unchanged ("What This Is")
- Split layout structure remains unchanged (headline left, body right)
- All Framer Motion animations remain unchanged
- Existing `space-y-6` on the container provides consistent paragraph spacing
- Removes `text-justify` and `my-[3px]` from first paragraph for cleaner typography
