

# Discord/OG Preview Update Plan

## Objective

Update the Open Graph (Discord/social) preview to:
1. Use the hero hiking image instead of the abstract brand lockup
2. Update the description to be more grounded and masculine: "Real places. Real community. Real connection."

---

## Current State

**Current OG Image:** `public/og-image.png` (abstract mountain/brand lockup)

**Current Description:**
> "Find gay community near you. Discover places where gay men and couples connect in real life — not on dating apps."

---

## Changes Required

### Step 1: Copy Hero Image to Public Folder

The hero image (`src/assets/hero-hiking-men.jpg`) must be copied to the `public` folder so it can be referenced in meta tags (meta tags can't use bundled assets).

**Action:** Copy `src/assets/hero-hiking-men.jpg` → `public/og-hero.jpg`

---

### Step 2: Update `index.html` Meta Tags

**File:** `index.html`

| Line | Current | Updated |
|------|---------|---------|
| 16 | `og:description` - "Find gay community near you. Discover places where gay men and couples connect in real life — not on dating apps." | "Real places. Real community. Real connection." |
| 19 | `og:image` - `/og-image.png` | `/og-hero.jpg` |
| 24 | `twitter:image` - `/og-image.png` | `/og-hero.jpg` |
| 25 | `twitter:description` - "Find gay community near you..." | "Real places. Real community. Real connection." |

**Updated meta tags:**
```html
<!-- Open Graph -->
<meta property="og:title" content="ThickTimber – Gay Community, Friends & Places" />
<meta property="og:description" content="Real places. Real community. Real connection." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://thicktimber.lovable.app" />
<meta property="og:image" content="https://thicktimber.lovable.app/og-hero.jpg" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@ThickTimber" />
<meta name="twitter:title" content="ThickTimber – Gay Community & Friends" />
<meta name="twitter:image" content="https://thicktimber.lovable.app/og-hero.jpg" />
<meta name="twitter:description" content="Real places. Real community. Real connection." />
```

---

## Visual Result

```text
BEFORE (Abstract brand lockup)        AFTER (Hero hiking image)

┌─────────────────────────────┐       ┌─────────────────────────────┐
│ ThickTimber                 │       │                             │
│ Real Community. Real Places.│       │   [Three men hiking         │
│ Real Life.                  │       │    together on a trail]     │
│ 🏔️ Abstract mountains       │       │                             │
└─────────────────────────────┘       └─────────────────────────────┘

Description:                          Description:
"Find gay community near you.         "Real places. Real community.
Discover places where gay men          Real connection."
and couples connect..."
```

---

## Files Summary

| File | Action |
|------|--------|
| `public/og-hero.jpg` | **Create** (copy from `src/assets/hero-hiking-men.jpg`) |
| `index.html` | **Update** lines 16, 19, 24, 25 with new image path and description |

---

## Important Note

After publishing, Discord caches OG previews. To refresh:
1. Use Discord's preview refresh (paste link, delete, paste again)
2. Or use Facebook's Sharing Debugger / Twitter Card Validator to force a refresh

The old `og-image.png` can remain as a backup or for other uses.

