

# Plan: Update Pricing Page — Refined & Aligned

## Summary

Comprehensive update to the Pricing page with refined copy across all sections: hero, pricing cards, privacy callout, how-it-works explainer, and final CTA. Updates include new price point ($1.99), standardized CTAs, and aligned messaging that removes "unlock" language and "overlap" abstractions.

---

## Section-by-Section Changes

### 1. Page Hero

| Element | Current | New |
|---------|---------|-----|
| Section Label | "Membership" | "Membership" (unchanged) |
| Headline | "One directory. Two ways to use it." | "One directory. Two ways to use it." (unchanged) |
| Subhead | "The same places. The same community. Pro just helps you find where your patterns overlap." | "The same places. The same community. PRO simply helps the directory understand you more precisely." |

**Line Changes**: Update line 124

---

### 2. Free Tier Card

| Element | Current | New |
|---------|---------|-----|
| Title | "Free Membership" | "Free Directory" |
| Price | "$0" | "$0" (unchanged) |
| Description | "The full directory, shaped by the community." | "Community-powered discovery, designed for real-world use." |
| CTA (logged out) | "Get started" | "Join Free" |
| CTA (logged in) | "Explore places" | "Explore Places" |

**Features Update** (line 9):
```tsx
const freeFeatures = [
  "Full access to outdoor places in the directory",
  "Recommendations shaped by community patterns",
  "Save favorites and build your personal list",
  "Location-aware suggestions as you explore",
  "Your activity and preferences remain private"
];
```

---

### 3. PRO Tier Card

| Element | Current | New |
|---------|---------|-----|
| Title | "Pro Personalization" | "PRO Personalization" |
| Price | "$4.99 / month" | "$1.99 / month" |
| Description | "Unlock where your interests and patterns overlap with others." | "Private tuning for more precise recommendations." |
| CTA | "Add personalization" | "Add Personalization" |

**Features Update** (line 10):
```tsx
const proFeatures = [
  "Everything in the Free Directory",
  "Add outdoor interests, activity level, and preferences privately",
  "Refine recommendations based on routines and hobbies",
  "Surface places aligned with how you like to spend time",
  "Intelligence that improves as you use the directory"
];
```

---

### 4. Privacy Callout Section

| Element | Current | New |
|---------|---------|-----|
| Section Label | "Privacy First" | "Privacy First" (unchanged) |
| Headline | "Your preferences are private. Always." | "Your preferences are private. Always." (unchanged) |
| Body | Current paragraph with "smarter results" | Refined copy with line breaks |

**New Body Copy**:
```
Any preferences added through PRO are never visible to others.
They're used only to help the directory better understand what's relevant to you.

No public profiles.
No exposure.
Just clearer, more useful results.
```

---

### 5. How It Works Explainer

| Element | Current | New |
|---------|---------|-----|
| Section Label | "How It Works" | "How Personalization Works" |
| Headline Left | "Free shows you where the community goes." | "Free shows you where the community gathers." |
| Headline Right | "Pro shows you where *your* community goes." | "PRO helps you see where it fits you best." |
| Body Paragraphs | Current 3 paragraphs | Refined 2 paragraphs + closing |

**New Body Copy**:
```
Paragraph 1: The free directory highlights places based on shared patterns 
across the entire community—reflecting where men tend to go and return to over time.

Paragraph 2: PRO allows you to add more context privately, such as interests, 
activity preferences, and routines. This helps the directory surface places 
that align more closely with how you like to spend your time.

Closing: Both make the directory better.
PRO simply makes it more precise for you.
```

---

### 6. Final CTA Section

| Element | Current | New |
|---------|---------|-----|
| Section Label | "Ready?" | "Ready?" (unchanged) |
| Headline | "Ready to explore?" | "Ready to explore?" (unchanged) |
| Primary CTA | "Create Free Account" | "Join Free" |
| Secondary CTA | "Explore Outdoors" | "Explore Places" |

---

## Technical Implementation

**File**: `src/pages/Pricing.tsx`

### Data Arrays (Lines 9-10)
```tsx
const freeFeatures = [
  "Full access to outdoor places in the directory",
  "Recommendations shaped by community patterns",
  "Save favorites and build your personal list",
  "Location-aware suggestions as you explore",
  "Your activity and preferences remain private"
];

const proFeatures = [
  "Everything in the Free Directory",
  "Add outdoor interests, activity level, and preferences privately",
  "Refine recommendations based on routines and hobbies",
  "Surface places aligned with how you like to spend time",
  "Intelligence that improves as you use the directory"
];
```

### Hero Subhead (Line 124)
```tsx
The same places. The same community.
PRO simply helps the directory understand you more precisely.
```

### Free Card Updates (Lines 156-178)
- Title: "Free Directory"
- Description: "Community-powered discovery, designed for real-world use."
- CTA: `{user ? "Explore Places" : "Join Free"}`

### PRO Card Updates (Lines 195-220)
- Price: "$1.99 / month"
- Description: "Private tuning for more precise recommendations."

### Privacy Body (Lines 259-262)
Multi-line structure with cleaner copy

### How It Works (Lines 286-321)
- Section label: "How Personalization Works"
- Headline updates for Free and PRO
- Refined body paragraphs

### Final CTA (Lines 382-386)
- Primary: "Join Free"
- Secondary: "Explore Places"

---

## Typography Notes

| Element | Approach |
|---------|----------|
| PRO capitalization | Use "PRO" consistently (not "Pro") |
| Multi-line privacy body | Use `<br />` for line breaks within paragraph |
| Closing statement styling | Keep `font-medium text-foreground` for emphasis |

---

## Messaging Guardrails Applied

- Removed "unlock" language from PRO description
- Removed "overlap" abstraction from hero
- Removed "relationship dynamics" mention (too dating-adjacent)
- Changed "smarter" to "more precise" (less algorithmic feeling)
- Used "gathers" instead of "goes" (more organic)

