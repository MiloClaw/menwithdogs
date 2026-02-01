/**
 * Subscription Pricing Configuration
 * 
 * Central source of truth for PRO subscription tier.
 * Referenced by hooks, components, and edge functions.
 */

export const PRICING = {
  // Regular Pro pricing
  PRO: {
    PRICE_ID: "price_1Sw7MD3mECGw4pQtwaQVhRF8",
    MONTHLY_AMOUNT: 1.99,
    DISPLAY: "$1.99/month",
  },
} as const;

/**
 * Check if a Stripe price ID is the PRO price
 */
export function isProPrice(priceId: string): boolean {
  return priceId === PRICING.PRO.PRICE_ID;
}
