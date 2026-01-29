
# Domain-Aligned Discovery Plan for thicktimber.com

## Executive Summary

This plan addresses the mechanical alignment needed to ensure all discovery signals resolve to `https://thicktimber.com` as the canonical domain. The strategy, architecture, and product positioning remain unchanged—this is purely a domain migration task.

---

## Current State Assessment

### Files Requiring Domain Updates

| File | Current Domain | Issue |
|------|----------------|-------|
| `src/components/SEOHead.tsx` | `thicktimber.lovable.app` | Canonical URL base, default OG image |
| `index.html` | `thicktimber.lovable.app` | Canonical, OG URLs, Twitter image, JSON-LD schema |
| `public/sitemap.xml` | `thicktimber.lovable.app` | All 16 URL entries |
| `public/robots.txt` | `thicktimber.lovable.app` | Sitemap reference |
| `src/pages/BlogPostPage.tsx` | `mainstreet-landing-glow.lovable.app` | Critical bug: wrong domain entirely |
| `src/pages/About.tsx` | `thicktimber.lovable.app` | Schema URL in JSON-LD |
| `src/pages/LovePlace.tsx` | (none) | Missing SEOHead entirely |
| `supabase/functions/create-founders-checkout/index.ts` | `mainstreet-landing-glow.lovable.app` | Stripe redirect fallback |
| `src/pages/Terms.tsx` | n/a | Date mismatch: shows "January 2025" |

### Severity Classification

**Critical (blocks launch):**
- BlogPostPage.tsx points to wrong domain entirely
- SEOHead.tsx hardcodes Lovable subdomain in all canonicals

**High (harms SEO/AI classification):**
- index.html global metadata uses Lovable subdomain
- sitemap.xml all entries use Lovable subdomain
- robots.txt sitemap reference uses Lovable subdomain

**Medium (completeness):**
- LovePlace.tsx missing SEOHead (shareable place URLs have no metadata)
- About.tsx schema URL uses Lovable subdomain

**Low (functional but inconsistent):**
- Edge function fallback URL incorrect (only used when origin header missing)
- Terms.tsx date mismatch with Privacy.tsx

---

## Part 1: Create Centralized Domain Configuration

### Problem
Domain is hardcoded in 8+ files. Future domain changes would require editing all files.

### Solution
Create a single source of truth for the canonical domain.

### New File: `src/lib/site-config.ts`

```typescript
// Site-wide configuration for canonical URLs and metadata
export const SITE_CONFIG = {
  // Canonical domain - used for all SEO, OG, and sitemap URLs
  canonicalDomain: 'https://thicktimber.com',
  
  // Site name for titles
  siteName: 'ThickTimber',
  
  // Default OG image path (relative to canonical domain)
  defaultOgImage: '/og-hero.jpg',
  
  // Build full canonical URL from path
  getCanonicalUrl: (path: string) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `https://thicktimber.com${cleanPath}`;
  },
  
  // Build full OG image URL
  getOgImageUrl: (imagePath?: string) => {
    const path = imagePath || '/og-hero.jpg';
    const cleanPath = path.startsWith('http') ? path : `https://thicktimber.com${path}`;
    return cleanPath;
  }
} as const;
```

**Why centralized:**
- Single change point for future domain updates
- Type-safe access across codebase
- Eliminates copy/paste errors

---

## Part 2: Update SEOHead Component

### File: `src/components/SEOHead.tsx`

### Changes
1. Import `SITE_CONFIG` from new config file
2. Replace hardcoded domain with config values
3. Ensure all URLs resolve to `thicktimber.com`

### Updated Logic

```typescript
import { SITE_CONFIG } from "@/lib/site-config";

// Line 20: Replace default OG image
ogImage = SITE_CONFIG.getOgImageUrl()

