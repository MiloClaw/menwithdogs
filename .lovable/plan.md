

# Replace Remaining Emoji Icons with Lucide Components

## Scope

The Settings page and its profile components are mostly consistent with Lucide icons. However, the prompt definitions in `src/lib/preference-prompts.ts` still contain emoji icons for Phase 1 prompts that should be converted for brand consistency.

---

## Current State

| Prompt | Current Icons | Used In |
|--------|---------------|---------|
| `TIME_PROMPT` | 🌅 ☀️ 🌇 🔀 | Behavioral prompts (triggered during browsing) |
| `DISTANCE_PROMPT` | 📍 🚗 🗺️ | Behavioral prompts |
| `VIBE_PROMPT` | 🤫 ⚖️ 🎉 🤷 | Behavioral prompts (currently disabled) |
| `GEO_PROMPT` | 🎯 🔄 🌐 | Behavioral prompts |

**Already Using Lucide:**
- `INTENT_PROMPT` options (Mountain, Tent, Waves, etc.)
- All Phase 3 prompts (MapPin, Compass, Users, etc.)
- All profile section component headers
- All Settings page section icons

---

## Changes

### Task 1: Update `preference-prompts.ts` - Replace Emoji Icons

**File:** `src/lib/preference-prompts.ts`

Replace all remaining emoji icons with Lucide icon names:

| Prompt | Value | Current | Lucide Replacement |
|--------|-------|---------|-------------------|
| TIME_PROMPT | dawn | 🌅 | `Sunrise` |
| TIME_PROMPT | daytime | ☀️ | `Sun` |
| TIME_PROMPT | golden_hour | 🌇 | `Sunset` |
| TIME_PROMPT | flexible | 🔀 | `Shuffle` |
| DISTANCE_PROMPT | close | 📍 | `MapPin` |
| DISTANCE_PROMPT | medium | 🚗 | `Car` |
| DISTANCE_PROMPT | far | 🗺️ | `Map` |
| VIBE_PROMPT | quiet | 🤫 | `Volume` |
| VIBE_PROMPT | balanced | ⚖️ | `Scale` |
| VIBE_PROMPT | lively | 🎉 | `PartyPopper` |
| VIBE_PROMPT | depends | 🤷 | `HelpCircle` |
| GEO_PROMPT | single_area | 🎯 | `Target` |
| GEO_PROMPT | few_areas | 🔄 | `RefreshCw` |
| GEO_PROMPT | anywhere | 🌐 | `Globe` |

---

### Task 2: Update `PreferencePrompt.tsx` to Render Lucide Icons

**File:** `src/components/preferences/PreferencePrompt.tsx`

This component renders the behavioral prompts. It needs to be updated to dynamically render Lucide icons instead of emoji spans, similar to the pattern already used in `SettingsPreferencesTab.tsx`.

**Changes:**
1. Import the additional Lucide icons needed
2. Create an icon mapping object
3. Update the render logic to use Lucide components when icon name is found in the map

---

## Files Summary

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/lib/preference-prompts.ts` | Replace emoji strings with Lucide icon names |
| Modify | `src/components/preferences/PreferencePrompt.tsx` | Render Lucide icons dynamically |

---

## Icon Mapping Reference

The complete icon map for all prompts will include:

```typescript
const PROMPT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  // Phase 1: Context prompts
  Sunrise,      // TIME: dawn
  Sun,          // TIME: daytime
  Sunset,       // TIME: golden_hour
  Shuffle,      // TIME: flexible
  MapPin,       // DISTANCE: close
  Car,          // DISTANCE: medium
  Map,          // DISTANCE: far
  Volume,       // VIBE: quiet (disabled)
  Scale,        // VIBE: balanced (disabled)
  PartyPopper,  // VIBE: lively (disabled)
  HelpCircle,   // VIBE: depends (disabled)
  Target,       // GEO: single_area
  RefreshCw,    // GEO: few_areas
  Globe,        // GEO: anywhere
  
  // Phase 2: Intent (already done)
  Mountain, Tent, Waves, Sunrise, HeartPulse, TreeDeciduous, Store,
  
  // Phase 3: Outdoor decision (already done)
  Compass, Users, UsersRound, User, Footprints, TrendingUp,
  CloudSun, CloudRain, Backpack, ShoppingBag, Gem,
  TreePine, Bird, ParkingCircle, Dog,
};
```

---

## Build Order

```text
Step 1: Update preference-prompts.ts
├── Replace TIME_PROMPT emoji icons → Lucide names
├── Replace DISTANCE_PROMPT emoji icons → Lucide names
├── Replace VIBE_PROMPT emoji icons → Lucide names
└── Replace GEO_PROMPT emoji icons → Lucide names

Step 2: Update PreferencePrompt.tsx
├── Import all required Lucide icons
├── Create PROMPT_ICONS mapping object
├── Update render logic to check mapping
└── Fallback to emoji span if icon not found
```

---

## Verification

After implementation, all preference-related UI will use Lucide icons:

| Location | Status |
|----------|--------|
| Settings → Profile sections (headers) | Already Lucide |
| Settings → Intent grid | Already Lucide |
| Settings → How you explore (Phase 3) | Already Lucide |
| Behavioral prompts (TIME, DISTANCE, GEO) | Will be Lucide |
| VIBE prompt (disabled) | Will be Lucide (future-proofed) |

