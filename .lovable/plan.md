

# Phase 3: Outdoor Decision-Style Preferences
## Revised Plan for Hiking, Camping & Nature-Focused Gay Men

---

## Why This Revision?

The current Phase 3 meta-preferences use **generic urban venue language** that doesn't serve users looking for trails, campgrounds, and outdoor experiences:

| Current (Urban) | Problem |
|-----------------|---------|
| "Loud music" | Irrelevant on a trail |
| "Convenience & ease" | Vague for nature context |
| "Tight spaces" | Indoor concern |
| "Long waits" | Doesn't apply to trailheads |

The revised plan replaces these with **outdoor decision-style preferences** that act as soft multipliers for trail, campground, and nature recommendations.

---

## Revised Meta-Preferences

These explain **HOW outdoor enthusiasts make decisions**, not what they want. They apply as soft multipliers in the intelligence system.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│               REVISED PHASE 3: OUTDOOR DECISION PREFERENCES                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ADVENTURE STYLE (single-select)                                     │   │
│  │ "When you head outdoors, what's your usual approach?"               │   │
│  │                                                                     │   │
│  │   well_marked   → Stick to well-marked, popular trails              │   │
│  │   mix_both      → Mix of established and off-the-beaten-path        │   │
│  │   explore_remote→ Seek out remote, less-traveled spots              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ TRAIL COMPANIONS (single-select)                                    │   │
│  │ "Who do you usually go outdoors with?"                              │   │
│  │                                                                     │   │
│  │   solo          → Usually solo                                      │   │
│  │   small_group   → With 1-2 close friends                            │   │
│  │   group         → Larger group or organized outings                 │   │
│  │   mix           → Depends on the day                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ EFFORT PREFERENCE (single-select)                                   │   │
│  │ "What kind of effort feels right for you?"                          │   │
│  │                                                                     │   │
│  │   easy          → Easy / casual pace                                │   │
│  │   moderate      → Moderate challenge                                │   │
│  │   strenuous     → Push myself / strenuous                           │   │
│  │   varies        → Varies by mood                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ WEATHER FLEXIBILITY (single-select)                                 │   │
│  │ "How do you feel about less-than-ideal weather?"                    │   │
│  │                                                                     │   │
│  │   fair_only     → I prefer clear, fair conditions                   │   │
│  │   light_weather → Light rain / overcast is fine                     │   │
│  │   any_weather   → I go out in almost anything                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ GEAR READINESS (single-select)                                      │   │
│  │ "How equipped are you for outdoor adventures?"                      │   │
│  │                                                                     │   │
│  │   casual        → Basics only (day pack, sneakers)                  │   │
│  │   equipped      → Well-equipped (proper boots, layers)              │   │
│  │   ultralight    → Dialed in (technical gear, ultralight)            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ NATURE PRIORITIES (multi-select, max 2)                             │   │
│  │ "When picking a spot, what matters most to you?"                    │   │
│  │                                                                     │   │
│  │   solitude      → Solitude & quiet                                  │   │
│  │   scenery       → Scenic beauty                                     │   │
│  │   wildlife      → Wildlife / nature immersion                       │   │
│  │   accessibility → Easy access & parking                             │   │
│  │   dog_friendly  → Dog-friendly                                      │   │
│  │   water_access  → Water access (lake, river, ocean)                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

The existing columns will be repurposed with outdoor-aligned values:

| Column | Type | Outdoor Usage |
|--------|------|---------------|
| `uncertainty_tolerance` | text | → `adventure_style` (well_marked / mix_both / explore_remote) |
| `return_preference` | text | → `trail_companions` (solo / small_group / group / mix) |
| `planning_horizon` | text | → `effort_preference` (easy / moderate / strenuous / varies) |
| `sensory_sensitivity` | jsonb | → `nature_priorities` (multi-select array) |
| `choice_priority` | jsonb | *(Retained but with outdoor options)* |

**New columns needed:**

| Column | Type | Purpose |
|--------|------|---------|
| `weather_flexibility` | text | fair_only / light_weather / any_weather |
| `gear_readiness` | text | casual / equipped / ultralight |

---

## Tasks

### Task 1: Database Migration

Add 2 new columns to `user_preferences`:

```sql
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS weather_flexibility text,
ADD COLUMN IF NOT EXISTS gear_readiness text;
```

---

### Task 2: Update `preference-prompts.ts`

Replace the Phase 3 prompt definitions with outdoor-focused versions:

