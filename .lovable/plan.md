

# Typography & Button Refinement Implementation Plan

## Executive Summary

This plan standardizes typography for improved hierarchy and accessibility, while ensuring all buttons follow a consistent, robust design language aligned with the ThickTimber brand identity.

---

## Part 1: Typography Refinements

### Current Issues Identified

| Issue | Location | Current | Problem |
|-------|----------|---------|---------|
| Flat hierarchy | Section headers | All use `text-base` | No visual differentiation between primary sections and sub-sections |
| Accessibility | Helper text | `text-xs` (12px) | Below WCAG accessibility threshold for some users |
| Accessibility | PRO hints | `text-[10px]` | Too small for mobile readability |
| Brand disconnect | Tab labels | Sans-serif | Doesn't match the `font-serif` page title |
| Inconsistency | Account tab | Uses `text-lg` for "Your Account" | Preferences tab uses `text-base` for section headers |

### Typography Changes

#### 1.1 Scale Up Helper Text (Accessibility Fix)

**Files to modify:**
- `src/components/profile/DistanceSection.tsx`
- `src/components/profile/TimeOfDaySection.tsx`
- `src/components/profile/GeoAffinitySection.tsx`
- `src/components/profile/PlaceUsageSection.tsx`
- `src/components/profile/OpennessSection.tsx`
- `src/components/profile/AdventureStyleSection.tsx`
- `src/components/profile/WeatherFlexibilitySection.tsx`
- `src/components/profile/GearReadinessSection.tsx`
- `src/components/profile/NaturePrioritiesSection.tsx`
- `src/components/profile/PrivacySection.tsx`
- `src/components/settings/SettingsPreferencesTab.tsx` (intent section, intro paragraph)

**Change:**
```tsx
// Before
<p className="text-xs text-muted-foreground">

// After
<p className="text-sm text-muted-foreground leading-relaxed">
```

**Impact:** Helper text increases from 12px to 14px with improved line height for multi-line content.

#### 1.2 Scale Up PRO Hint Text

**File to modify:**
- `src/components/settings/pro/ProOptionChips.tsx`

**Change:**
```tsx
// Before (line 51)
<span className="text-[10px] text-muted-foreground/50 uppercase tracking-wide">

// After
<span className="text-xs text-muted-foreground/50 uppercase tracking-wide">
```

**Impact:** PRO "Choose one" hint increases from 10px to 12px.

#### 1.3 Apply Serif to Tab Labels

**File to modify:**
- `src/pages/Settings.tsx`

**Change:**
```tsx
// Before (lines 109-120)
<TabsTrigger 
  value="preferences" 
  className="min-h-[48px] rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 mr-6 text-base transition-colors"
>

// After
<TabsTrigger 
  value="preferences" 
  className="min-h-[48px] rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 mr-6 text-base font-serif font-medium transition-colors"
>
```

**Impact:** Tab labels now match the editorial serif identity of the page title.

#### 1.4 Standardize Section Header Hierarchy

**Files to modify:**
- All profile section components (see 1.1 list)
- `src/components/settings/SettingsPreferencesTab.tsx`
- `src/components/settings/pro/ProSettingsFlow.tsx`

**Hierarchy definition:**
```text
├── Page Title: text-3xl font-serif font-medium (existing - no change)
├── Primary Section Headers: text-base font-medium (standardize all)
├── Collapsible Headers: text-sm font-semibold uppercase tracking-wide
└── Sub-section Headers (Phase 3): text-sm font-medium
```

**Changes:**

**For collapsible trigger in SettingsPreferencesTab.tsx (line 322):**
```tsx
// Before
<span className="text-base font-medium tracking-wide text-foreground">
  How you explore
</span>

// After
<span className="text-sm font-semibold uppercase tracking-wide text-foreground">
  How you explore
</span>
```

**For Phase 3 sub-sections (AdventureStyleSection, etc.):**
```tsx
// Before
<h4 className="text-sm font-medium text-foreground">

// After (no change - this is correct for sub-sections)
<h4 className="text-sm font-medium text-foreground">
```

#### 1.5 Scale Up Privacy Bullets

**File to modify:**
- `src/components/profile/PrivacySection.tsx`

**Change:**
```tsx
// Before (line 36)
<ul className="space-y-1.5 list-disc list-inside text-xs">

// After
<ul className="space-y-2 list-disc list-inside text-sm leading-relaxed">
```

---

## Part 2: Button Consistency

### Current Button Audit

| Location | Variant | Size | Styling | Issue |
|----------|---------|------|---------|-------|
| Account tab - Change password | `ghost` | `sm` | `h-9 text-sm` | Inconsistent height |
| Account tab - Manage/Upgrade | `ghost`/`default` | `sm` | `h-9 text-sm` | Correct |
| Account tab - Delete Account | `destructive` | `sm` | `min-h-[44px]` | Correct touch target |
| Dialog - Cancel/Submit | `outline`/`default` | default | No explicit height | May be shorter than 44px |
| Intent grid buttons | `default`/`outline` | custom | `h-auto py-3` | Correct |
| PRO chips | `default`/`outline` | `sm` | `min-h-[44px]` | Correct |
| Back button | `ghost` | `icon` | default | Correct |
| Entry cards | Link cards | - | `min-h-[48px]` implied | Correct |

### Button Standardization Rules

**Minimum touch target:** All interactive buttons must be `min-h-[44px]` for mobile accessibility.

