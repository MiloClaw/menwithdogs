

# Plan: Trail Blazers — Expert-First Reframe

## Summary

Complete reframe of the Ambassadors page to "Trail Blazers" — shifting from geography-based local ambassadors to expertise-based contributors (writers, guides, photographers, and community voices). This positions participation as professional alignment rather than volunteer work.

---

## Key Conceptual Shifts

| Before (Ambassador) | After (Trail Blazer) |
|---------------------|----------------------|
| "Help shape the places that define your city" | "Share your knowledge of outdoor spaces and active lifestyles" |
| Geography-focused ("your city") | Expertise-focused ("outdoor spaces") |
| "Stewardship, not promotion" | "Expertise, not influence" |
| Local helpers | Subject-matter experts |
| "What you know about your city" | "What you know about outdoor activities" |
| City-based form fields | Activity/expertise-based form fields |

---

## Section-by-Section Changes

### 1. SEO & Meta (Lines 118-122)

| Element | Current | New |
|---------|---------|-----|
| Title | "Ambassador Program \| ThickTimber" | "Trail Blazers \| ThickTimber" |
| Description | "Help shape the outdoor places that define your region..." | "Share your expertise on outdoor spaces and active lifestyles. Trail Blazers are trusted voices who add depth to the directory." |

---

### 2. Hero Section (Lines 124-156)

| Element | Current | New |
|---------|---------|-----|
| Section Label | "Ambassador Program" | "Trail Blazers" |
| Headline | "Help Shape the Places That Define Your City" | "Share your knowledge of outdoor spaces and active lifestyles" |
| Subhead | "We're looking for gay men who know the outdoors well — the hidden trails..." | "Trail Blazers are trusted voices who add depth and perspective to outdoor places—helping others explore more intentionally." |

---

### 3. "What Ambassadors Do" → "What Are Trail Blazers?" (Lines 158-210)

| Element | Current | New |
|---------|---------|-----|
| Section Label | "What This Is" | Keep |
| Headline | "Quietly shape how your city is represented" | Remove — use intro paragraphs instead |

**New Content Structure:**

Replace the 3-column grid with explanatory paragraphs:

```text
Trail Blazers are writers, photographers, guides, and community voices who 
share meaningful knowledge about outdoor spaces and active lifestyles.

Some Trail Blazers publish long-form writing or guides. Others document 
personal experiences, seasonal insights, or activity-specific perspectives. 
What they share adds context to places—not promotion.

This program exists to highlight expertise, not influence.
```

---

### 4. NEW: "How Trail Blazers Contribute" Section

**Insert after "What Are Trail Blazers?"**

| Element | Value |
|---------|-------|
| Section Label | "How It Works" |
| Content | Bullet list of contributions |

**Content:**

```text
Trail Blazers may:

• Submit outdoor places relevant to hiking, camping, beaches, running, 
  cycling, or other active pursuits
• Add short context about how a place is used, when it's best experienced, 
  or what makes it unique
• Optionally include a link to an existing article, guide, or post 
  they've published
• Share activity-specific or seasonal considerations

All submissions are reviewed to ensure they add value and align with 
the platform's purpose.
```

---

### 5. NEW: "For Writers & Subject-Matter Experts" Section

| Element | Value |
|---------|-------|
| Section Label | "For Writers, Guides & Experts" |

**Content:**

```text
If you publish content related to outdoor spaces or active lifestyles:

• You may include links to existing articles or guides when contributing places
• Approved links appear as contextual references, not advertisements
• This helps readers discover deeper expertise while keeping the directory 
  focused on places

Trail Blazer links are selected based on relevance and quality—not reach 
or follower count.
```

---

### 6. "What This Is Not" Section (Lines 212-259)

| Element | Current | New |
|---------|---------|-----|
| Section Label | (none) | "Clear Boundaries" |
| Headline | "This is stewardship, not promotion." | Remove |

**New Bullet List:**

```text
This is not:

• An influencer or ambassador program
• A sponsorship or promotional channel
• A ranking system or leaderboard
• A public profile or follower mechanism
• A requirement to promote ThickTimber

Trail Blazers participate as contributors, not representatives.
```

---

### 7. "Who This Is For" Section → REMOVE