**Replace:**
- `CHOICE_PRIORITY_PROMPT` → `NATURE_PRIORITIES_PROMPT` (multi-select, max 2)
- `UNCERTAINTY_PROMPT` → `ADVENTURE_STYLE_PROMPT` (single-select)
- `RETURN_PREF_PROMPT` → `TRAIL_COMPANIONS_PROMPT` (single-select)
- `PLANNING_PROMPT` → `EFFORT_PREFERENCE_PROMPT` (single-select)
- `SENSORY_PROMPT` → *(Remove - not relevant outdoors)*

**Add:**
- `WEATHER_FLEXIBILITY_PROMPT` (single-select)
- `GEAR_READINESS_PROMPT` (single-select)

---

### Task 3: Update `profile-options.ts`

Add outdoor-focused option arrays:

```typescript
// Phase 3: Outdoor Decision-Style Preferences

export const ADVENTURE_STYLE_OPTIONS: ProfileOption[] = [
  { key: 'well_marked', label: 'Stick to well-marked trails' },
  { key: 'mix_both', label: 'Mix of established and off-path' },
  { key: 'explore_remote', label: 'Seek out remote spots' },
];

export const TRAIL_COMPANIONS_OPTIONS: ProfileOption[] = [
  { key: 'solo', label: 'Usually solo' },
  { key: 'small_group', label: 'With 1-2 close friends' },
  { key: 'group', label: 'Larger groups / organized outings' },
  { key: 'mix', label: 'Depends on the day' },
];

export const EFFORT_PREFERENCE_OPTIONS: ProfileOption[] = [
  { key: 'easy', label: 'Easy / casual pace' },
  { key: 'moderate', label: 'Moderate challenge' },
  { key: 'strenuous', label: 'Push myself / strenuous' },
  { key: 'varies', label: 'Varies by mood' },
];

export const WEATHER_FLEXIBILITY_OPTIONS: ProfileOption[] = [
  { key: 'fair_only', label: 'Clear, fair conditions' },
  { key: 'light_weather', label: 'Light rain / overcast is fine' },
  { key: 'any_weather', label: 'I go out in almost anything' },
];

export const GEAR_READINESS_OPTIONS: ProfileOption[] = [
  { key: 'casual', label: 'Basics only (day pack, sneakers)' },
  { key: 'equipped', label: 'Well-equipped (boots, layers)' },
  { key: 'ultralight', label: 'Dialed in (technical, ultralight)' },
];

export const NATURE_PRIORITIES_OPTIONS: ProfileOption[] = [
  { key: 'solitude', label: 'Solitude & quiet' },
  { key: 'scenery', label: 'Scenic beauty' },
  { key: 'wildlife', label: 'Wildlife / nature' },
  { key: 'accessibility', label: 'Easy access & parking' },
  { key: 'dog_friendly', label: 'Dog-friendly' },
  { key: 'water_access', label: 'Water access' },
];
```

---

### Task 4: Create Section Components

Create 6 new profile section components in `src/components/profile/`:

| Component | Type | Icon |
|-----------|------|------|
| `AdventureStyleSection.tsx` | Single-select RadioGroup | `Compass` |
| `TrailCompanionsSection.tsx` | Single-select RadioGroup | `Users` |
| `EffortPreferenceSection.tsx` | Single-select RadioGroup | `TrendingUp` |
| `WeatherFlexibilitySection.tsx` | Single-select RadioGroup | `CloudRain` |
| `GearReadinessSection.tsx` | Single-select RadioGroup | `Backpack` |
| `NaturePrioritiesSection.tsx` | Multi-select (max 2) | `Mountain` |

Each component follows the existing pattern from `DistanceSection.tsx`:
- Lucide icon + title
- Muted helper text
- Radio buttons or checkbox group
- Disabled state when updating

---

### Task 5: Update `useUserPreferences.ts`

Ensure the hook handles the new columns:

```typescript
// Types
weather_flexibility?: string | null;
gear_readiness?: string | null;

// In updatePreferences mutation
...updatedData,
weather_flexibility: data.weather_flexibility,
gear_readiness: data.gear_readiness,
```

---

### Task 6: Wire Components into SettingsPreferencesTab

Add the outdoor decision sections in a new collapsible group:

```tsx
<Collapsible defaultOpen={false}>
  <CollapsibleTrigger className="flex items-center gap-2 w-full">
    <Compass className="h-4 w-4 text-muted-foreground/70" />
    <span className="text-base font-medium">How you explore</span>
    <ChevronDown className="ml-auto h-4 w-4" />
  </CollapsibleTrigger>
  <CollapsibleContent className="space-y-6 pt-4">
    <AdventureStyleSection ... />
    <TrailCompanionsSection ... />
    <EffortPreferenceSection ... />
    <WeatherFlexibilitySection ... />
    <GearReadinessSection ... />
    <NaturePrioritiesSection ... />
  </CollapsibleContent>
</Collapsible>
```