**Variant usage:**
- **Primary actions:** `variant="default"` (Deep Navy fill)
- **Secondary actions:** `variant="outline"` (border with transparent fill)
- **Tertiary/inline actions:** `variant="ghost"` (no border, subtle hover)
- **Destructive actions:** `variant="destructive"` (red fill)

**Typography:**
- Font: `text-sm font-medium` (already in base button component)
- Uppercase NOT required (matches ThickTimber editorial voice)

### Button Changes

#### 2.1 Standardize Account Tab Ghost Buttons

**File to modify:**
- `src/components/settings/SettingsAccountTab.tsx`

**Changes:**
```tsx
// Line 62-68 - Change password button
<Button 
  variant="ghost" 
  size="sm"
  className="h-9 text-sm hover:bg-muted/50 transition-colors"

// After
<Button 
  variant="ghost" 
  size="sm"
  className="min-h-[44px] px-4 text-sm hover:bg-muted/50 transition-colors"
```

```tsx
// Line 101-109 - Manage button
<Button
  variant="ghost"
  size="sm"
  className="h-9 text-sm hover:bg-muted/50 transition-colors"

// After
<Button
  variant="ghost"
  size="sm"
  className="min-h-[44px] px-4 text-sm hover:bg-muted/50 transition-colors"
```

```tsx
// Line 111-119 - Upgrade button
<Button
  variant="default"
  size="sm"
  className="h-9 text-sm"

// After
<Button
  variant="default"
  size="sm"
  className="min-h-[44px] px-6 text-sm"
```

#### 2.2 Standardize Dialog Buttons

**File to modify:**
- `src/components/settings/ChangePasswordDialog.tsx`

**Changes:**
```tsx
// Lines 126-135 - Dialog footer buttons
<Button 
  type="button" 
  variant="outline" 
  onClick={() => onOpenChange(false)}
>
  Cancel
</Button>
<Button type="submit" disabled={isSubmitting}>

// After
<Button 
  type="button" 
  variant="outline" 
  className="min-h-[44px]"
  onClick={() => onOpenChange(false)}
>
  Cancel
</Button>
<Button 
  type="submit" 
  className="min-h-[44px]" 
  disabled={isSubmitting}
>
```

#### 2.3 Standardize Account Actions Trigger

**File to modify:**
- `src/components/settings/SettingsAccountTab.tsx`

**Change:**
```tsx
// Lines 129-138 - Account actions trigger
<Button 
  variant="ghost" 
  className="w-full justify-between h-12 text-muted-foreground hover:text-foreground transition-colors"
>

// After (h-12 = 48px, already meets 44px minimum - no change needed)
```

---

## Part 3: Files Summary

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Settings.tsx` | Add `font-serif font-medium` to TabsTrigger |
| `src/components/settings/SettingsPreferencesTab.tsx` | Scale helper text, update collapsible header |
| `src/components/settings/SettingsAccountTab.tsx` | Standardize button heights |
| `src/components/settings/ChangePasswordDialog.tsx` | Add min-height to dialog buttons |
| `src/components/settings/pro/ProOptionChips.tsx` | Scale PRO hint text |
| `src/components/settings/pro/ProSettingsFlow.tsx` | Scale helper text |
| `src/components/profile/DistanceSection.tsx` | Scale helper text |
| `src/components/profile/TimeOfDaySection.tsx` | Scale helper text |
| `src/components/profile/GeoAffinitySection.tsx` | Scale helper text |
| `src/components/profile/PlaceUsageSection.tsx` | Scale helper text |
| `src/components/profile/OpennessSection.tsx` | Scale helper text |
| `src/components/profile/AdventureStyleSection.tsx` | Scale helper text |
| `src/components/profile/WeatherFlexibilitySection.tsx` | Scale helper text |
| `src/components/profile/GearReadinessSection.tsx` | Scale helper text |
| `src/components/profile/NaturePrioritiesSection.tsx` | Scale helper text |
| `src/components/profile/PrivacySection.tsx` | Scale helper text and bullets |

---

## Part 4: Implementation Order

```text
Step 1: Typography foundation
├── Update src/pages/Settings.tsx (serif tabs)
├── Update src/components/settings/SettingsPreferencesTab.tsx (collapsible header + helper text)
└── Update src/components/settings/pro/ProOptionChips.tsx (hint text)

Step 2: Profile section helper text (parallel)
├── DistanceSection.tsx
├── TimeOfDaySection.tsx
├── GeoAffinitySection.tsx
├── PlaceUsageSection.tsx
├── OpennessSection.tsx
├── AdventureStyleSection.tsx
├── WeatherFlexibilitySection.tsx
├── GearReadinessSection.tsx
├── NaturePrioritiesSection.tsx
└── PrivacySection.tsx

Step 3: PRO flow helper text
└── Update src/components/settings/pro/ProSettingsFlow.tsx

Step 4: Button standardization
├── Update src/components/settings/SettingsAccountTab.tsx
└── Update src/components/settings/ChangePasswordDialog.tsx
```

---

## Result

After implementation:

**Typography:**
- Helper text scales from 12px to 14px (improved readability)
- PRO hints scale from 10px to 12px (meets accessibility baseline)
- Tab labels use editorial serif to match page title
- Clear visual hierarchy between primary sections and sub-sections
- Collapsible headers are differentiated with uppercase + tracking

**Buttons:**
- All interactive buttons meet 44px minimum touch target
- Consistent height across Account tab actions
- Dialog buttons match the rest of the page
- Maintains ThickTimber's robust, masculine aesthetic with rounded-full buttons and clear visual weight

