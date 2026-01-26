import { 
  MapPin, TreePine, Mountain, Tent, Waves, Footprints,
  UtensilsCrossed, Coffee, Wine, Dumbbell, Palette,
  ShoppingBag, Sparkles, Leaf, Croissant, TreeDeciduous,
  type LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Category display config with Lucide icons
const CATEGORY_CONFIG: Record<string, { Icon: LucideIcon; label: string }> = {
  // Outdoor categories (brand priority)
  trail: { Icon: Mountain, label: 'Trails' },
  campground: { Icon: Tent, label: 'Campgrounds' },
  natural_feature: { Icon: TreeDeciduous, label: 'Natural Features' },
  hiking_area: { Icon: Footprints, label: 'Hiking Areas' },
  swimming_hole: { Icon: Waves, label: 'Swimming Holes' },
  park: { Icon: TreePine, label: 'Parks & Outdoors' },
  
  // Urban categories
  restaurant: { Icon: UtensilsCrossed, label: 'Restaurants' },
  cafe: { Icon: Coffee, label: 'Coffee & Cafes' },
  bar: { Icon: Wine, label: 'Bars & Lounges' },
  gym: { Icon: Dumbbell, label: 'Fitness' },
  museum: { Icon: Palette, label: 'Culture' },
  shopping: { Icon: ShoppingBag, label: 'Shopping' },
  entertainment: { Icon: Sparkles, label: 'Entertainment' },
  spa: { Icon: Leaf, label: 'Wellness' },
  bakery: { Icon: Croissant, label: 'Bakeries' },
  
  // Fallback for unknown categories
  default: { Icon: MapPin, label: 'Places' },
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
  
  const IconComponent = config.Icon;
  
  // DRIFT-LOCK: Visual range capped to 30-90% to prevent score inference
  // Users should not be able to deduce relative affinity weights from bar widths
  const clampedPercentage = Math.max(30, Math.min(90, Math.round(score * 100)));

  return (
    <div className="flex items-center gap-3">
      <IconComponent className="h-4 w-4 text-muted-foreground/70 flex-shrink-0" />
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
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
