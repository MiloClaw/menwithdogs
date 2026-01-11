import { MapPin, Clock, Compass, Ruler } from 'lucide-react';
import { useCouple } from '@/hooks/useCouple';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useUserAffinity } from '@/hooks/useUserAffinity';

const TIME_LABELS: Record<string, string> = {
  mornings: 'morning spots',
  evenings: 'evening spots',
  weekends: 'weekend places',
  mixed: 'all times',
};

const DISTANCE_LABELS: Record<string, string> = {
  close: 'nearby places',
  medium: 'within 15 minutes',
  far: 'worth the trip',
};

export function PersonalizationSummary() {
  const { memberProfile } = useCouple();
  const { preferences } = useUserPreferences();
  const { affinities } = useUserAffinity();

  // Build personalization bullets
  const bullets: { icon: React.ReactNode; text: string }[] = [];

  // Location
  if (memberProfile?.city) {
    bullets.push({
      icon: <MapPin className="h-3.5 w-3.5" />,
      text: `Showing places in ${memberProfile.city}${memberProfile.state ? `, ${memberProfile.state}` : ''}`,
    });
  }

  // Time preference
  if (preferences?.time_preference) {
    bullets.push({
      icon: <Clock className="h-3.5 w-3.5" />,
      text: `Prioritizing ${TIME_LABELS[preferences.time_preference] || preferences.time_preference}`,
    });
  }

  // Distance preference
  if (preferences?.distance_preference) {
    bullets.push({
      icon: <Ruler className="h-3.5 w-3.5" />,
      text: `Including places ${DISTANCE_LABELS[preferences.distance_preference] || preferences.distance_preference}`,
    });
  }

  // Top category from affinities
  if (affinities.length > 0) {
    const topCategory = affinities[0].place_category
      .replace(/_/g, ' ')
      .toLowerCase();
    bullets.push({
      icon: <Compass className="h-3.5 w-3.5" />,
      text: `More ${topCategory} based on your saves`,
    });
  }

  if (bullets.length === 0) {
    return null; // Don't show if nothing to summarize
  }

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        What you'll see
      </h3>
      <div className="space-y-2 py-1">
        {bullets.map((bullet, i) => (
          <div 
            key={i} 
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <span className="opacity-70">{bullet.icon}</span>
            <span>{bullet.text}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground/70">
        This adjusts as you explore.
      </p>
    </section>
  );
}
