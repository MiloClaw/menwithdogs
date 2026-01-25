/**
 * Subscription Pricing Configuration
 * 
 * Central source of truth for all subscription tiers.
 * Referenced by hooks, components, and edge functions.
 */

export const PRICING = {
  // Regular Pro pricing
  PRO: {
    PRICE_ID: "price_1SoCRr3Z5TtwrbktT3NwVLwc",
    MONTHLY_AMOUNT: 3.99,
    DISPLAY: "$3.99/month",
  },
  
  // Event Posting pricing (per-event subscription)
  EVENT: {
    PRICE_ID: "price_EVENT_PLACEHOLDER", // Update with actual Stripe price ID
    MONTHLY_AMOUNT: 7.99,
    DISPLAY: "$7.99/month",
    BILLING_CYCLE_DAYS: 30,
  },
  
  // Founders pricing (locked in forever)
  FOUNDERS: {
    PRICE_ID: "price_1SqamZ3Z5TtwrbktuLF44MKO",
    MONTHLY_AMOUNT: 2.99,
    DISPLAY: "$2.99/month",
    FREE_MONTHS: 3,
    SLOTS_PER_CITY: 100,
  },
  
  // Master coupon for 3 months free
  COUPON: {
    ID: "Sg7md4vM",
    DESCRIPTION: "3 months free",
  },
} as const;

/**
 * Subscription type enum matching database constraint
 */
export type SubscriptionType = 'pro' | 'event';

/**
 * Check if a Stripe price ID is the founders price
 */
export function isFoundersPrice(priceId: string): boolean {
  return priceId === PRICING.FOUNDERS.PRICE_ID;
}

/**
 * Check if a Stripe price ID is an event posting price
 */
export function isEventPrice(priceId: string): boolean {
  return priceId === PRICING.EVENT.PRICE_ID;
}

/**
 * Check if a Stripe price ID is a PRO price
 */
export function isProPrice(priceId: string): boolean {
  return priceId === PRICING.PRO.PRICE_ID;
}

/**
 * Check if a Stripe product ID matches founders
 */
export function isFoundersProduct(productId: string): boolean {
  // The product ID from Stripe that contains the founders price
  return productId === "prod_SqamQ5G3hGLuzC";
}

/**
 * Calculate savings for founders vs regular pricing
 */
export function calculateFoundersSavings(): { 
  monthlyDifference: number; 
  yearlySavings: number;
  percentOff: number;
} {
  const monthlyDifference = PRICING.PRO.MONTHLY_AMOUNT - PRICING.FOUNDERS.MONTHLY_AMOUNT;
  const yearlySavings = monthlyDifference * 12;
  const percentOff = Math.round((monthlyDifference / PRICING.PRO.MONTHLY_AMOUNT) * 100);
  
  return { monthlyDifference, yearlySavings, percentOff };
}
