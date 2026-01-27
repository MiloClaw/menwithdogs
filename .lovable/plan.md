
# Plan: Dedicated Tag Pages with Linked Content

## Summary

Create a system for certain community tags (especially sensitive ones like "Clothing Optional") to link to dedicated informational pages. These pages will explain the tag's meaning, set community expectations, and optionally link to external spaces for more sensitive discussions.

---

## Architecture Decision

**Two approaches considered:**

| Approach | Pros | Cons |
|----------|------|------|
| **Static pages** (one per sensitive tag) | Full design control, SEO-friendly | More files to maintain, rigid |
| **Dynamic tag page** (single component, data-driven) | Scalable, admin-manageable content | Slightly more complex setup |

**Recommendation**: Hybrid approach
- Create a dynamic `/tags/:slug` route that loads content based on slug
- Store page content in a new `tag_pages` database table for admin flexibility
- For "Clothing Optional" specifically, create rich initial content

---

## Implementation Tasks

### Task 1: Database Schema - Add tag_pages table

Create a new table to store page content for tags that need dedicated pages.

```sql
CREATE TABLE tag_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_slug TEXT NOT NULL REFERENCES canonical_tags(slug) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  body_markdown TEXT NOT NULL,
  external_link_url TEXT,
  external_link_label TEXT,
  seo_title TEXT,
  seo_description TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tag_slug)
);

-- RLS Policies
ALTER TABLE tag_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published tag pages"
  ON tag_pages FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage tag pages"
  ON tag_pages FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));
```

### Task 2: Add has_page flag to canonical_tags

Update the `canonical_tags` table to indicate which tags have dedicated pages.

```sql
ALTER TABLE canonical_tags
ADD COLUMN has_page BOOLEAN DEFAULT false;
```

This allows the UI to conditionally render tags as links vs static badges.

---

### Task 3: Create TagPage Component

**File**: `src/pages/TagPage.tsx`

A dynamic page that:
- Fetches content from `tag_pages` based on the URL slug
- Renders markdown body content
- Displays optional external link (e.g., to Discord/community space)
- Shows places tagged with this tag (discovery value)

```text
Structure:
┌─────────────────────────────────────────────────────────────────┐
│ PageLayout                                                       │
├─────────────────────────────────────────────────────────────────┤
│ SEOHead (dynamic title/description from tag_pages)              │
├─────────────────────────────────────────────────────────────────┤
│ Hero Section                                                     │
│   - Title: "Clothing Optional"                                  │
│   - Subtitle: "Understanding this community tag"                │
├─────────────────────────────────────────────────────────────────┤
│ Body (Markdown rendered)                                        │
│   - What this tag means                                         │
│   - Community guidelines                                        │
│   - No adult content disclaimer                                 │
├─────────────────────────────────────────────────────────────────┤
│ External Link CTA (optional)                                    │
│   - "Join the conversation" → Discord/community link            │
├─────────────────────────────────────────────────────────────────┤
│ Places with this tag (optional section)                         │
│   - Grid of PlaceCards filtered by tag                          │
└─────────────────────────────────────────────────────────────────┘
```

---

### Task 4: Create useTagPage Hook

**File**: `src/hooks/useTagPage.ts`

```typescript
export function useTagPage(slug: string | undefined) {
  return useQuery({
    queryKey: ['tag-page', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('tag_pages')
        .select('*, canonical_tags!inner(label, category, is_sensitive)')
        .eq('tag_slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}
```

---

### Task 5: Add Route to App.tsx

**File**: `src/App.tsx`

```tsx
import TagPage from "./pages/TagPage";

// Add in Routes:
<Route path="/tags/:slug" element={<TagPage />} />
```

---

### Task 6: Update PlaceAttributeBadges to Link Tags

**File**: `src/components/directory/PlaceAttributeBadges.tsx`

Modify the community badge rendering to check if the tag has a page and render as a link:

```tsx
// Before (static badge):
<Badge variant="outline">{badge.label}</Badge>

// After (conditional link):
{badge.hasPage ? (
  <Link to={`/tags/${badge.slug}`}>
    <Badge variant="outline" className="cursor-pointer hover:bg-accent">
      {badge.label}
    </Badge>
  </Link>
) : (
  <Badge variant="outline">{badge.label}</Badge>
)}
```

This requires updating the query in `usePlaceNicheTags` to include the `has_page` flag from `canonical_tags`.

---

### Task 7: Update usePlaceNicheTags Hook

**File**: `src/hooks/usePlaceNicheTags.ts`

Join with `canonical_tags` to get the `has_page` flag:

```typescript
const { data, error } = await supabase
  .from('place_niche_tags')
  .select('*, canonical_tags!inner(label, slug, has_page)')
  .eq('place_id', placeId)
  .order('created_at', { ascending: false });
```

---

### Task 8: Seed Initial Content for "Clothing Optional"

Insert the first tag page content:

```sql
INSERT INTO tag_pages (tag_slug, title, subtitle, body_markdown, external_link_url, external_link_label, seo_title, seo_description, is_published)
VALUES (
  'clothing_optional',
  'Clothing Optional',
  'Understanding this community tag',
  '## What This Tag Means

Places tagged as "Clothing Optional" are outdoor spaces where clothing-optional practices are known or legally permitted. This includes designated nude beaches, naturist resorts, and certain hiking areas.

## Our Directory Standards

**ThickTimber does not host adult content.** Our directory is focused on place discovery — helping you find outdoor spaces that match your preferences and comfort level.

This tag exists to help members identify places where clothing-optional practices are accepted, allowing you to make informed decisions about which places to visit.

## Community Guidelines

- Respect local laws and posted signage
- Practice consent and respect others'' boundaries
- Leave no trace — these spaces deserve protection

## Looking for More?

For members who want to discuss more sensitive topics or share photos from their outdoor adventures, we''ve created a dedicated community space outside our main platform.',
  'https://discord.gg/your-community-link',
  'Join the Community',
  'Clothing Optional Places - ThickTimber',
  'Discover clothing-optional outdoor spaces. Our directory helps you find nude beaches, naturist areas, and clothing-optional trails.',
  true
);

-- Update canonical_tags to mark this tag as having a page
UPDATE canonical_tags SET has_page = true WHERE slug = 'clothing_optional';
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/pages/TagPage.tsx` | Create | Dynamic tag page component |
| `src/hooks/useTagPage.ts` | Create | Fetch tag page content |
| `src/App.tsx` | Modify | Add `/tags/:slug` route |
| `src/components/directory/PlaceAttributeBadges.tsx` | Modify | Make tags with pages clickable |
| `src/hooks/usePlaceNicheTags.ts` | Modify | Include `has_page` flag in query |

## Database Changes

| Table | Change |
|-------|--------|
| `tag_pages` | Create new table |
| `canonical_tags` | Add `has_page` boolean column |

---

## User Flow After Implementation

```text
User views Place Modal:
┌────────────────────────────────────────┐
│ Community tagged                       │
│   [Clothing Optional] ← clickable link │
└────────────────────────────────────────┘
          │
          ▼ clicks tag
┌────────────────────────────────────────┐
│ /tags/clothing_optional                │
├────────────────────────────────────────┤
│ Clothing Optional                      │
│ Understanding this community tag       │
├────────────────────────────────────────┤
│ What This Tag Means                    │
│ ...markdown content...                 │
├────────────────────────────────────────┤
│ [Join the Community] → Discord link    │
└────────────────────────────────────────┘
```

---

## Future Extensibility

This architecture supports:
- Admin UI for managing tag pages (in TagManagement.tsx)
- Multiple sensitive tags with dedicated pages
- SEO optimization for tag discovery
- Linking places with specific tags on the tag page

---

## Technical Notes

- The `tag_pages` table uses a foreign key to `canonical_tags.slug` ensuring data integrity
- RLS ensures only published pages are publicly visible
- The `has_page` flag on `canonical_tags` allows efficient conditional rendering without extra queries
- Markdown rendering uses the existing `react-markdown` dependency
