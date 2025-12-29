import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getPlaceTypeLabel } from '@/lib/google-places-types';
import type { GoogleMapping } from '@/hooks/useAdminInterests';

interface MappingPreviewProps {
  mappings: GoogleMapping[];
}

/**
 * Read-only preview of Google Places mappings
 * Shows a compact summary of the configured mappings
 */
export function MappingPreview({ mappings }: MappingPreviewProps) {
  if (mappings.length === 0) {
    return (
      <span className="text-muted-foreground text-sm italic">
        No mappings
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {mappings.slice(0, 3).map((mapping, index) => (
        <Badge 
          key={index} 
          variant="secondary" 
          className="text-xs font-normal gap-1"
        >
          <MapPin className="h-3 w-3" />
          {getPlaceTypeLabel(mapping.type)}
          {mapping.weight < 1 && (
            <span className="opacity-60">({mapping.weight})</span>
          )}
        </Badge>
      ))}
      {mappings.length > 3 && (
        <Badge variant="outline" className="text-xs font-normal">
          +{mappings.length - 3} more
        </Badge>
      )}
    </div>
  );
}

/**
 * Compact count badge for table display
 */
export function MappingCountBadge({ count }: { count: number }) {
  if (count === 0) {
    return (
      <Badge variant="outline" className="text-xs text-muted-foreground">
        <MapPin className="h-3 w-3 mr-1" />
        None
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="text-xs">
      <MapPin className="h-3 w-3 mr-1" />
      {count} {count === 1 ? 'mapping' : 'mappings'}
    </Badge>
  );
}

export default MappingPreview;
