import { cn } from '@/lib/utils';

// Category display config
const CATEGORY_CONFIG: Record<string, { icon: string; label: string }> = {
  restaurant: { icon: '🍽️', label: 'Restaurants' },
  cafe: { icon: '☕', label: 'Coffee & Cafes' },
  bar: { icon: '🍷', label: 'Bars & Lounges' },
  park: { icon: '🌳', label: 'Parks & Outdoors' },
  gym: { icon: '💪', label: 'Fitness' },
  museum: { icon: '🎨', label: 'Culture' },
  shopping: { icon: '🛍️', label: 'Shopping' },
  entertainment: { icon: '✨', label: 'Entertainment' },
  spa: { icon: '🧘', label: 'Wellness' },
  bakery: { icon: '🥐', label: 'Bakeries' },
  // Fallback for unknown categories
  default: { icon: '📍', label: 'Places' },
};

interface AffinityBarProps {
  category: string;
  score: number; // 0-1 (internal only - never expose to users)
}

/**
 * Muted visual affinity indicator for taste profile.
 * 
 * PHASE 2 COMPLIANCE:
 * - Reduced visual weight (thinner bar, muted colors)
 * - No numeric scores, percentages, or signal counts shown
 * - Progress bar is subtle, not the focal point
 * - Users never see internal AI metrics
 */
export function AffinityBar({ category, score }: AffinityBarProps) {
  const config = CATEGORY_CONFIG[category.toLowerCase()] || {
    ...CATEGORY_CONFIG.default,
    label: category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' '),
  };
  
  // Internal calculation only - never displayed
  const percentage = Math.round(score * 100);

  return (
    <div className="flex items-center gap-3">
      <span className="text-base w-5 text-center flex-shrink-0 opacity-70">{config.icon}</span>
      <div className="flex-1 min-w-0">
        <span className="text-sm text-muted-foreground truncate block mb-1">
          {config.label}
        </span>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              "bg-muted-foreground/30"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