// Line 23: Replace canonical URL construction
const canonicalUrl = SITE_CONFIG.getCanonicalUrl(canonicalPath);
```

### Result
All pages using SEOHead will automatically use `thicktimber.com`.

---

## Part 3: Update index.html Global Metadata

### File: `index.html`

### Changes Required

| Line | Current | Updated |
|------|---------|---------|
| 12 | `https://thicktimber.lovable.app` | `https://thicktimber.com` |
| 19 | `https://thicktimber.lovable.app` | `https://thicktimber.com` |
| 20 | `https://thicktimber.lovable.app/og-hero.jpg` | `https://thicktimber.com/og-hero.jpg` |
| 25 | `https://thicktimber.lovable.app/og-hero.jpg` | `https://thicktimber.com/og-hero.jpg` |
| 37 | `https://thicktimber.lovable.app` | `https://thicktimber.com` |
| 38 | `https://thicktimber.lovable.app/favicon.png` | `https://thicktimber.com/favicon.png` |

### Note
index.html is static and cannot use the TypeScript config. These values must be hardcoded.

---

## Part 4: Fix BlogPostPage.tsx Critical Bug

### File: `src/pages/BlogPostPage.tsx`

### Current State (Line 105)
```typescript
const canonicalUrl = `https://mainstreet-landing-glow.lovable.app/blog/${post.slug}`;
```

This is:
1. Wrong domain entirely (old project domain)
2. Hardcoded (not using SEOHead pattern)
3. Missing OG URL consistency

### Solution
Use SEOHead component instead of raw Helmet, or at minimum fix the domain.

### Recommended Fix

```typescript
import { SITE_CONFIG } from "@/lib/site-config";

// Line 105
const canonicalUrl = SITE_CONFIG.getCanonicalUrl(`/blog/${post.slug}`);
```

### Also Update
- Line 110: Add `<meta property="og:url" content={canonicalUrl} />` (currently missing)

---

## Part 5: Add SEOHead to LovePlace.tsx

### Problem
`/love/:placeId` is the shareable landing page for places—the canonical crawlable URL for individual places. It currently has NO SEO metadata.

### File: `src/pages/LovePlace.tsx`

### Add After Line 9
```typescript
import SEOHead from '@/components/SEOHead';
```

### Add SEOHead Component (inside PageLayout, after loading check)

```typescript
// After line 147, inside the return for valid place
<SEOHead
  title={place.name}
  description={`Discover ${place.name} in ${location} - ${place.primary_category} on ThickTimber.`}
  canonicalPath={`/love/${place.id}`}
  ogImage={photoUrl || undefined}
/>
```

### Result
Shareable place links will have proper metadata for social sharing and search indexing.

---

## Part 6: Update About.tsx Schema URL

### File: `src/pages/About.tsx`

### Current State (Line 64)
```typescript
"url": "https://thicktimber.lovable.app/about",
```

### Solution
Import config and use dynamic URL:

```typescript
import { SITE_CONFIG } from "@/lib/site-config";