Remove the entire "Ideal Ambassador / You know your city" section (Lines 261-293). This section reinforces geography and doesn't fit the expert model.

---

### 8. "What You Get" Section (Lines 295-330)

| Element | Current | New |
|---------|---------|-----|
| Section Label | "What You Get" | Keep |
| Headline | "Access and contribution — not rewards." | Remove headline, just list |

**New Content:**

```text
Trail Blazers may receive:

• Complimentary PRO access (limited and reviewed periodically)
• Optional attribution for approved contextual links
• Early access to new features related to places or activities
• A platform that surfaces your expertise where it's most useful

Participation is optional and can be paused or ended at any time.
```

---

### 9. Application Form Updates (Lines 332-619)

**Section Header Changes:**

| Element | Current | New |
|---------|---------|-----|
| Section Label | "Apply" | "Get Involved" |
| Headline | "A short, respectful application" | Remove |
| Subhead | "No essays. No personality tests..." | "Submissions are reviewed for relevance and quality. There is no requirement to focus on a specific location or audience." |

**Form Field Changes:**

| Field | Current | New |
|-------|---------|-----|
| City field | Required, prominent | Make optional or change to "Primary region (optional)" |
| Tenure field | "How long have you lived there?" | Remove entirely |
| Specific Places | "2-3 local places you'd recommend" | "2-3 outdoor places you'd recommend adding to the directory" |
| Motivation | "Why do you want to help shape your city's directory?" | "What areas of outdoor or active-lifestyle expertise do you focus on?" |
| Local Knowledge | "What kind of local places or events do you know well?" | "Do you have existing writing, guides, or published content? (optional)" |
| Social Links label | "Links to social or online presence" | "Links to relevant writing or guides (optional)" |
| Social Links placeholder | "Instagram, Twitter, blog, etc." | "Blog, publication, guide platform, etc." |

---

### 10. CTA Footer (Lines 621-667)

| Element | Current | New |
|---------|---------|-----|
| Section Label | "Not Ready Yet?" | Keep or remove |
| Headline | "Explore the directory first" | Keep |
| Primary CTA | "Explore Places" | Keep |
| Secondary CTA | "Learn More" (→ /about) | Keep |

**Add "Apply to Be a Trail Blazer" as primary action in hero or as sticky CTA.**

---

## Form Schema Updates

The Zod schema needs updates to reflect the new fields:

| Field | Change |
|-------|--------|
| `city` | Make optional |
| `tenure` | Remove from schema |
| `specificPlaces` label | Update placeholder |
| `motivation` | Rename conceptually to `expertiseArea` |
| `localKnowledge` | Rename to `existingContent` |
| `socialLinks` | Keep but update label/placeholder |

---

## Language Rules Applied

**Always use:**
- "subject-matter experts"
- "writers, guides, and community voices"
- "outdoor spaces and active lifestyles"
- "contextual references"
- "expertise"

**Never use:**
- "early adopters"
- "seeding the directory"
- "local ambassadors"
- "promotion"
- "influencer"
- "partner content"

---

## Technical Implementation Summary

| Section | Line Range | Action |
|---------|------------|--------|
| SEO meta | 118-122 | Update title and description |
| Hero | 143-153 | Replace label, headline, subhead |
| What This Is | 158-210 | Replace 3-column grid with paragraphs |
| NEW: How It Works | — | Insert new section |
| NEW: For Writers | — | Insert new section |
| What This Isn't | 212-259 | Update bullets, add section label |
| Who This Is For | 261-293 | REMOVE entire section |
| What You Get | 295-330 | Update content and remove headline |
| Form section | 332-619 | Update labels, make city optional, remove tenure |
| CTA footer | 621-667 | Minor polish, keep structure |

---

## Database/Schema Consideration

The `ambassador_applications` table currently has:
- `city_name` (required)
- `tenure` (required)

**Recommendation:** Keep database schema as-is for now but make frontend fields optional/renamed. The data still captures useful info even with new framing.

---

## Net Result

The Trail Blazers page now:
- Positions contributors as experts, not helpers
- Removes geography and timing constraints
- Attracts higher-quality contributors
- Makes participation feel prestigious but low-pressure
- Reinforces ThickTimber as an editorial-grade directory
- Uses "designed for" language consistently
- Avoids influencer/promotion framing entirely

