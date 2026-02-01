
# Simplify to Single Subscription Product

## Summary

Remove all Founders and Event Posting subscription logic, keeping only the PRO Personalization product at $1.99/month. This eliminates confusion and aligns with the single-product model.

---

## What Gets Removed

### Edge Functions to Delete (5 total)

| Function | Purpose | Why Remove |
|----------|---------|------------|
| `create-founders-checkout` | Founders-specific checkout with promo codes | No longer needed |
| `record-founders-redemption` | Track founders redemptions | No longer needed |
| `manage-founders-promo` | Admin promo code management | No longer needed |
| `create-event-checkout` | Per-event subscription checkout | No longer needed |
| `cancel-event-subscriptions` | Cancel event subscriptions | No longer needed |
| `create-city-promo-code` | Create city promo codes | No longer needed |

### Admin Pages to Remove

| Page | Path |
|------|------|
| FoundersManagement | `/admin/founders` |

### Hooks to Remove

| Hook | Purpose |
|------|---------|
| `useFoundersOffer` | Check founders availability |
| `useFoundersManagement` | Admin founders management |

### Admin Components to Remove

| Component | Path |
|-----------|------|
| `FoundersHeroStats` | `src/components/admin/founders/FoundersHeroStats.tsx` |
| `FoundersCitiesTable` | `src/components/admin/founders/FoundersCitiesTable.tsx` |
| `FoundersRedemptionsTable` | `src/components/admin/founders/FoundersRedemptionsTable.tsx` |
| `PromoCodeStatusBadge` | `src/components/admin/founders/PromoCodeStatusBadge.tsx` |

---

## Files to Modify

### 1. `src/lib/founders-pricing.ts`

Remove FOUNDERS and EVENT sections, keep only PRO:

```text
Before:
├── PRO (keep)
├── EVENT (remove)
├── FOUNDERS (remove)
└── COUPON (remove)

After:
└── PRO only
```

---

### 2. `supabase/functions/check-subscription/index.ts`

Simplify to only detect PRO subscriptions:
- Remove FOUNDERS_PRICE_ID constant
- Remove EVENT_PRICE_ID constant
- Remove event subscription detection logic
- Remove founders detection logic
- Simplify response shape

---

### 3. `src/hooks/useSubscription.ts`

Remove:
- `EventSubscription` interface
- `createFoundersCheckout` mutation
- `createEventCheckout` mutation
- `cancelEventSubscription` mutation
- `recordFoundersRedemption` mutation
- `hasEventPosting`, `eventSubscriptions` from return
- `isFounders`, `foundersCityId` from return

Keep:
- `createCheckout` (PRO only)
- `openCustomerPortal`
- `hasPro`, `isPro`

---

### 4. `src/components/admin/dashboard/GrowthProgramsCard.tsx`

Update pricing constant:
```text
const PRO_PRICE = 4.99  →  const PRO_PRICE = 1.99
```

Remove founders-specific revenue calculation.

---

### 5. `src/pages/admin/AdminDashboard.tsx`

Remove founders stats section from dashboard.

---

### 6. `src/pages/admin/UserManagement.tsx`

Remove "founders" case from subscription badge rendering.

---

### 7. Admin Sidebar

Remove founders management link.

---

## Database Considerations

The following database tables/columns are related to Founders but should **NOT** be deleted via migration (they contain historical data):
- `founders_redemptions` table
- `cities.founders_promo_code_id`
- `cities.founders_slots_total`
- `cities.founders_slots_used`

These can remain in the database but will no longer be referenced by the application.

---

## Implementation Order

```text
1. Delete edge functions (6 functions)
   └── create-founders-checkout
   └── record-founders-redemption
   └── manage-founders-promo
   └── create-event-checkout
   └── cancel-event-subscriptions
   └── create-city-promo-code

2. Update check-subscription edge function
   └── Remove founders/event detection
   └── Simplify to PRO-only

3. Simplify frontend code
   └── Update src/lib/founders-pricing.ts
   └── Update src/hooks/useSubscription.ts
   └── Remove src/hooks/useFoundersOffer.ts
   └── Remove src/hooks/useFoundersManagement.ts

4. Update admin pages
   └── Remove FoundersManagement page
   └── Update AdminDashboard
   └── Update UserManagement
   └── Update GrowthProgramsCard
   └── Update AdminSidebar

5. Remove founders components
   └── Delete src/components/admin/founders/ directory
```

---

## Result After Changes

**Single Product Model:**
- PRO Personalization: $1.99/month
- No founders program
- No event posting subscriptions
- Simplified subscription detection
- Cleaner admin interface

---

## Technical Details

```text
Edge functions to delete (invoke delete tool):
├── create-founders-checkout
├── record-founders-redemption
├── manage-founders-promo
├── create-event-checkout
├── cancel-event-subscriptions
└── create-city-promo-code

Files to delete:
├── src/hooks/useFoundersOffer.ts
├── src/hooks/useFoundersManagement.ts
├── src/pages/admin/FoundersManagement.tsx
├── src/components/admin/founders/FoundersHeroStats.tsx
├── src/components/admin/founders/FoundersCitiesTable.tsx
├── src/components/admin/founders/FoundersRedemptionsTable.tsx
└── src/components/admin/founders/PromoCodeStatusBadge.tsx

Files to modify:
├── src/lib/founders-pricing.ts
├── supabase/functions/check-subscription/index.ts
├── src/hooks/useSubscription.ts
├── src/hooks/useCities.ts
├── src/pages/admin/AdminDashboard.tsx
├── src/pages/admin/UserManagement.tsx
├── src/components/admin/dashboard/GrowthProgramsCard.tsx
├── src/components/admin/AdminSidebar.tsx
└── src/App.tsx (remove FoundersManagement route)
```
