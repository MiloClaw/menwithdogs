

# Plan: Footer Content-Only Update

## Summary

Update the footer link labels and grouping to shift language from social outcomes to tool-based use cases. This is a **content-only update** — no changes to layout, typography, spacing, colors, branding, or visual hierarchy.

---

## What Is NOT Changing (Locked)

| Element | Status |
|---------|--------|
| Logo / BrandLockup | Locked |
| Wordmark | Locked |
| Footer visual layout | Locked |
| Typography, spacing, colors | Locked |
| Brand stripe | Locked |
| Tagline styling | Locked |
| Grid structure (4 columns) | Locked |

---

## Changes Required

### 1. Column 1: Explore (No Changes)

Current links stay exactly as-is:
- Places → `/places`
- Outdoors → `/outdoors`
- National Parks → `/places/national-parks`
- Discover Together → `/together`

**Action:** None needed.

---

### 2. Column 2: "Community" → "Use Cases"

**Header Change:** `Community` → `Use Cases`

**Link Label Changes:**

| Current Label | New Label | Route (Unchanged) |
|---------------|-----------|-------------------|
| Gay Community | Outdoor Community | `/community` |
| Find Friends | Friends & Groups | `/find-friends` |
| Couples | Couples | `/couples` |

**Why:** Removes social-app implication. Frames these as applications of the directory rather than social outcomes.

---

### 3. Column 3: "Company" → "About"

**Header Change:** `Company` → `About`

**Link Label Changes:**

| Current Label | New Label | Route |
|---------------|-----------|-------|
| About | Why ThickTimber | `/about` |
| FAQ | FAQ | `/faq` |
| Pricing | Pricing | `/pricing` |
| Terms | *(moved to Legal)* | — |
| Privacy | *(moved to Legal)* | — |
| (new) | Trail Blazers | `/ambassadors` |

**Why:** 
- "Why ThickTimber" reinforces the tool-first philosophy
- Trail Blazers is now a visible contributor program
- Legal links move to a dedicated section

---

### 4. Column 4: Add "Legal" Section

**New Column Header:** `Legal`

**Links:**
- Terms of Service → `/terms`
- Privacy Policy → `/privacy`

**Why:** Separates legal/governance links from general "About" content for clarity.

---

### 5. Tagline (Text Only)

**Current:**
```
Real places. Real community. Real connection.
```

**Decision:** Keep as-is (Option A from plan).

The tagline styling remains unchanged. It appears only once in the footer.

---

## Technical Implementation

### File: `src/components/Footer.tsx`

**Line 44-59:** Update Column 2
- Change header from "Community" to "Use Cases"
- Update link labels

**Line 62-84:** Update Column 3
- Change header from "Company" to "About"
- Update "About" label to "Why ThickTimber"
- Add Trail Blazers link to `/ambassadors`
- Remove Terms and Privacy links

**Line 84 (new):** Add Column 4
- Add new "Legal" column
- Move Terms and Privacy here with updated labels

**Grid Update (Line 11):**
- Change from 4 columns to 5 columns: `lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]`

---

## Updated Footer Structure

```text
┌─────────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ [Brand Lockup]  │   Explore    │  Use Cases   │    About     │    Legal     │
│                 │              │              │              │              │
│ Real places.    │ Places       │ Outdoor      │ Why          │ Terms of     │
│ Real community. │ Outdoors     │  Community   │ ThickTimber  │  Service     │
│ Real connection.│ National     │ Friends &    │ Trail        │ Privacy      │
│                 │  Parks       │  Groups      │  Blazers     │  Policy      │
│                 │ Discover     │ Couples      │ FAQ          │              │
│                 │  Together    │              │ Pricing      │              │
└─────────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## Route Verification

All routes verified in `App.tsx`:

| Link | Route | Exists |
|------|-------|--------|
| Places | `/places` | ✅ |
| Outdoors | `/outdoors` | ✅ |
| National Parks | `/places/national-parks` | ✅ |
| Discover Together | `/together` | ✅ |
| Outdoor Community | `/community` | ✅ |
| Friends & Groups | `/find-friends` | ✅ |
| Couples | `/couples` | ✅ |
| Why ThickTimber | `/about` | ✅ |
| Trail Blazers | `/ambassadors` | ✅ |
| FAQ | `/faq` | ✅ |
| Pricing | `/pricing` | ✅ |
| Terms of Service | `/terms` | ✅ |
| Privacy Policy | `/privacy` | ✅ |

---

## After This Change

A user reading only the footer will think:

> "This is a directory of places with different ways to use it."

Not:

> "This is another social or dating platform."

