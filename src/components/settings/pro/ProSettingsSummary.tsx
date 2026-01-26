import { 
  MapPin, Flag, Users, Sparkles, UsersRound, Heart,
  Target, Zap, Leaf, Sunrise, Moon, Calendar, Ruler, Compass,
  type LucideIcon
} from 'lucide-react';
import { useProSettings } from '@/hooks/useProSettings';
import { useCouple } from '@/hooks/useCouple';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useUserAffinity } from '@/hooks/useUserAffinity';

const DISTANCE_LABELS: Record<string, string> = {
  close: 'nearby places',
  medium: 'within 15 minutes',
  far: 'worth the trip',
};

// Icon mapping for summary bullets
const SUMMARY_ICONS: Record<string, LucideIcon> = {
  location: MapPin,
  lgbtq: Flag,
  family: Users,
  comfort: Sparkles,
  community: UsersRound,
  couples: Heart,
  intent: Target,
  energy: Zap,
  environment: Leaf,
  morning: Sunrise,
  evening: Moon,
  weekend: Calendar,
  distance: Ruler,
  affinity: Compass,
};

interface SummaryBullet {
  iconKey: string;
  text: string;
}

/**
 * Dynamic summary of Pro settings selections.
 * 
 * PRIVACY RULES:
 * - NEVER expose about.* (identity) selections in summary
 * - Only show boost-mode selections (Steps 2-4)
 * - Generated client-side from user's own data
 * - No "people like you" language
 */
export function ProSettingsSummary() {
  const { getBoostSelectedOptions } = useProSettings();
  const { memberProfile } = useCouple();
  const { preferences } = useUserPreferences();
  const { affinities } = useUserAffinity();

  const selectedOptions = getBoostSelectedOptions();

  // Build summary bullets from selected options
  const summaryBullets: SummaryBullet[] = [];

  // Location (from member profile)
  if (memberProfile?.city) {
    summaryBullets.push({
      iconKey: 'location',
      text: `Showing places in ${memberProfile.city}`,
    });
  }

  // Group selected options by section prefix for smarter summaries
  const bySection: Record<string, string[]> = {};
  for (const opt of selectedOptions) {
    const section = opt.section ?? 'other';
    if (!bySection[section]) bySection[section] = [];
    bySection[section].push(opt.label || opt.key);
  }

  // Comfort selections
  if (bySection['seeking.comfort']?.length) {
    for (const label of bySection['seeking.comfort']) {
      if (label.toLowerCase().includes('lgbtq')) {
        summaryBullets.push({ iconKey: 'lgbtq', text: `Highlighting ${label} spaces` });
      } else if (label.toLowerCase().includes('family')) {
        summaryBullets.push({ iconKey: 'family', text: `Surfacing ${label} places` });
      } else {
        summaryBullets.push({ iconKey: 'comfort', text: `Prioritizing ${label.toLowerCase()} spaces` });
      }
    }
  }

  // Community focus
  if (bySection['seeking.community']?.length) {
    const labels = bySection['seeking.community'].join(', ');
    summaryBullets.push({ iconKey: 'community', text: `Highlighting places where ${labels.toLowerCase()} community patterns emerge` });
  }

  // Relationship context
  if (bySection['seeking.relationship_context']?.length) {
    const label = bySection['seeking.relationship_context'][0];
    if (label.toLowerCase().includes('couples')) {
      summaryBullets.push({ iconKey: 'couples', text: 'Surfacing places with strong return patterns from couples' });
    }
  }

  // Intent selections
  if (bySection['intent.goal']?.length) {
    const intents = bySection['intent.goal'].map(l => l.toLowerCase()).join(' and ');
    summaryBullets.push({ iconKey: 'intent', text: `Surfacing places suited for ${intents}` });
  }

  // Style - energy
  if (bySection['style.energy']?.length) {
    const label = bySection['style.energy'][0].toLowerCase();
    summaryBullets.push({ iconKey: 'energy', text: `Preferring ${label} spaces` });
  }

  // Style - environment
  if (bySection['style.environment']?.length) {
    const envs = bySection['style.environment'].map(l => l.toLowerCase()).join(', ');
    summaryBullets.push({ iconKey: 'environment', text: `Looking for ${envs} environments` });
  }

  // Style - timing
  if (bySection['style.timing']?.length) {
    const timing = bySection['style.timing'][0].toLowerCase();
    if (timing.includes('morning')) {
      summaryBullets.push({ iconKey: 'morning', text: 'Prioritizing morning spots' });
    } else if (timing.includes('evening')) {
      summaryBullets.push({ iconKey: 'evening', text: 'Prioritizing evening spots' });
    } else if (timing.includes('weekend')) {
      summaryBullets.push({ iconKey: 'weekend', text: 'Focusing on weekend-friendly places' });
    }
  }

  // Distance preference (from free-tier settings)
  if (preferences?.distance_preference) {
    summaryBullets.push({
      iconKey: 'distance',
      text: `Including ${DISTANCE_LABELS[preferences.distance_preference] || preferences.distance_preference}`,
    });
  }

  // Top category affinity (from behavioral signals)
  if (affinities?.length > 0) {
    const topCategory = affinities[0].place_category.replace(/_/g, ' ').toLowerCase();
    summaryBullets.push({
      iconKey: 'affinity',
      text: `More ${topCategory} based on your saves`,
    });
  }

  if (summaryBullets.length === 0) {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">
          What shapes your places
        </h4>
        <p className="text-sm text-muted-foreground">
          As you select preferences above, we'll adjust what the directory surfaces for you.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">
        What shapes your places
      </h4>
      
      <ul className="space-y-2">
        {summaryBullets.map((bullet, idx) => {
          const Icon = SUMMARY_ICONS[bullet.iconKey] || MapPin;
          return (
            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Icon className="h-4 w-4 flex-shrink-0 mt-0.5 text-muted-foreground/70" />
              <span>{bullet.text}</span>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-muted-foreground/80 pt-1">
        This adjusts as you explore. You're always in control.
      </p>
    </div>
  );
}
