

# Plan: Update How It Works Section Copy

## Summary

Update the "How It Works" section with refined step titles, two-line descriptions, and updated reassurance copy with a new CTA button.

---

## Current vs New Content

| Element | Current | New |
|---------|---------|-----|
| **Step 01 Title** | "Browse and Add" | "Explore and Contribute" |
| **Step 01 Description** | Single line | Two sentences with line break |
| **Step 02 Title** | "Favorite and Return" | "Save What You Enjoy" |
| **Step 02 Description** | Single line | Two sentences with line break |
| **Step 03 Title** | "Smarter Over Time" | "Better Over Time" |
| **Step 03 Description** | Single line | Two sentences with line break |
| **Reassurance Copy** | "This is not a dating app. There's no swiping, feeds, or public profiles." | "This is a place-based tool designed for real-world use. Your activity is private, and there's no pressure to interact unless you choose to." |
| **CTA Button** | "Start Free" | "Join Free" |

---

## Implementation

**File**: `src/components/HowItWorks.tsx`

### 1. Update Steps Array (Lines 6-21)

```tsx
const steps = [{
  number: "01",
  icon: MapPin,
  title: "Explore and Contribute",
  description: "Browse trails, campsites, beaches, and outdoor places in the directory.\nKnow a spot that belongs here? Add it and help others discover places worth returning to."
}, {
  number: "02",
  icon: Bookmark,
  title: "Save What You Enjoy",
  description: "Save places you genuinely like and would visit again.\nYour saved spots shape what you see—quietly refining recommendations around your interests and routines."
}, {
  number: "03",
  icon: RotateCcw,
  title: "Better Over Time",
  description: "As more men use the directory and share places they enjoy, patterns begin to form.\nThe directory highlights places where men with similar interests tend to gather—often revealing opportunities you wouldn't notice otherwise."
}];
```

### 2. Update Description Rendering

Modify the description `<p>` elements to support multi-line text using `whitespace-pre-line`:

**Desktop (Line 91-92):**
```tsx
<p className="text-muted-foreground text-base lg:text-lg leading-relaxed whitespace-pre-line">
  {step.description}
</p>
```

**Mobile (Line 137-138):**
```tsx
<p className="text-muted-foreground text-base leading-relaxed whitespace-pre-line">
  {step.description}
</p>
```

### 3. Update Reassurance Copy (Lines 153-154)

```tsx
<p className="text-muted-foreground mb-6 max-w-lg mx-auto">
  This is a place-based tool designed for real-world use.
  Your activity is private, and there's no pressure to interact unless you choose to.
</p>
```

### 4. Update CTA Button Text (Lines 156-163)

```tsx
<Button 
  variant="accent" 
  size="lg" 
  onClick={() => navigate('/auth?mode=signup')}
>
  Join Free
  <ChevronRight className="w-4 h-4" />
</Button>
```

---

## Typography & Formatting

| Element | Approach |
|---------|----------|
| Multi-line descriptions | Use `\n` in strings + `whitespace-pre-line` CSS class |
| Reassurance max-width | Increase from `max-w-md` to `max-w-lg` for two-sentence copy |

---

## Technical Notes

- Icon assignments remain unchanged (MapPin, Bookmark, RotateCcw)
- All Framer Motion animations remain unchanged
- Desktop/mobile layouts remain unchanged
- Section header "How It Works" unchanged
- Uses `whitespace-pre-line` to render newline characters in descriptions

