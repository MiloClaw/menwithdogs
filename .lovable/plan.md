

# Plan: Couples Page — Quick Polish (Aligned & Future-Safe)

## Summary

Light polish pass to align the Couples page with the harmonized messaging strategy. This updates copy to be more privacy-forward, emphasizes place-based discovery, and standardizes CTAs—while keeping the page's quiet, useful tone intact.

---

## Section-by-Section Changes

### 1. Hero Section (Lines 45-55)

| Element | Current | New |
|---------|---------|-----|
| Section Label | "Discover Together" | Keep |
| Headline | "Find Outdoor Places That Work for Both of You" | Keep |
| Subhead | "Without sharing your preferences. Without linking accounts. Just better outdoor recommendations — privately." | "Without sharing preferences. Without linking accounts. Just clearer outdoor recommendations—privately." |

**Changes**: Remove "your" for tighter copy, change "better" → "clearer" (more precise), remove space before em-dash.

---

### 2. How It Works Section (Lines 77-97)

| # | Current Step | Polished Step |
|---|--------------|---------------|
| 1 | "One of you generates a session code" | "**Start a private session** — One of you generates a temporary session code." |
| 2 | "Your partner scans or enters the code" | "**Join securely** — The other person enters the code—no account linking required." |
| 3 | "The system finds outdoor places that resonate with both — privately" | "**Explore shared fit** — The directory highlights outdoor places that align with both of your interests—without revealing individual preferences." |
| 4 | "Sessions expire in 24 hours. No permanent data." | "**Session expires automatically** — Sessions close after 24 hours. Nothing is stored or merged." |

**Implementation**: Change the steps array to include titles and descriptions, then render with bold titles.

---

### 3. What Makes This Different Section (Lines 113-154)

| Element | Current | New |
|---------|---------|-----|
| Section Label | "02" | "Designed for privacy" |
| Headline | "What Makes This Different" | Keep |

**Updated Bullets:**

| # | Current Title | Current Description | New Title | New Description |
|---|---------------|---------------------|-----------|-----------------|
| 1 | "Your preferences stay yours" | "No profile sharing between users. Your saved trails, your outdoor interests — completely private." | "Your individual preferences stay private" | "No shared lists or exposed activity between users." |
| 2 | "Works for any duo" | "Couples, hiking buddies, camping companions, travel partners. Anyone exploring the outdoors together." | "Works for any pair" | "Partners, friends, or travel companions—anyone exploring together." |
| 3 | "Place-level intelligence" | "The system doesn't match people. It surfaces outdoor spots that work for both." | Remove | (Consolidated into "Temporary by design") |
| 4 | "Temporary by design" | "Sessions expire. No social graph. No permanent connection between accounts." | "Temporary by design" | "Sessions expire. No permanent connection between accounts." |

**Final 4 items:**
1. Your individual preferences stay private — No shared lists or exposed activity between users.
2. Works for any pair — Partners, friends, or travel companions—anyone exploring together.
3. Place-first, not people-first — The directory surfaces outdoor spots that work for both.
4. Temporary by design — Sessions expire. No permanent connection.

---

### 4. Privacy Promise Section (Lines 168-211)

| Element | Current | New |
|---------|---------|-----|
| Section Label | "03" | "Privacy, by default" |
| Headline | "Privacy Promise" | Keep |

**Updated Cards (minor tune):**

| # | Current Title | New Title | Current Description | New Description |
|---|---------------|-----------|---------------------|-----------------|
| 1 | "Your partner never sees your saved places" | Keep | "What you've favorited stays between you and the directory." | Keep |
| 2 | "Your individual preferences remain private" | "Individual preferences remain separate" | "The system uses both inputs without revealing either." | Keep |
| 3 | "We surface places that work for both" | "Only shared place recommendations are shown" | "Common ground — without exposing individual taste." | "Common ground—without exposing individual taste." |
| 4 | "No account linking. No permanent connection." | "No account linking. No lasting connection." | "Each session is temporary and independent." | "Designed for planning, not performance." |

---

### 5. Perfect For Section (Lines 225-268)

| Element | Current | New |
|---------|---------|-----|
| Section Label | "04" | "Works well for" |
| Headline | "Perfect For" | Keep |

**Updated Cards (slight polish):**

| # | Current Title | New Title |
|---|---------------|-----------|
| 1 | "Couples planning a hiking trip" | "Couples planning a hiking or camping trip" |
| 2 | "Outdoor buddies exploring new areas" | "Outdoor buddies exploring a new area" |
| 3 | "Friends planning a camping weekend" | "Friends coordinating a weekend adventure" |
| 4 | "Travel companions on a road trip" | "Travel companions mapping stops along the way" |

**Updated Descriptions:**

| # | Current | New |
|---|---------|-----|
| 1 | "Find trails and campsites you'll both love — no more compromise debates." | "Find trails and campsites you'll both enjoy." |
| 2 | "Quickly find spots that match both your outdoor styles in unfamiliar terrain." | "Quickly find spots that work for both of you." |
| 3 | "Discover campgrounds that resonate with both of you." | "Discover places that work for the whole group." |
| 4 | "Build a shared list of outdoor stops along your route." | "Build a shared list of outdoor stops along the way." |

---

### 6. CTA Section (Lines 281-304)

| Element | Current | New |
|---------|---------|-----|
| Section Label | "Get Started" | Keep |
| Headline | "Ready to discover together?" | "Ready to explore together?" |
| Subhead | "Start a session with your partner, hiking buddy, or travel companion. Find outdoor places that work for both of you — without sharing preferences." | "Start a session with a partner, friend, or travel companion. Find outdoor places that work for both of you—privately." |
| Primary CTA | "Start a Session" | Keep |
| Secondary CTA | "Explore Outdoors" | "Explore Places" |

---

## Technical Implementation Summary

| Section | Line Range | Change Type |
|---------|------------|-------------|
| Hero subhead | 53-54 | Text polish |
| How It Works steps | 78-83 | Structure change (add titles) + render update |
| What Makes This Different label | 114-115 | Change to "Designed for privacy" |
| What Makes This Different items | 123-140 | Content updates (4 items) |
| Privacy Promise label | 169 | Change to "Privacy, by default" |
| Privacy Promise items | 176-196 | Minor text updates |
| Perfect For label | 226 | Change to "Works well for" |
| Perfect For items | 233-253 | Title and description updates |
| CTA headline | 285-286 | "discover" → "explore" |
| CTA subhead | 288-290 | Tightened copy |
| Secondary CTA | 302 | "Explore Outdoors" → "Explore Places" |

---

## Messaging Guardrails Applied

- No "not a dating app" language added
- No relationship definitions
- No public or social framing
- No permanence implied
- Kept place-first orientation
- Standardized secondary CTA to "Explore Places"

---

## Net Result

The Couples page now:
- Uses cleaner, more consistent copy
- Emphasizes privacy without being defensive
- Aligns CTA language with the rest of the site
- Remains legally safe (no intent policing)
- Functions as one of the best examples of quiet social utility

