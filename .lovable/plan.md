

# Settings Page Copy Refinement Plan

## Overview

After reviewing all copy across the Settings page, I've identified clarity improvements and one functional issue. All changes maintain the existing private, place-centric tone while making the purpose of each preference clearer for new users.

---

## Changes Summary

| File | Change Type | Purpose |
|------|-------------|---------|
| `GeoAffinitySection.tsx` | Copy refinement | Clarify the question |
| `PlaceUsageSection.tsx` | Copy refinement | Remove undefined "these places" reference |
| `OpennessSection.tsx` | Copy + Option refinement | Better align options with the question |
| `AdventureStyleSection.tsx` | Copy refinement | Clarify section title |
| `WeatherFlexibilitySection.tsx` | Copy refinement | Explain what "noting conditions" means |
| `GearReadinessSection.tsx` | Copy refinement | Clarify "appropriate" |
| `NaturePrioritiesSection.tsx` | Copy refinement | Remove product jargon |
| `PatternsSection.tsx` | Remove non-functional button | Fix false affordance |
| `profile-options.ts` | Option refinement | Update OpennessSection options |

---

## Detailed Changes

### 1. GeoAffinitySection.tsx

**Before:**
```
Question: "How do you like to explore?"
Helper: "Helps us understand your discovery style."
```

**After:**
```
Question: "How spread out are your favorite spots?"
Helper: "Helps us know whether to show places nearby or farther out."
```

---

### 2. PlaceUsageSection.tsx

**Before:**
```
Question: "When you go to these places, it's usually for..."
```

**After:**
```
Question: "When you head outdoors, it's usually for..."
```

---

### 3. OpennessSection.tsx + profile-options.ts

**Before:**
```
Question: "How open are you to meeting new people?"
Options:
- I usually keep to myself
- I'm comfortable with familiar faces
- I'm open to casual conversation
- I'm open to meeting others through shared activities
- I'm usually out with a partner or friends  ← doesn't fit the question
```

**After:**
```
Question: "How open are you to meeting new people?"
Options:
- I prefer to keep to myself
- I'm comfortable with familiar faces
- Open to casual conversation
- Happy to connect over shared activities
```

Remove the "I'm usually out with a partner or friends" option since it's about WHO you go with (covered by TrailCompanions), not OPENNESS to new connections.

---

### 4. AdventureStyleSection.tsx

**Before:**
```
Title: "Your usual approach"
Helper: "Helps us match your comfort level."
```

**After:**
```
Title: "Trail comfort"
Helper: "Helps us suggest trails that match your style."
```

---

### 5. WeatherFlexibilitySection.tsx

**Before:**
```
Helper: "We'll note conditions when relevant."
```

**After:**
```
Helper: "Helps us suggest alternatives when conditions change."
```

---

### 6. GearReadinessSection.tsx

**Before:**
```
Helper: "Helps us suggest appropriate spots."
```

**After:**
```
Helper: "Matches you with trails that fit your setup."
```

---

### 7. NaturePrioritiesSection.tsx

**Before:**
```
Helper: "Pick up to 2. Shapes what we surface."
```

**After:**
```
Helper: "Pick up to 2. Helps us find the right spots."
```

---

### 8. PatternsSection.tsx — Remove Non-Functional Button

**Current issue:** The "Looks right" button exists but does nothing when clicked, creating a false affordance.

**Action:** Remove the button until functionality is added. Keep the section as read-only display.

**Before:**
```tsx
<div className="flex gap-2 pt-2">
  <Button variant="outline" size="sm" className="min-h-[44px] gap-2">
    <Check className="h-4 w-4" />
    Looks right
  </Button>
</div>
```

**After:** Remove this block entirely.

---

## Files to Modify

| File | Lines Changed |
|------|---------------|
| `src/components/profile/GeoAffinitySection.tsx` | ~2 lines (question + helper) |
| `src/components/profile/PlaceUsageSection.tsx` | 1 line (question) |
| `src/components/profile/OpennessSection.tsx` | 0 lines (options come from profile-options.ts) |
| `src/lib/profile-options.ts` | ~4 lines (OPENNESS_OPTIONS array) |
| `src/components/profile/AdventureStyleSection.tsx` | ~2 lines (title + helper) |
| `src/components/profile/WeatherFlexibilitySection.tsx` | 1 line (helper) |
| `src/components/profile/GearReadinessSection.tsx` | 1 line (helper) |
| `src/components/profile/NaturePrioritiesSection.tsx` | 1 line (helper) |
| `src/components/profile/PatternsSection.tsx` | ~5 lines (remove button block) |

---

## Persistence Confirmation

User choices **DO remain intact until changed**. The architecture is correct:

1. Each `onChange` handler calls `updatePreferences()` which immediately persists to the database
2. On page load, `useQuery` fetches saved preferences and populates local state
3. The `useEffect` syncs server data to local state when preferences change

No changes needed for persistence logic.

---

## Build Order

```text
Step 1: Update profile-options.ts (OPENNESS_OPTIONS)
Step 2: Update copy in profile section components (parallel)
├── GeoAffinitySection.tsx
├── PlaceUsageSection.tsx
├── AdventureStyleSection.tsx
├── WeatherFlexibilitySection.tsx
├── GearReadinessSection.tsx
└── NaturePrioritiesSection.tsx
Step 3: Remove non-functional button from PatternsSection.tsx
```

---

## Result

After these changes, a new user will:
- Understand the PURPOSE of each preference question
- Not encounter undefined references ("these places")
- Not see options that don't align with the question asked
- Not encounter non-functional UI elements

