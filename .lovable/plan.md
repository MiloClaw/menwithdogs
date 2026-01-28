

# Plan: Update Privacy & Trust Section Copy

## Summary

Update the "Privacy & Trust" section with refined messaging that better explains the default-private architecture and the distinction between free directory patterns and PRO personalization.

---

## Current vs New Content

| Element | Current | New |
|---------|---------|-----|
| **Section Label** | "Your Data" | "Your Data" (unchanged) |
| **Headline** | "Your preferences are private." | "Designed to be private by default." |
| **Body Copy** | Single long paragraph | 4 structured paragraphs |
| **Closing Line** | "This is how personalization should work." | "Private by default. Intentional by design." |

---

## New Content Structure

```text
Headline: Designed to be private by default.

Paragraph 1: The places you save and how you use the directory are never public.
There's no public profile, no visible activity, and no expectation to share 
more than you choose.

Paragraph 2: The free directory reflects community-level patterns—surfacing 
places men tend to enjoy and return to—without exposing individual behavior. 
Your saved places remain yours.

Paragraph 3: For those who choose to subscribe to PRO, additional preferences 
can be added privately to help the directory better understand your interests, 
routines, and outdoor habits. This information is used only to refine your 
recommendations and is never shared or displayed.

Paragraph 4: Privacy isn't an add-on. It's built into how the directory works.

Closing: Private by default. Intentional by design.
```

---

## Implementation

**File**: `src/components/PrivacyTrust.tsx`

### 1. Update Headline (Line 49-51)

```tsx
// Before
Your preferences are private.

// After
Designed to be private by default.
```

### 2. Replace Body Copy (Lines 62-67)

Replace the current prose with structured paragraphs:

```tsx
<p className="text-foreground text-base md:text-lg leading-relaxed mb-5">
  The places you save and how you use the directory are never public.
  There's no public profile, no visible activity, and no expectation to share more than you choose.
</p>

<p className="text-foreground text-base md:text-lg leading-relaxed mb-5">
  The free directory reflects community-level patterns—surfacing places men tend to enjoy and return to—without exposing individual behavior. Your saved places remain yours.
</p>

<p className="text-foreground text-base md:text-lg leading-relaxed mb-5">
  For those who choose to subscribe to PRO, additional preferences can be added privately to help the directory better understand your interests, routines, and outdoor habits. This information is used only to refine your recommendations and is never shared or displayed.
</p>

<p className="text-foreground text-base md:text-lg leading-relaxed mb-6">
  Privacy isn't an add-on. It's built into how the directory works.
</p>

<p className="text-muted-foreground text-base md:text-lg leading-relaxed font-medium">
  Private by default. Intentional by design.
</p>
```

---

## Typography Hierarchy

| Element | Style |
|---------|-------|
| Main paragraphs | `text-foreground text-base md:text-lg leading-relaxed mb-5` |
| Final explanatory paragraph | `text-foreground text-base md:text-lg leading-relaxed mb-6` |
| Closing line | `text-muted-foreground text-base md:text-lg font-medium` - subtle emphasis |

---

## Technical Notes

- Section label "Your Data" remains unchanged
- Two-column layout remains unchanged (headline left, body right with accent border)
- All Framer Motion animations remain unchanged
- Ghost typography parallax effect remains unchanged
- Removes `text-justify` from paragraphs for cleaner left-aligned reading
- Uses consistent `mb-5` spacing between paragraphs for visual rhythm

