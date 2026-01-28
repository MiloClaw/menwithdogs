

# Plan: Update Auth / Signup Page — Refined & Aligned

## Summary

Update the Auth page with refined copy for both sign-in and sign-up modes, including updated headlines, subheadlines, privacy reassurance text, CTA buttons, toggle links, and success toast message.

---

## Current vs New Content

### SIGN IN MODE

| Element | Current | New |
|---------|---------|-----|
| Section Label | "Welcome Back" | "Welcome Back" (unchanged) |
| Headline | "Sign in to continue" | "Sign in to continue" (unchanged) |
| Subheadline | "Continue discovering your community" | "Pick up where you left off and keep exploring places shaped by your interests." |
| CTA Button | "Sign in" | "Sign In" |
| Toggle | "New here? Create an account" | "New here? Join free" |

---

### SIGN UP MODE

| Element | Current | New |
|---------|---------|-----|
| Section Label | "Get Started" | "Get Started" (unchanged) |
| Headline | "Join The Community" | "Join the directory" |
| Subheadline | "Start discovering places where your community gathers" | "Start discovering outdoor places shaped by shared interests and community patterns." |
| Privacy Reassurance | "Your information stays private by default. No public profiles unless you choose it..." | See refined copy below |
| CTA Button | "Get started" | "Join Free" |
| Toggle | "Already a member? Sign in" | "Already a member? Sign in" (unchanged) |

---

### SIGN UP Privacy Reassurance (Critical Update)

**Current (Problematic)**:
```
Your information stays private by default. No public profiles unless you choose it. 
Your profile and settings only tune the directory to provide better recommendations for you.
```

**New (Refined)**:
```
Your information is private by default.
Your account and preferences are used only to personalize the directory and improve 
recommendations for you. Nothing you save or set is publicly visible.
```

This change:
- Removes "No public profiles unless you choose it" (conflicts with locked privacy-first framing)
- Focuses on what the data IS used for, not what it isn't
- Maintains trust without implying future public profiles

---

### SUCCESS TOAST (Post-Signup)

| Element | Current | New |
|---------|---------|-----|
| Title | "Welcome to the community" | "Welcome" |
| Description | "Start exploring places where real connection happens." | "Start exploring places where shared interests take shape." |

---

## Technical Implementation

**File**: `src/pages/Auth.tsx`

### 1. Update Sign-In Subheadline (Line 269)

```tsx
// Before
{mode === 'signin' ? 'Continue discovering your community' : ...}

// After
{mode === 'signin' ? 'Pick up where you left off and keep exploring places shaped by your interests.' : ...}
```

### 2. Update Sign-Up Headline (Line 255)

```tsx
// Before
{... : 'Join The Community'}

// After
{... : 'Join the directory'}
```

### 3. Update Sign-Up Subheadline (Line 269)

```tsx
// Before
{... : 'Start discovering places where your community gathers'}

// After
{... : 'Start discovering outdoor places shaped by shared interests and community patterns.'}
```

### 4. Update Privacy Reassurance Text (Lines 285-287)

```tsx
// Before
<p className="text-muted-foreground leading-relaxed text-xs text-left">
  Your information stays private by default. No public profiles unless you choose it. 
  Your profile and settings only tune the directory to provide better recommendations for you.
  <br />​
</p>

// After
<p className="text-muted-foreground leading-relaxed text-xs text-left">
  Your information is private by default. Your account and preferences are used only to 
  personalize the directory and improve recommendations for you. Nothing you save or set 
  is publicly visible.
</p>
```

### 5. Update Sign-Up CTA Button (Line 320)

```tsx
// Before
{isSubmitting ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Get started'}

// After
{isSubmitting ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Join Free'}
```

### 6. Update Toggle Link (Line 337)

```tsx
// Before
{mode === 'signin' ? "New here? Create an account" : 'Already a member? Sign in'}

// After
{mode === 'signin' ? "New here? Join free" : 'Already a member? Sign in'}
```

### 7. Update Success Toast (Lines 171-174)

```tsx
// Before
toast({
  title: 'Welcome to the community',
  description: 'Start exploring places where real connection happens.'
});

// After
toast({
  title: 'Welcome',
  description: 'Start exploring places where shared interests take shape.'
});
```

---

## Visual Consistency

| Element | Styling Notes |
|---------|---------------|
| Headline capitalization | "Join the directory" (sentence case, not title case) |
| CTA capitalization | "Sign In" and "Join Free" (title case for buttons) |
| Privacy text | Keep `text-xs` size, remove trailing `<br />​` |
| Toggle link | Lowercase "free" in "Join free" for casual tone |

---

## Messaging Guardrails Applied

- Removed "No public profiles unless you choose it" (implies future public profiles)
- Removed "real connection happens" from toast (too outcome-heavy)
- Changed "community" to "directory" in headline (aligns with place-centric positioning)
- Added "outdoor" to sign-up subheadline (brand alignment)
- Kept toggle casual with lowercase "free"

