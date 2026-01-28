

# Plan: Combine Couples + Discover Together into Single Page

## Summary

Merge the marketing content from `/couples` with the functional tool from `/together` into a single, unified page at `/together`. The `/couples` route will redirect to `/together`. This eliminates the awkward two-step flow while maintaining SEO value and improving user experience.

---

## Current Problem

| Route | Type | Issue |
|-------|------|-------|
| `/couples` | Marketing page | No functionality — just links to `/together` |
| `/together` | Functional tool | Minimal context for first-time visitors |

**Result:** Users must navigate through two pages to use one feature.

---

## Proposed Solution

Create a **single unified page** that adapts based on user state:

1. **Unauthenticated visitors** → See marketing content + sign-in CTA
2. **Authenticated without session** → See brief intro + session creation UI
3. **Authenticated with active session** → See results view

---

## Page Structure (Combined)

```text
┌──────────────────────────────────────────────────────────┐
│                    HERO SECTION                          │
│  "Find Outdoor Places That Work for Both of You"         │
│  Brief tagline + privacy promise                         │
└──────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
     Not Authenticated             Authenticated
            │                               │
            ▼                               ▼
┌─────────────────────┐       ┌─────────────────────────┐
│  MARKETING CONTENT  │       │    SESSION UI           │
│  - How It Works     │       │  ┌─────────────────┐    │
│  - Privacy Promise  │       │  │ Create Session  │    │
│  - Use Cases        │       │  │ or Enter Code   │    │
│  - Sign In CTA      │       │  └─────────────────┘    │
└─────────────────────┘       └─────────────────────────┘
```

---

## File Changes

### 1. Update `src/pages/DiscoverTogether.tsx`

**Add from Couples.tsx:**
- SEOHead with proper metadata (keywords, canonicalPath)
- Condensed "How It Works" for unauthenticated view
- Privacy highlights for unauthenticated view
- Improved hero section styling

**Keep existing:**
- All session management logic (hooks, state machine)
- SessionGenerator, SessionJoin, OverlapResults components
- Authentication flow handling

**Structure:**
- Lines 56-91 (unauthenticated view): Replace basic card with enhanced marketing layout
- Lines 142-173 (default view): Add brief context above SessionJoin for logged-in users

### 2. Update `src/App.tsx`

**Line ~64:** Change `/couples` route from `Couples` component to redirect:
```tsx
<Route path="/couples" element={<Navigate to="/together" replace />} />
```

### 3. Update `src/components/Footer.tsx`

**Line 56-58:** Remove the `/couples` link or redirect label:
- Option A: Remove "Couples" link entirely from footer
- Option B: Change "Couples" to link to `/together`

**Recommendation:** Keep "Couples" label but point it to `/together` — this preserves the marketing-friendly name while avoiding duplicate destinations.

### 4. Delete `src/pages/Couples.tsx`

Remove the file entirely after redirect is in place.

---

## SEO Considerations

### Canonical URL
- `/together` becomes the canonical
- `/couples` redirects (301) — search engines will transfer link equity

### Metadata for `/together`
Keep the improved SEO from `/couples`:
```typescript
<SEOHead
  title="Discover Outdoor Places Together"
  description="Find outdoor places that work for two people—privately. A place-first tool for planning hikes, trips, and shared experiences without sharing preferences."
  keywords="couples hiking, outdoor planning, shared discovery, private recommendations, trip planning"
  canonicalPath="/together"
/>
```

---

## Updated Footer Structure

```text
Use Cases
├── Outdoor Community → /community
├── Friends & Groups → /find-friends
└── Couples → /together  (changed from /couples)
```

---

## Implementation Sequence

1. Update `DiscoverTogether.tsx` with enhanced unauthenticated view
2. Update `App.tsx` to redirect `/couples` → `/together`
3. Update `Footer.tsx` to point "Couples" link to `/together`
4. Delete `Couples.tsx`
5. Verify no broken internal links

---

## Before/After Comparison

### Before (Two Pages)
```text
/couples        → Marketing page (no functionality)
                  └── CTA: "Start a Session" → /together
/together       → Functional tool (minimal context)
```

### After (Single Page)
```text
/couples        → 301 Redirect → /together
/together       → Marketing + Functional tool (adaptive)
```

---

## Benefits

| Benefit | Explanation |
|---------|-------------|
| **Reduced friction** | Users go directly to the tool |
| **Better SEO** | Single canonical URL, no duplicate content |
| **Cleaner codebase** | One file instead of two |
| **Adaptive UX** | Marketing shown only when relevant |
| **Maintained context** | Logged-in users still see brief "how it works" |

---

## Technical Details

### Enhanced Unauthenticated View

Replace the current minimal card (lines 56-91 in DiscoverTogether.tsx) with:

```tsx
// Condensed marketing content for unauthenticated users
<section className="max-w-2xl mx-auto px-4 py-12 space-y-12">
  {/* Hero */}
  <div className="text-center">
    <h1 className="font-serif text-3xl md:text-4xl mb-4">
      Find Outdoor Places That Work for Both of You
    </h1>
    <p className="text-muted-foreground">
      Without sharing preferences. Without linking accounts. 
      Just clearer outdoor recommendations—privately.
    </p>
  </div>

  {/* How It Works (condensed) */}
  <div className="space-y-4">
    <h2 className="font-semibold">How It Works</h2>
    <ol className="space-y-3 text-muted-foreground">
      <li>1. Start a private session</li>
      <li>2. Share the code with your partner</li>
      <li>3. See places that work for both of you</li>
      <li>4. Session expires in 24 hours</li>
    </ol>
  </div>

  {/* Privacy highlights */}
  <div className="grid grid-cols-2 gap-4">
    <PrivacyCard icon={Eye} title="Preferences stay private" />
    <PrivacyCard icon={Clock} title="Sessions expire automatically" />
  </div>

  {/* Auth CTA */}
  <Card>
    <CardHeader className="text-center">
      <CardTitle>Ready to explore together?</CardTitle>
    </CardHeader>
    <CardContent>
      <Button asChild className="w-full">
        <Link to="/auth?redirect=/together">Sign In to Start</Link>
      </Button>
    </CardContent>
  </Card>
</section>
```

### Authenticated Default View Enhancement

Add brief context above SessionJoin:
```tsx
<div className="text-center mb-6">
  <h1 className="text-2xl font-bold mb-2">Discover Together</h1>
  <p className="text-muted-foreground text-sm">
    Find outdoor places that work for both of you—privately.
  </p>
</div>
```

---

## Files to Modify

| File | Action |
|------|--------|
| `src/pages/DiscoverTogether.tsx` | Enhance with marketing content |
| `src/App.tsx` | Add redirect from `/couples` |
| `src/components/Footer.tsx` | Update link target |
| `src/pages/Couples.tsx` | Delete |

