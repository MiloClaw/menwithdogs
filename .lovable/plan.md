
# Plan: About Page — Light Polish & Alignment

## Summary

Light polish pass to align the About page with the harmonized messaging across the site. This removes lingering anti-app framing, softens rigid "not this / not that" language, and standardizes CTAs—all while preserving the page's reflective philosophy and emotional grounding.

---

## Section-by-Section Changes

### 1. Hero Section (Lines 113-120)

| Element | Current | New |
|---------|---------|-----|
| Subtitle | "The story behind ThickTimber" | "The thinking behind ThickTimber" |

**Rationale**: "Thinking" subtly reinforces tool-first positioning, not brand mythology.

---

### 2. The Problem Section (Lines 158-173)

**Current copy issues:**
- "Dating apps promise connection but deliver endless scrolling" — anti-app framing
- "fatigue of apps designed to keep us scrolling" — oppositional tone

**New Body Copy:**

```text
Paragraph 1:
Gay men who enjoy the outdoors—hiking, camping, beaches, swimming holes—often 
struggle to find each other in everyday life.

Paragraph 2:
As more interaction shifted online, it became easier to stay connected digitally, 
but harder to understand where community actually gathers in the real world. 
Whether single or partnered, new to an area or deeply rooted, the question kept 
coming up:

Paragraph 3 (emphasized):
Where do men who love being outdoors actually go?
```

---

### 3. What We're Building Section (Lines 203-216)

**Light polish only—this section is strong:**

```text
Paragraph 1:
ThickTimber is a private directory of outdoor spaces where men who love being 
active tend to gather—shaped by shared place knowledge and community behavior, 
not engagement-driven algorithms.

Paragraph 2:
It helps surface hiking trails, campsites, beaches, swimming holes, and outdoor 
events—places where real life happens and familiarity builds over time.

Paragraph 3 (emphasized):
There's no pressure to interact. No expectation to perform. Just clearer context 
for showing up in the real world, on your own terms.
```

---

### 4. What This Is Not Section (Lines 222-258)

**Major refinement—softening the rigid framing:**

| Element | Current | New |
|---------|---------|-----|
| Section Label | "What This Is Not" | "What This Isn't Built Around" |
| Headline | "Not a dating app. Not a social network." | Remove rigid headline, use single-line version |

**New Headline:**
```text
What This Isn't Built Around
```

**New Body Copy:**
```text
Paragraph 1:
ThickTimber isn't centered on browsing people or competing for attention. 
It doesn't rely on popularity mechanics or constant interaction.

Paragraph 2:
The focus stays on places—and what naturally happens when people keep 
returning to them.
```

**Rationale**: Removes rigid "not a dating app / not a social network" language while preserving the intent. Leaves room for future social features.

---

### 5. Our Principles / Values Section (Lines 9-29)

**Micro-tune the `values` array descriptions:**

```tsx
const values = [
  {
    icon: Shield,
    title: "Privacy by Default",
    description: "Your activity and preferences aren't public. Participation is quiet and intentional."
  },
  {
    icon: Heart,
    title: "Real-World Connection",
    description: "Built to support showing up in real life—not to replace it."
  },
  {
    icon: MapPin,
    title: "Place-First Discovery",
    description: "Community forms around shared spaces, not profiles."
  },
  {
    icon: Users,
    title: "Quiet Community",
    description: "No performance metrics. No pressure. Just shared context."
  }
];
```

---

### 6. Privacy & Trust Section (Lines 304-351)

**No changes needed.** This section is already fully aligned.

---

### 7. The Vision Section (Lines 370-385)

**Tighten the closing statement:**

| Element | Current | New |
|---------|---------|-----|
| Closing | "A nod on the trail. A hello at the campsite. A conversation that starts where you already are." | "A nod on the trail. A familiar face at the campsite. A conversation that starts where you already are." |

**Change**: "hello" → "familiar face" (reinforces the returning/familiarity theme)

---

### 8. CTA Section (Lines 408-435)

| Element | Current | New |
|---------|---------|-----|
| Headline | "Ready to find your trail?" | "Ready to explore?" |
| Subhead | "Discover the outdoor spaces where gay men who love nature already gather." | "Discover the outdoor places where shared interests bring people together." |
| Primary CTA | "Create Free Account" | "Join Free" |
| Secondary CTA | "Explore Outdoors" | "Explore Places" |

---

## Technical Implementation Summary

| Section | Line Range | Change Type |
|---------|------------|-------------|
| Values array | 9-29 | Update descriptions |
| Hero subtitle | 119 | Text change |
| Problem body | 158-173 | Full rewrite (3 paragraphs) |
| Building body | 203-216 | Polish (3 paragraphs) |
| "What This Isn't" section label | 233 | Text change |
| "What This Isn't" headline | 235-239 | Simplify to single line |
| "What This Isn't" body | 249-257 | Rewrite (2 paragraphs) |
| Vision closing | 382-384 | "hello" → "familiar face" |
| CTA headline | 412 | Text change |
| CTA subhead | 414-416 | Text change |
| CTA buttons | 425, 434 | Text changes |

---

## Messaging Guardrails Applied

- Removed "fatigue of apps" framing
- Removed "Dating apps promise connection but deliver endless scrolling"
- Softened "Not a dating app. Not a social network." headline
- Changed to "What This Isn't Built Around" (less rigid)
- Standardized CTAs to "Join Free" / "Explore Places"
- Preserved philosophy without preaching
- Kept emotional grounding in Vision section

---

## Net Result

The About page now:
- Feels confident, not reactive
- Preserves reflective philosophy without anti-app arguments
- Aligns with harmonized Homepage, Pricing, and other marketing pages
- Leaves room for future social features
- Standardizes CTAs across the site
