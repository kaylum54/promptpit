/**
 * Pricing tier definitions and helper functions for PromptPit
 */

export const PRICING_TIERS = {
  guest: {
    name: 'Guest',
    price: 0,
    debatesPerMonth: 1,
    features: ['1 debate per month', '4 AI models'],
  },
  free: {
    name: 'Free',
    price: 0,
    debatesPerMonth: 6,
    features: ['6 debates per month', '4 AI models', 'Basic history'],
  },
  pro: {
    name: 'Pro',
    price: 11,
    debatesPerMonth: 100,
    features: ['100 debates per month', '4 AI models', 'Full history', 'Priority support'],
  },
} as const;

export type TierName = keyof typeof PRICING_TIERS;

/**
 * Mapping of tier names to their debate limits
 */
export const TIER_LIMITS: Record<TierName, number> = {
  guest: PRICING_TIERS.guest.debatesPerMonth,
  free: PRICING_TIERS.free.debatesPerMonth,
  pro: PRICING_TIERS.pro.debatesPerMonth,
} as const;

/**
 * Get the debate limit for a given tier
 * @param tier - The pricing tier name
 * @returns The number of debates allowed per month for the tier
 */
export function getDebateLimit(tier: string): number {
  if (tier in TIER_LIMITS) {
    return TIER_LIMITS[tier as TierName];
  }
  // Default to guest tier limit if tier is unknown
  return TIER_LIMITS.guest;
}

/**
 * Check if a user can start a new debate based on their current usage and tier
 * @param debatesThisMonth - The number of debates the user has started this month
 * @param tier - The user's pricing tier
 * @returns True if the user can start a new debate, false otherwise
 */
export function canStartDebate(debatesThisMonth: number, tier: string): boolean {
  const limit = getDebateLimit(tier);
  return debatesThisMonth < limit;
}

/**
 * Get the number of debates remaining for the user this month
 * @param debatesThisMonth - The number of debates the user has started this month
 * @param tier - The user's pricing tier
 * @returns The number of debates remaining (minimum 0)
 */
export function getDebatesRemaining(debatesThisMonth: number, tier: string): number {
  const limit = getDebateLimit(tier);
  return Math.max(0, limit - debatesThisMonth);
}
