

# Plan: Modern SEO Metadata Strategy — 2026-Ready Implementation

## Summary

Comprehensive update to SEO metadata across all pages to optimize for both traditional search engines (Google/Bing) and AI-mediated search (ChatGPT, agent search, summaries). This follows the agency-grade strategy: describe the tool not outcomes, lead with places, use "directory" framing, and apply calm factual language.

---

## What Is Being Updated

| File | Change Type |
|------|-------------|
| `index.html` | Global metadata, structured data, application-name |
| `src/components/SEOHead.tsx` | Add application-name support, OG image prop |
| `src/pages/Outdoors.tsx` | Update title + description |
| `src/pages/Community.tsx` | Update title + description |
| `src/pages/FindFriends.tsx` | Update title + description |
| `src/pages/Couples.tsx` | Update title + description |
| `src/pages/Pricing.tsx` | Add SEOHead component with new metadata |
| `src/pages/About.tsx` | Update title + description, update schema |
| `src/pages/FAQ.tsx` | Update title + description |
| `src/pages/Ambassadors.tsx` | Update title + description |
| `src/pages/Auth.tsx` | Add SEOHead component with new metadata |
| `src/pages/Places.tsx` | Add SEOHead component with new metadata |

---

## 1. Global SEO (`index.html`)

### Current Issues
- Title leads with brand ("ThickTimber – Real Community...")
- Description mentions "without dating apps" (oppositional)
- Keywords include social/dating terms ("gay meetup", "gay social")
- Missing `application-name` meta tag

### Updated Content

**Title:**
```
Outdoor Places Directory for Gay Men | ThickTimber
```

**Meta Description:**
```
A place-based directory highlighting outdoor spaces, active lifestyles, and shared interests. Designed to support real-world discovery and community through places.
```

**Keywords:**
```
outdoor directory, gay hiking, gay camping, LGBTQ outdoors, gay men trails, active lifestyle, outdoor community, place-based discovery
```

**New Meta Tag (AI-friendly):**
```html
<meta name="application-name" content="ThickTimber – Place-Based Outdoor Directory" />
```

**Updated Open Graph:**
```html
<meta property="og:title" content="Outdoor Places Directory for Gay Men | ThickTimber" />
<meta property="og:description" content="A place-based directory for trails, campsites, and outdoor spaces. Real-world discovery for gay men." />
```

**Updated Structured Data:**
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ThickTimber",
  "applicationCategory": "LifestyleApplication",
  "description": "A place-based outdoor directory for gay men. Discover trails, campsites, beaches, and active spaces.",
  "url": "https://thicktimber.lovable.app"
}
```

---

## 2. SEOHead Component Enhancement

### Add Props
- `applicationName?: string` - For AI classification
- `ogImage?: string` - For custom OG images per page

### Updated Component Behavior
- Always output `application-name` meta tag (default: "ThickTimber – Place-Based Outdoor Directory")
- Support page-specific OG images

---

## 3. Page-by-Page Metadata Updates

### Homepage (`/`) — via `index.html`
Already covered in Section 1.

---

### Places (`/places`)

**Add SEOHead (currently missing):**
```typescript
<SEOHead
  title="Explore Outdoor Places & Active Spaces"
  description="Browse trails, campsites, beaches, and outdoor places shaped by shared interests and community patterns. A place-first directory for real-world exploration."
  keywords="outdoor directory, hiking trails, campsites, beaches, gay outdoors, active spaces"
  canonicalPath="/places"
/>
```

---

### Outdoors (`/outdoors`)

**Current:**
```
title: "Gay Outdoors - Community, Outside the Usual Places"
description: "A directory for gay men who love hiking, camping, and staying active outdoors. Find trails, campsites, and swimming holes where outdoor gay men connect."
```

**Updated:**
```
title: "Gay Outdoor Spaces & Active Lifestyles"
description: "Discover hiking trails, campsites, beaches, and outdoor activities through a place-based directory designed for real-world connection and exploration."
keywords: "gay outdoors, hiking trails, camping, beaches, outdoor activities, active lifestyle directory"
```

---

### Community (`/community`)

**Current:**
```
title: "Gay Outdoor Community – Find Your People on the Trail"
description: "Discover outdoor community for gay men who stay active outside. A place-centric directory for hiking trails, campsites, beaches, and nature spots — not dating apps or social networks."
```

**Updated:**
```
title: "Outdoor Community Through Shared Places"
description: "Learn how shared interests and outdoor places help shape real-world community. A calm, place-first approach to discovering where people gather."
keywords: "outdoor community, gay hiking community, shared interests, real-world community, place-based discovery"
```

**Why:** Removes oppositional language ("not dating apps"), focuses on explaining the concept.

---

### Find Friends (`/find-friends`)

**Current:**
```
title: "Find Gay Outdoor Friends – Make Real Connections on the Trail"
description: "Looking for gay friends who love the outdoors and staying active? Discover trails, campsites, and outdoor spots where you can find community — not on dating apps."
```

**Updated:**
```
title: "Finding Friends Through Shared Outdoor Places"
description: "A place-based approach to friendship built around shared routines, outdoor activities, and familiar spaces. Designed for real-world connection over time."
keywords: "outdoor friends, hiking buddies, camping friends, shared activities, real-world friendship"
```

**Why:** Removes "not on dating apps", reframes as tool-first.

---

### Couples (`/couples`)

**Current:**
```
title: "Discover Together — Find Outdoor Places for Both of You"
description: "Temporarily link with a partner or friend to find hiking trails, campsites, and outdoor spots that work for both of you. Private, session-based discovery."
```

**Updated:**
```
title: "Discover Outdoor Places Together"
description: "Find outdoor places that work for two people—privately. A place-first tool for planning hikes, trips, and shared experiences without sharing preferences."
keywords: "couples hiking, outdoor planning, shared discovery, private recommendations, trip planning"
```

**Why:** More concise, emphasizes privacy and tool function.

---

### Pricing (`/pricing`)

**Add SEOHead (currently missing):**
```typescript
<SEOHead
  title="Directory Access & Personalization Options"
  description="Access the full outdoor places directory for free, with optional personalization to refine recommendations privately based on interests and routines."
  keywords="directory access, personalization, outdoor recommendations, free directory, PRO features"
  canonicalPath="/pricing"