---

### Task 7: Replace Emoji Icons with Lucide

Update `INTENT_PROMPT.options` in `preference-prompts.ts`:

| Current | Lucide Icon |
|---------|-------------|
| 🥾 Trails & hikes | `Mountain` |
| 🏕️ Campgrounds | `Tent` |
| 🏊 Water spots | `Waves` |
| 🌄 Scenic views | `Sunrise` |
| 🏃 Outdoor fitness | `HeartPulse` |
| 🦌 Wildlife & nature | `TreeDeciduous` |
| 🍺 Local provisions | `Store` |

Update `renderIntentGrid` in `SettingsPreferencesTab.tsx` to render Lucide components instead of emoji spans.

---

## Files Summary

| Action | File | Purpose |
|--------|------|---------|
| Migrate | DB: `user_preferences` | Add `weather_flexibility`, `gear_readiness` columns |
| Modify | `src/lib/preference-prompts.ts` | Replace urban prompts with outdoor versions |
| Modify | `src/lib/profile-options.ts` | Add 6 outdoor option arrays |
| Create | `src/components/profile/AdventureStyleSection.tsx` | Single-select UI |
| Create | `src/components/profile/TrailCompanionsSection.tsx` | Single-select UI |
| Create | `src/components/profile/EffortPreferenceSection.tsx` | Single-select UI |
| Create | `src/components/profile/WeatherFlexibilitySection.tsx` | Single-select UI |
| Create | `src/components/profile/GearReadinessSection.tsx` | Single-select UI |
| Create | `src/components/profile/NaturePrioritiesSection.tsx` | Multi-select (max 2) |
| Modify | `src/components/profile/index.ts` | Export new components |
| Modify | `src/hooks/useUserPreferences.ts` | Handle new columns |
| Modify | `src/components/settings/SettingsPreferencesTab.tsx` | Wire components + Lucide icons |

---

## Build Order

```text
Day 1: Schema & Options
├── Run database migration (2 new columns)
├── Update preference-prompts.ts with outdoor prompts
├── Add option arrays to profile-options.ts
└── Update types in useUserPreferences.ts

Day 2: Components
├── Create AdventureStyleSection.tsx
├── Create TrailCompanionsSection.tsx
├── Create EffortPreferenceSection.tsx
├── Create WeatherFlexibilitySection.tsx
├── Create GearReadinessSection.tsx
├── Create NaturePrioritiesSection.tsx
└── Update profile/index.ts exports

Day 3: Integration & Polish
├── Wire components into SettingsPreferencesTab.tsx
├── Add Collapsible "How you explore" section
├── Replace emoji icons with Lucide in Intent grid
└── Test auto-save behavior on mobile
```

---

## Language Guardrails

All UI copy follows the brand's grounded, guy-next-door tone:

| Location | Text |
|----------|------|
| Section header | "How you explore" |
| Adventure Style helper | "Helps us match your comfort level" |
| Trail Companions helper | "Private — just for better suggestions" |
| Weather Flexibility helper | "We'll note conditions when relevant" |
| Nature Priorities helper | "Pick up to 2. Shapes what we surface." |
| Footer reassurance | "These quietly shape what the directory shows you." |

---

## Intelligence Integration

These preferences will act as **soft multipliers** in the affinity engine:

| Preference | Intelligence Effect |
|------------|---------------------|
| `adventure_style: explore_remote` | Boost remote trailheads, backcountry campgrounds |
| `trail_companions: solo` | Boost quieter, less-crowded spots |
| `effort_preference: strenuous` | Boost difficult trails, longer hikes |
| `weather_flexibility: any_weather` | Don't penalize shoulder-season spots |
| `gear_readiness: ultralight` | Boost technical terrain, multi-day routes |
| `nature_priorities: ['water_access', 'solitude']` | Boost remote lakes, rivers |

---

## Success Criteria

| Metric | Target |
|--------|--------|
| All 6 outdoor preferences editable in Settings | Verified |
| New columns save correctly to database | Verified |
| NaturePriorities enforces max 2 selections | Verified |
| Intent grid uses Lucide icons (no emojis) | Verified |
| Collapsible "How you explore" works on mobile | Verified |
| Copy follows outdoor brand voice | Verified |

