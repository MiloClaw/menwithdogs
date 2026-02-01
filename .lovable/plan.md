
# Plan: Update Codebase with New Stripe PRO Price

## Summary

The PRO Personalization product and price have been created in Stripe. Now we need to update the codebase to use the new price ID.

## Stripe Product Created

| Product | Price | Price ID |
|---------|-------|----------|
| PRO Personalization | $1.99/month | `price_1Sw7MD3mECGw4pQtwaQVhRF8` |

---

## Files to Update

### 1. `src/lib/founders-pricing.ts`

Update the PRO pricing configuration:

| Field | Current Value | New Value |
|-------|---------------|-----------|
| `PRICE_ID` | `price_1SoCRr3Z5TtwrbktT3NwVLwc` | `price_1Sw7MD3mECGw4pQtwaQVhRF8` |
| `MONTHLY_AMOUNT` | 3.99 | 1.99 |
| `DISPLAY` | "$3.99/month" | "$1.99/month" |

---

### 2. `supabase/functions/create-checkout/index.ts`

Update the hardcoded price ID on line 55:

```text
Current: price: "price_1SoCRr3Z5TtwrbktT3NwVLwc"
New:     price: "price_1Sw7MD3mECGw4pQtwaQVhRF8"
```

Also update the comment to reflect correct pricing.

---

### 3. `supabase/functions/check-subscription/index.ts`

Update the price ID constant on line 25:

```text
Current: const PRO_PRICE_ID = "price_1SoCRr3Z5TtwrbktT3NwVLwc"
New:     const PRO_PRICE_ID = "price_1Sw7MD3mECGw4pQtwaQVhRF8"
```

---

## Implementation Steps

1. Update `src/lib/founders-pricing.ts` with new price ID and correct amounts
2. Update `create-checkout` edge function with new price ID
3. Update `check-subscription` edge function with new price ID for detection
4. Deploy edge functions

---

## Technical Details

```text
Files to modify:
├── src/lib/founders-pricing.ts
│   └── PRICING.PRO.PRICE_ID → price_1Sw7MD3mECGw4pQtwaQVhRF8
│   └── PRICING.PRO.MONTHLY_AMOUNT → 1.99
│   └── PRICING.PRO.DISPLAY → "$1.99/month"
│
├── supabase/functions/create-checkout/index.ts
│   └── Line 55: price → price_1Sw7MD3mECGw4pQtwaQVhRF8
│
└── supabase/functions/check-subscription/index.ts
    └── Line 25: PRO_PRICE_ID → price_1Sw7MD3mECGw4pQtwaQVhRF8
```

