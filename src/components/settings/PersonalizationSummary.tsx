import { Lightbulb, MapPin, Clock, Compass, Ruler } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCouple } from '@/hooks/useCouple';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useUserAffinity } from '@/hooks/useUserAffinity';

const TIME_LABELS: Record<string, string> = {
  mornings: 'morning-friendly',
  evenings: 'evening-friendly',
  weekends: 'weekend',
  mixed: 'all times',
};

const DISTANCE_LABELS: Record<string, string> = {
  close: 'nearby',
  medium: 'up to 15 min away',
  far: 'anywhere worth the trip',
};

const VIBE_LABELS: Record<string, string> = {
  quiet: 'quieter',
  balanced: 'balanced',
  lively: 'lively',
  depends: 'varied vibes',
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
      text: `Showing places near ${memberProfile.city}${memberProfile.state ? `, ${memberProfile.state}` : ''}`,
    });
  }

  // Time preference
  if (preferences?.time_preference) {
    bullets.push({
      icon: <Clock className="h-3.5 w-3.5" />,
      text: `Prioritizing ${TIME_LABELS[preferences.time_preference] || preferences.time_preference} spots`,
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
      text: `Highlighting ${topCategory} based on your saves`,
    });
  }

  // Vibe preference
  if (preferences?.vibe_preference && preferences.vibe_preference !== 'depends') {
    bullets.push({
      icon: <Lightbulb className="h-3.5 w-3.5" />,
      text: `Leaning toward ${VIBE_LABELS[preferences.vibe_preference] || preferences.vibe_preference} places`,
    });
  }

  if (bullets.length === 0) {
    return null; // Don't show if nothing to summarize
  }

  return (
    <Card className="bg-muted/50 border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          How we're personalizing for you
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {bullets.map((bullet, i) => (
          <div 
            key={i} 
            className="flex items-center gap-2 text-sm text-foreground"
          >
            <span className="text-muted-foreground">{bullet.icon}</span>
            <span>{bullet.text}</span>
          </div>
        ))}
        <p className="text-xs text-muted-foreground pt-2">
          These adjust automatically as you explore.
        </p>
      </CardContent>
    </Card>
  );
}
