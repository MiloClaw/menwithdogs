
# Plan: Fix Infinite Re-render Loop in Trail Blazer Application Form

## Root Cause Analysis

The "Maximum update depth exceeded" error occurs in three ambassador components that use the same problematic pattern:

1. **`RoleTypeSelector.tsx`**
2. **`ExpertiseAreaSelector.tsx`**  
3. **`AcknowledgementsChecklist.tsx`**

### The Pattern Causing the Bug

```tsx
<div onClick={() => handleToggle(value)}>     {/* Parent handles click */}
  <Checkbox
    checked={isChecked}
    onCheckedChange={() => handleToggle(value)}  {/* Checkbox ALSO handles change */}
    className="pointer-events-none"
  />
</div>
```

### Why This Causes Infinite Loops

1. User clicks the parent `<div>`
2. `onClick` fires → `handleToggle()` → state updates → React re-renders
3. The Radix `Checkbox` detects its `checked` prop changed
4. This triggers `onCheckedChange` callback → `handleToggle()` again → state updates
5. Repeat indefinitely until React throws "Maximum update depth exceeded"

The `pointer-events-none` CSS class prevents mouse events on the checkbox itself, but it does NOT prevent the `onCheckedChange` callback from firing when the `checked` prop changes programmatically.

---

## Solution

Remove the `onCheckedChange` callback from the `<Checkbox>` components since the parent `<div>` already handles the toggle. The checkbox is purely visual (controlled by `checked` prop).

### Option Selected: Remove `onCheckedChange`

This is the cleanest fix because:
- The parent `<div>` already handles all click interactions
- The `<Checkbox>` is purely a visual indicator (controlled component)
- No need for the checkbox to independently trigger state changes

---

## Files to Modify

### 1. `src/components/ambassadors/RoleTypeSelector.tsx`

**Line 49:** Remove `onCheckedChange` prop

```tsx
// Before (line 46-51)
<Checkbox
  id={`role-${role.value}`}
  checked={selectedRoles.includes(role.value)}
  onCheckedChange={() => handleToggle(role.value)}  // ← REMOVE THIS
  className="pointer-events-none"
/>

// After
<Checkbox
  id={`role-${role.value}`}
  checked={selectedRoles.includes(role.value)}
  className="pointer-events-none"
/>
```

---

### 2. `src/components/ambassadors/ExpertiseAreaSelector.tsx`

**Line 49:** Remove `onCheckedChange` prop

```tsx
// Before (line 46-51)
<Checkbox
  id={`expertise-${area.value}`}
  checked={selectedAreas.includes(area.value)}
  onCheckedChange={() => handleToggle(area.value)}  // ← REMOVE THIS
  className="pointer-events-none"
/>

// After
<Checkbox
  id={`expertise-${area.value}`}
  checked={selectedAreas.includes(area.value)}
  className="pointer-events-none"
/>
```

---

### 3. `src/components/ambassadors/AcknowledgementsChecklist.tsx`

**Line 62:** Remove `onCheckedChange` prop

```tsx
// Before (line 59-64)
<Checkbox
  id={`ack-${item.key}`}
  checked={acknowledgements[item.key]}
  onCheckedChange={() => handleToggle(item.key)}  // ← REMOVE THIS
  className="pointer-events-none mt-0.5"
/>

// After
<Checkbox
  id={`ack-${item.key}`}
  checked={acknowledgements[item.key]}
  className="pointer-events-none mt-0.5"
/>
```

---

## Summary of Changes

| File | Line | Change |
|------|------|--------|
| `RoleTypeSelector.tsx` | 49 | Remove `onCheckedChange={() => handleToggle(role.value)}` |
| `ExpertiseAreaSelector.tsx` | 49 | Remove `onCheckedChange={() => handleToggle(area.value)}` |
| `AcknowledgementsChecklist.tsx` | 62 | Remove `onCheckedChange={() => handleToggle(item.key)}` |

---

## After Fix

The flow becomes:
1. User clicks the parent `<div>`
2. `onClick` fires → `handleToggle()` → state updates
3. React re-renders with new `checked` value
4. Checkbox displays correct state (no callback triggered)
5. Done - no infinite loop

---

## Testing Checklist

After implementation, verify on `/ambassadors#apply`:
- [ ] Clicking role type checkboxes toggles them correctly
- [ ] Clicking expertise area checkboxes toggles them correctly  
- [ ] Clicking acknowledgement checkboxes toggles them correctly
- [ ] "Other" text inputs appear when "Other" is selected
- [ ] Form submits successfully when all required fields are filled
- [ ] No console errors about "Maximum update depth exceeded"
