
# Replace Google Place Types Input with Checkbox Multi-Select

## Current State

The Tag Management edit dialog uses a simple text input for "Applicable Google Place Types":
- Admins must know and manually type Google Place type values (e.g., `bar, restaurant, cafe`)
- No visibility into available options
- Error-prone and hard to discover valid types

## Proposed Solution

Replace the text input with a grouped checkbox list showing all 160+ Google Place Types from `GOOGLE_PLACE_TYPES`, organized by category (Food, Nightlife, Entertainment, etc.).

### Visual Design

```text
┌────────────────────────────────────────────────────────┐
│ Applicable Google Place Types                          │
│ Select which place types this tag applies to           │
├────────────────────────────────────────────────────────┤
│ ☐ Select All                                           │
├────────────────────────────────────────────────────────┤
│ ▼ Food & Dining (33 types)                             │
│   ☐ Restaurant                                         │
│   ☐ Café                                               │
│   ☐ Bakery                                             │
│   ☐ Coffee Shop                                        │
│   ...                                                  │
├────────────────────────────────────────────────────────┤
│ ▼ Nightlife (6 types)                                  │
│   ☑ Bar                    ← checked                   │
│   ☑ Pub                    ← checked                   │
│   ☐ Night Club                                         │
│   ...                                                  │
├────────────────────────────────────────────────────────┤
│ ▼ Outdoor & Nature (16 types)                          │
│   ☐ Park                                               │
│   ☐ Hiking Area                                        │
│   ...                                                  │
└────────────────────────────────────────────────────────┘
│ Leave all unchecked to apply to all place types        │
└────────────────────────────────────────────────────────┘
```

### Implementation Details

#### 1. Create New Component: `GoogleTypesCheckboxList.tsx`

**Location:** `src/components/admin/tags/GoogleTypesCheckboxList.tsx`

**Props:**
- `selectedTypes: string[]` - Currently selected Google Place type values
- `onChange: (types: string[]) => void` - Callback when selection changes

**Features:**
- Uses `GOOGLE_PLACE_TYPES` and `PLACE_TYPE_CATEGORIES` from `src/lib/google-places-types.ts`
- Groups types by category with collapsible sections using Radix Collapsible
- Shows count of types per category
- "Select All" checkbox at top
- Category-level "Select All" checkbox for each group
- Scrollable container with max-height for the dialog
- Touch-friendly checkboxes (44px targets)

#### 2. Update TagForm Component

**File:** `src/pages/admin/TagManagement.tsx`

**Changes:**
- Import the new `GoogleTypesCheckboxList` component
- Change `formData.applicable_google_types` from `string` to `string[]`
- Replace the text `Input` with the new checkbox component
- Update `handleCreateTag` and `handleUpdateTag` to pass array directly (no split/join needed)
- Update `openEditDialog` to set array directly (no join needed)
- Update `resetForm` to use `[]` instead of `''`

#### 3. Form Data Type Update

**Before:**
```typescript
const [formData, setFormData] = useState({
  // ...
  applicable_google_types: '', // comma-separated string
});
```

**After:**
```typescript
const [formData, setFormData] = useState({
  // ...
  applicable_google_types: [] as string[], // array of type values
});
```

---

## Technical Specifications

### Component Structure

```typescript
// src/components/admin/tags/GoogleTypesCheckboxList.tsx
interface GoogleTypesCheckboxListProps {
  selectedTypes: string[];
  onChange: (types: string[]) => void;
}

// Uses:
// - GOOGLE_PLACE_TYPES from '@/lib/google-places-types'
// - PLACE_TYPE_CATEGORIES from '@/lib/google-places-types'
// - Checkbox from '@/components/ui/checkbox'
// - Collapsible from '@/components/ui/collapsible'
// - ScrollArea from '@/components/ui/scroll-area'
```

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/admin/tags/GoogleTypesCheckboxList.tsx` | Create | New checkbox list component |
| `src/pages/admin/TagManagement.tsx` | Modify | Update TagForm to use new component |

### UX Considerations

1. **Mobile-first**: Each checkbox row has adequate tap target
2. **Discoverability**: All types visible and searchable
3. **Efficiency**: Category-level select/deselect for bulk operations
4. **Clarity**: Empty selection = applies to all (existing behavior preserved)
5. **Performance**: Collapsible sections prevent overwhelming the DOM with 160+ visible checkboxes initially