// Line 64
"url": SITE_CONFIG.getCanonicalUrl('/about'),
```

---

## Part 7: Update Sitemap

### File: `public/sitemap.xml`

### Changes
Replace all 16 instances of:
```
https://thicktimber.lovable.app
```
With:
```
https://thicktimber.com
```

### Note on Dynamic Sitemap
The current sitemap is static and does not include:
- Individual place pages (`/love/:placeId`)
- National park detail pages (`/places/national-parks/:parkId`)
- Blog post pages (`/blog/:slug`)

This is a known limitation but not blocking for domain alignment. Dynamic sitemap generation is a post-launch enhancement.

---

## Part 8: Update robots.txt

### File: `public/robots.txt`

### Current State (Line 16)
```
Sitemap: https://thicktimber.lovable.app/sitemap.xml
```

### Updated
```
Sitemap: https://thicktimber.com/sitemap.xml
```

### Also Add (Missing Rule)
```
Disallow: /admin/
```

This prevents admin routes from being indexed.

---

## Part 9: Fix Edge Function Fallback

### File: `supabase/functions/create-founders-checkout/index.ts`

### Current State (Line 108)
```typescript
const origin = req.headers.get("origin") || "https://mainstreet-landing-glow.lovable.app";
```

### Updated
```typescript
const origin = req.headers.get("origin") || "https://thicktimber.com";
```

### Impact
This only affects Stripe redirects when origin header is missing (rare). Low priority but should be fixed for consistency.

---

## Part 10: Fix Terms.tsx Date

### File: `src/pages/Terms.tsx`

### Current State (Line 9)
```typescript
subtitle="Last Updated: January 2025"
```

### Updated
```typescript
subtitle="Last Updated: January 2026"
```

This aligns with Privacy.tsx which already shows January 2026.

---

## Implementation Order

| Step | File | Priority | Blocking? |
|------|------|----------|-----------|
| 1 | Create `src/lib/site-config.ts` | High | Yes (enables others) |
| 2 | Update `src/components/SEOHead.tsx` | High | Yes |
| 3 | Update `index.html` | High | Yes |
| 4 | Fix `src/pages/BlogPostPage.tsx` | Critical | Yes |
| 5 | Add SEOHead to `src/pages/LovePlace.tsx` | High | Yes |
| 6 | Update `src/pages/About.tsx` | Medium | No |
| 7 | Update `public/sitemap.xml` | High | Yes |
| 8 | Update `public/robots.txt` | High | Yes |
| 9 | Fix `supabase/functions/create-founders-checkout/index.ts` | Low | No |
| 10 | Fix `src/pages/Terms.tsx` | Low | No |

---

## Files Summary

### New Files (1)

| Path | Purpose |
|------|---------|
| `src/lib/site-config.ts` | Centralized domain configuration |

### Modified Files (9)

| Path | Change |
|------|--------|
| `src/components/SEOHead.tsx` | Use SITE_CONFIG for canonical URLs |
| `index.html` | Replace all lovable.app references with thicktimber.com |
| `src/pages/BlogPostPage.tsx` | Fix critical domain bug |
| `src/pages/LovePlace.tsx` | Add SEOHead for place metadata |
| `src/pages/About.tsx` | Fix schema URL |
| `public/sitemap.xml` | Replace all URLs with thicktimber.com |
| `public/robots.txt` | Update sitemap URL, add admin disallow |
| `supabase/functions/create-founders-checkout/index.ts` | Fix fallback origin |
| `src/pages/Terms.tsx` | Update date to January 2026 |

---

## Post-Implementation Verification

### Checklist After Deployment

1. **Canonical Tags**: View page source on homepage, /places, /love/:placeId, /blog/:slug — confirm all canonical URLs show `thicktimber.com`

2. **OG Tags**: Use Facebook Sharing Debugger or Twitter Card Validator to verify OG URLs

3. **Sitemap**: Access `https://thicktimber.com/sitemap.xml` and verify all URLs use correct domain

4. **robots.txt**: Access `https://thicktimber.com/robots.txt` and verify sitemap reference

5. **Redirect Verification**: Access old URLs (e.g., `thicktimber.lovable.app/places`) and confirm 301 redirect to `thicktimber.com/places`

### Search Console Handoff

After custom domain is live:
1. Add `thicktimber.com` property to Google Search Console
2. Submit sitemap via Search Console
3. Do NOT submit sitemap for lovable.app domain
4. Monitor for indexing issues during transition

---

## What This Plan Does NOT Include

- Dynamic sitemap generation (post-launch)
- Individual place/park/blog URL sitemap entries (post-launch)
- Schema.org Place markup for directory pages (post-launch)
- Redirect configuration (handled by Lovable custom domain setup)

These are enhancements, not domain alignment requirements.

---

## Redirect Strategy Note

When connecting `thicktimber.com` as a custom domain in Lovable:
- Lovable should automatically redirect `thicktimber.lovable.app` → `thicktimber.com`
- Verify these are 301 (permanent) redirects, not 302 (temporary)
- If redirects are not automatic, contact Lovable support

This is infrastructure-level, not code-level.
