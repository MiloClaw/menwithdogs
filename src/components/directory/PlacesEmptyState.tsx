import { MapPinOff, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlacesEmptyStateProps {
  variant: 'filters' | 'exploration' | 'no-location';
  exploringCity?: string | null;
  onClearFilters?: () => void;
  onClearExploration?: () => void;
  onSetCity?: () => void;
}

/**
 * Empty state component for the Places directory.
 * Three variants:
 * - filters: Active filters returned no results
 * - exploration: Exploring a city with no places
 * - no-location: User hasn't set their city
 * 
 * UX: Each variant has contextual messaging and clear CTAs
 */
export function PlacesEmptyState({
  variant,
  exploringCity,
  onClearFilters,
  onClearExploration,
  onSetCity,
}: PlacesEmptyStateProps) {
  const config = {
    filters: {
      icon: MapPinOff,
      title: 'Nothing matches those filters',
      description: 'Try broadening your search or clearing filters.',
      action: onClearFilters && (
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          Clear all filters
        </Button>
      ),
    },
    exploration: {
      icon: MapPinOff,
      title: `No places in ${exploringCity} yet`,
      description: 'Know a good spot here? Suggest it below.',
      action: onClearExploration && (
        <Button variant="outline" size="sm" onClick={onClearExploration}>
          ← Back to your location
        </Button>
      ),
    },
    'no-location': {
      icon: MapPinOff,
      title: 'Your area is on the way',
      // Priority 2: Refined copy - instructional clarity
      description: 'Set your city to see places people actually go.',
      // Priority 2: Promoted CTA - primary variant, larger size
      action: onSetCity && (
        <Button 
          variant="default" 
          size="default" 
          onClick={onSetCity}
          className="gap-2"
        >
          <MapPin className="h-4 w-4" />
          Set your city
        </Button>
      ),
    },
  };

  const { icon: Icon, title, description, action } = config[variant];

  return (
    <div className="text-center py-20 space-y-5">
      <Icon className="h-10 w-10 mx-auto text-muted-foreground/40" />
      <div className="space-y-2">
        <p className="font-serif text-lg">{title}</p>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {description}
        </p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export default PlacesEmptyState;
