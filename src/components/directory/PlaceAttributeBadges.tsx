import { Link } from 'react-router-dom';
import { Check, Users, Dog, Accessibility, Bath, Trees } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePlaceNicheTags } from '@/hooks/usePlaceNicheTags';

interface PlaceAttributeBadgesProps {
  place: {
    id: string;
    allows_dogs?: boolean | null;
    wheelchair_accessible_entrance?: boolean | null;
    wheelchair_accessible_restroom?: boolean | null;
    wheelchair_accessible_seating?: boolean | null;
    outdoor_seating?: boolean | null;
    has_restroom?: boolean | null;
  };
}

interface GoogleAttribute {
  key: keyof Omit<PlaceAttributeBadgesProps['place'], 'id'>;
  label: string;
  icon: React.ReactNode;
}

const GOOGLE_ATTRIBUTES: GoogleAttribute[] = [
  { key: 'allows_dogs', label: 'Dog Friendly', icon: <Dog className="h-3 w-3" /> },
  { key: 'wheelchair_accessible_entrance', label: 'Wheelchair Accessible', icon: <Accessibility className="h-3 w-3" /> },
  { key: 'outdoor_seating', label: 'Outdoor Seating', icon: <Trees className="h-3 w-3" /> },
  { key: 'has_restroom', label: 'Restroom', icon: <Bath className="h-3 w-3" /> },
];

/**
 * Unified display component for place attributes.
 * Two tiers:
 * 1. "Verified by Google" - solid green badges with checkmark
 * 2. "Community tagged" - outline badges for admin-approved tags
 */
const PlaceAttributeBadges = ({ place }: PlaceAttributeBadgesProps) => {
  const { data: nicheTags } = usePlaceNicheTags(place.id);

  // Collect Google-verified attributes
  const googleBadges = GOOGLE_ATTRIBUTES.filter(attr => place[attr.key] === true);

  // Map niche tags to canonical labels with page info
  const communityBadges = nicheTags?.map(nt => ({
    id: nt.id,
    label: nt.canonical_tags?.label ?? nt.tag,
    slug: nt.canonical_tags?.slug ?? nt.tag,
    hasPage: nt.canonical_tags?.has_page ?? false,
  })) ?? [];

  // Don't render anything if no badges
  if (googleBadges.length === 0 && communityBadges.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Tier 1: Verified by Google */}
      {googleBadges.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Check className="h-3 w-3 text-emerald-600" />
            Verified by Google
          </p>
          <div className="flex flex-wrap gap-1.5">
            {googleBadges.map(attr => (
              <Badge
                key={attr.key}
                className="bg-accent text-accent-foreground hover:bg-accent border-0"
              >
                {attr.icon}
                <span className="ml-1">{attr.label}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Tier 2: Community Tagged */}
      {communityBadges.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            Community tagged
          </p>
          <div className="flex flex-wrap gap-1.5">
            {communityBadges.map(badge => (
              badge.hasPage ? (
                <Link key={badge.id} to={`/tags/${badge.slug}`}>
                  <Badge
                    variant="outline"
                    className="text-xs cursor-pointer hover:bg-accent transition-colors"
                  >
                    {badge.label}
                  </Badge>
                </Link>
              ) : (
                <Badge
                  key={badge.id}
                  variant="outline"
                  className="text-xs"
                >
                  {badge.label}
                </Badge>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceAttributeBadges;