/>
```

**Why:** Avoids "Upgrade", "Unlock", "Premium" terminology.

---

### About (`/about`)

**Current:**
```
title: "Why ThickTimber Exists – Outdoor Community for Gay Men"
description: "The story behind ThickTimber — rebuilding gay community through trails, campsites, and outdoor spaces. A place-first approach for men who prefer nature over nightlife."
```

**Updated:**
```
title: "Why ThickTimber Exists | A Place-Based Directory"
description: "Learn why ThickTimber was built and how place-based discovery supports real-world community, shared interests, and outdoor exploration."
keywords: "about ThickTimber, place-based directory, outdoor discovery, community through places"
```

**Schema Update:**
```json
{
  "@type": "AboutPage",
  "name": "Why ThickTimber Exists",
  "description": "Learn why ThickTimber was built as a place-based outdoor directory."
}
```

---

### FAQ (`/faq`)

**Current:**
```
title: "FAQ – Outdoor Community Directory for Gay Men"
description: "Answers about how gay men use ThickTimber to find hiking trails, campsites, and outdoor community. Learn about personalization, privacy, and what makes this different."
```

**Updated:**
```
title: "Frequently Asked Questions | ThickTimber Directory"
description: "Answers about how the directory works, personalization, privacy, and what makes ThickTimber different from social or profile-based platforms."
keywords: "FAQ, questions, directory help, personalization, privacy"
```

**Why:** More neutral, AI-friendly framing.

---

### Trail Blazers (`/ambassadors`)

**Current:**
```
title: "Trail Blazers | ThickTimber"
description: "Share your expertise on outdoor spaces and active lifestyles. Trail Blazers are trusted voices who add depth to the directory."
```

**Updated:**
```
title: "Trail Blazers | Expert Context for Outdoor Places"
description: "Trail Blazers are writers, guides, and subject-matter experts who add contextual knowledge to outdoor places in the ThickTimber directory."
keywords: "trail blazers, outdoor experts, guides, contributors, place expertise"
```

**Why:** Clearer for AI attribution and trust signals.

---

### Auth (`/auth`)

**Add SEOHead (currently missing):**
```typescript
<SEOHead
  title="Join the ThickTimber Directory"
  description="Create a private account to explore outdoor places, save favorites, and personalize your directory experience over time."
  keywords="sign up, join directory, create account, outdoor places"
  canonicalPath="/auth"
/>
```

---

## 4. Technical Implementation

### File Changes Summary

| File | Lines Affected | Change Type |
|------|----------------|-------------|
| `index.html` | 6-46 | Update title, description, keywords, OG, schema |
| `src/components/SEOHead.tsx` | All | Add applicationName prop, output meta tag |
| `src/pages/Outdoors.tsx` | 42-47 | Update SEOHead props |
| `src/pages/Community.tsx` | 20-25 | Update SEOHead props |
| `src/pages/FindFriends.tsx` | 20-25 | Update SEOHead props |
| `src/pages/Couples.tsx` | 20-25 | Update SEOHead props |
| `src/pages/Pricing.tsx` | After line 76 | Add SEOHead import + component |
| `src/pages/About.tsx` | 74-80 | Update SEOHead props + schema |
| `src/pages/FAQ.tsx` | 172-178 | Update SEOHead props |
| `src/pages/Ambassadors.tsx` | 149-153 | Update SEOHead props |
| `src/pages/Auth.tsx` | After line 16 | Add SEOHead import + component |
| `src/pages/Places.tsx` | After imports | Add SEOHead import + component |

---

## 5. Structured Data Enhancements

### WebApplication Schema (index.html)
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ThickTimber",
  "applicationCategory": "LifestyleApplication",
  "operatingSystem": "Web",
  "description": "A place-based outdoor directory for gay men. Discover trails, campsites, beaches, and active spaces.",
  "url": "https://thicktimber.lovable.app",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

### FAQPage Schema (already exists, no change needed)
The existing FAQ schema generation is correct and AI-friendly.

---

## 6. Verification Checklist

After implementation, verify:

| Requirement | Status |
|-------------|--------|
| No "dating", "hookup", "match" in metadata | Verify |
| No "anti-app" phrasing | Verify |
| "directory" appears where appropriate | Verify |
| Place-first nouns lead titles | Verify |
| Descriptions explain how it works, not promises | Verify |
| `application-name` meta tag present | Verify |
| Canonical URLs distinct per page | Verify |
| OG images specified | Verify |

---

## 7. Implementation Sequence

1. Update `src/components/SEOHead.tsx` to add `applicationName` support
2. Update `index.html` with new global metadata
3. Update existing SEOHead props on all pages
4. Add SEOHead to pages currently missing it (`Places.tsx`, `Pricing.tsx`, `Auth.tsx`)

---

## Why This Strategy Works

- **Traditional Search:** Function-first titles, clear descriptions, proper canonical URLs
- **AI Search:** `application-name` tag, WebApplication schema, calm factual language
- **Brand Consistency:** ThickTimber always at end of titles, not leading
- **No Cannibalization:** Each page has distinct conceptual role and unique metadata

