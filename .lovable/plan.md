
# Replace All Remaining Emoji Icons with Lucide Components

## Scope

Three components on the Settings page still use emoji icons that need to be converted to Lucide components for brand consistency:

| Component | Location | Emojis Found |
|-----------|----------|--------------|
| `AffinityBar.tsx` | Taste Profile card | 11 emojis (category icons) |
| `ProSettingsSummary.tsx` | "Spaces that feel right" section | 14 emojis (summary bullets) |
| `TasteProfileCard.tsx` | CTA button | 1 arrow symbol |

---

## Changes

### File 1: `src/components/settings/AffinityBar.tsx`

**Current:** Uses emoji strings in `CATEGORY_CONFIG` for place category icons.

**Change:** Replace emoji strings with Lucide icon names and render dynamically.

| Category | Current Emoji | Lucide Icon |
|----------|---------------|-------------|
| restaurant | 🍽️ | `UtensilsCrossed` |
| cafe | ☕ | `Coffee` |
| bar | 🍷 | `Wine` |
| park | 🌳 | `TreePine` |
| gym | 💪 | `Dumbbell` |
| museum | 🎨 | `Palette` |
| shopping | 🛍️ | `ShoppingBag` |
| entertainment | ✨ | `Sparkles` |
| spa | 🧘 | `Leaf` |
| bakery | 🥐 | `Croissant` |
| default | 📍 | `MapPin` |

**Additional outdoor categories for the brand:**

| Category | Lucide Icon |
|----------|-------------|
| trail | `Mountain` |
| campground | `Tent` |
| natural_feature | `TreeDeciduous` |
| hiking_area | `Footprints` |
| swimming_hole | `Waves` |

---

### File 2: `src/components/settings/pro/ProSettingsSummary.tsx`

**Current:** Uses emoji strings for summary bullet icons.

**Change:** Replace emoji strings with Lucide icon names and render dynamically.

| Context | Current Emoji | Lucide Icon |
|---------|---------------|-------------|
| Location | 📍 | `MapPin` |
| LGBTQ | 🏳️‍🌈 | `Flag` |
| Family | 👨‍👩‍👧 | `Users` |
| Comfort | ✨ | `Sparkles` |
| Community | 👥 | `UsersRound` |
| Couples | 💑 | `Heart` |
| Intent | 🎯 | `Target` |
| Energy | ⚡ | `Zap` |
| Environment | 🌿 | `Leaf` |
| Morning | 🌅 | `Sunrise` |
| Evening | 🌙 | `Moon` |
| Weekend | 📅 | `Calendar` |
| Distance | 📏 | `Ruler` |
| Affinity | 🧭 | `Compass` |

---

### File 3: `src/components/settings/TasteProfileCard.tsx`

**Current:** Uses arrow emoji "→" in button text.

**Change:** Replace with Lucide `ArrowRight` icon component.

```tsx
// Before
Explore Outdoors →

// After
Explore Outdoors <ArrowRight className="h-4 w-4 ml-1" />
```

---

## Implementation Details

### AffinityBar.tsx Pattern

```typescript
import { 
  MapPin, TreePine, Mountain, Tent, Waves, Footprints,
  UtensilsCrossed, Coffee, Wine, Dumbbell, Palette,
  ShoppingBag, Sparkles, Leaf, Croissant, TreeDeciduous,
  type LucideIcon 
} from 'lucide-react';

const CATEGORY_CONFIG: Record<string, { Icon: LucideIcon; label: string }> = {
  trail: { Icon: Mountain, label: 'Trails' },
  campground: { Icon: Tent, label: 'Campgrounds' },
  natural_feature: { Icon: TreeDeciduous, label: 'Natural feature' },
  hiking_area: { Icon: Footprints, label: 'Hiking area' },
  park: { Icon: TreePine, label: 'Parks & Outdoors' },
  // ... etc
  default: { Icon: MapPin, label: 'Places' },
};

// In render:
<config.Icon className="h-4 w-4 text-muted-foreground/70" />
```

### ProSettingsSummary.tsx Pattern

```typescript
import { MapPin, Flag, Users, Sparkles, ... } from 'lucide-react';

const SUMMARY_ICONS: Record<string, LucideIcon> = {
  location: MapPin,
  lgbtq: Flag,
  family: Users,
  // ... etc
};

// Build bullets with icon key instead of emoji
summaryBullets.push({ 
  iconKey: 'location', 
  text: `Showing places in ${memberProfile.city}` 
});

// In render:
{summaryBullets.map((bullet, idx) => {
  const Icon = SUMMARY_ICONS[bullet.iconKey];
  return (
    <li key={idx} className="flex items-start gap-2">
      <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <span>{bullet.text}</span>
    </li>
  );
})}
```

---

## Files Summary

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/components/settings/AffinityBar.tsx` | Replace category emojis with Lucide icons |
| Modify | `src/components/settings/pro/ProSettingsSummary.tsx` | Replace summary bullet emojis with Lucide icons |
| Modify | `src/components/settings/TasteProfileCard.tsx` | Replace arrow emoji with ArrowRight icon |

---

## Build Order

```text
Step 1: AffinityBar.tsx
├── Import Lucide icons (outdoor + urban categories)
├── Change CATEGORY_CONFIG to use Icon component refs
├── Add outdoor-specific categories (trail, campground, etc.)
└── Update render to use <Icon /> component

Step 2: ProSettingsSummary.tsx
├── Import Lucide icons for all summary types
├── Create SUMMARY_ICONS mapping
├── Change summaryBullets type to use iconKey instead of icon string
└── Update render to use <Icon /> component

Step 3: TasteProfileCard.tsx
├── Import ArrowRight from lucide-react
└── Replace "→" text with <ArrowRight /> component
```

---

## Verification

After implementation, the Settings page will have zero emoji icons:

| Location | Before | After |
|----------|--------|-------|
| Taste Profile category bars | Emoji (🌳 🍽️) | Lucide SVG |
| Pro Settings summary bullets | Emoji (📍 🎯) | Lucide SVG |
| "Explore Outdoors" CTA | Arrow (→) | ArrowRight icon |
| Intent grid | Already Lucide | Already Lucide |
| Phase 3 preferences | Already Lucide | Already Lucide |

