

# Fix Remaining Emojis in PRO Settings Flow

## Problem

The PRO settings options (Steps 1-4) are displaying emojis because they are stored in the `pro_context_definitions` database table. The `ProOptionChips.tsx` component renders these directly:

```tsx
{option.icon && <span className="text-base">{option.icon}</span>}
```

## Current Database State

The `pro_context_definitions` table contains 37+ options with emoji icons:

| Step | Section | Example Emojis |
|------|---------|----------------|
| 1 | about.experience | 🌱 ⛰️ 🏔️ |
| 2 | style.social | 🚶 👥 👪 |
| 2 | style.pace | 🐢 ⚖️ 🔥 |
| 2 | style.crowds | 🌲 🤷 🎉 |
| 3 | intent.connection | 🤝 👥 💑 🧘 |
| 3 | intent.vibe | 🌅 🏔️ 📚 🏆 |
| 4 | style.activity | 🥾 🏃 🚴 💪 🏊 🧗 🛶 ⛷️ 📷 |

---

## Solution

Two-part fix to ensure consistent Lucide icons:

### Part 1: Update Database Values

Replace emoji strings with Lucide icon names in `pro_context_definitions`:

| Key | Current | Lucide Name |
|-----|---------|-------------|
| exp_new | 🌱 | `Sprout` |
| exp_weekend | ⛰️ | `Mountain` |
| exp_seasoned | 🏔️ | `MountainSnow` |
| social_solo | 🚶 | `User` |
| social_small | 👥 | `Users` |
| social_group | 👪 | `UsersRound` |
| pace_slow | 🐢 | `Snail` |
| pace_balanced | ⚖️ | `Scale` |
| pace_fast | 🔥 | `Flame` |
| crowds_avoid | 🌲 | `TreePine` |
| crowds_ok | 🤷 | `Meh` |
| crowds_love | 🎉 | `PartyPopper` |
| intent_buddy | 🤝 | `Handshake` |
| intent_group | 👥 | `Users` |
| intent_partner | 💑 | `Heart` |
| intent_solo_social | 🧘 | `PersonStanding` |
| vibe_quiet | 🌅 | `Sunrise` |
| vibe_adventure | 🏔️ | `Mountain` |
| vibe_learning | 📚 | `BookOpen` |
| vibe_accomplish | 🏆 | `Trophy` |
| hiker | 🥾 | `Footprints` |
| runner | 🏃 | `PersonStanding` |
| cyclist | 🚴 | `Bike` |
| outdoor_fitness | 💪 | `Dumbbell` |
| swimmer | 🏊 | `Waves` |
| climber | 🧗 | `Mountain` |
| paddler | 🛶 | `Ship` |
| winter_sports | ⛷️ | `Snowflake` |
| photographer | 📷 | `Camera` |

### Part 2: Update ProOptionChips.tsx

Add a Lucide icon mapping similar to other components:

```typescript
import { 
  Sprout, Mountain, MountainSnow, User, Users, UsersRound,
  Snail, Scale, Flame, TreePine, Meh, PartyPopper, Handshake,
  Heart, PersonStanding, Sunrise, BookOpen, Trophy, Footprints,
  Bike, Dumbbell, Waves, Ship, Snowflake, Camera,
  type LucideIcon
} from 'lucide-react';

const PRO_OPTION_ICONS: Record<string, LucideIcon> = {
  Sprout, Mountain, MountainSnow, User, Users, UsersRound,
  Snail, Scale, Flame, TreePine, Meh, PartyPopper, Handshake,
  Heart, PersonStanding, Sunrise, BookOpen, Trophy, Footprints,
  Bike, Dumbbell, Waves, Ship, Snowflake, Camera,
};
```

Update the render logic:

```tsx
// Before
{option.icon && <span className="text-base">{option.icon}</span>}

// After
{option.icon && (() => {
  const IconComponent = PRO_OPTION_ICONS[option.icon];
  return IconComponent 
    ? <IconComponent className="h-4 w-4" />
    : <span className="text-base">{option.icon}</span>;
})()}
```

---

## Files Summary

| Action | File/Table | Purpose |
|--------|------------|---------|
| Migration | `pro_context_definitions` table | Replace emoji icons with Lucide names |
| Modify | `src/components/settings/pro/ProOptionChips.tsx` | Add icon mapping and render Lucide |

---

## Build Order

```text
Step 1: Database Migration
├── UPDATE pro_context_definitions SET icon = 'Sprout' WHERE key = 'exp_new'
├── UPDATE pro_context_definitions SET icon = 'Mountain' WHERE key = 'exp_weekend'
├── (... 25+ more updates)
└── Verify all icon values are Lucide names

Step 2: Update ProOptionChips.tsx
├── Import required Lucide icons
├── Create PRO_OPTION_ICONS mapping
├── Update render logic to check mapping
└── Fallback to text span for unmapped icons
```

---

## Verification

After implementation, the entire Settings page will use Lucide SVG icons:

| Location | Before | After |
|----------|--------|-------|
| PRO Step 1 (Experience) | Emoji (🌱 ⛰️) | Lucide SVG |
| PRO Step 2 (Social/Pace/Crowds) | Emoji (🚶 🐢 🌲) | Lucide SVG |
| PRO Step 3 (Intent/Vibe) | Emoji (🤝 🌅) | Lucide SVG |
| PRO Step 4 (Activity) | Emoji (🥾 🏃 🚴) | Lucide SVG |

