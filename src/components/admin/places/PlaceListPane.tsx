import { useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Sparkles, ChevronDown, ChevronRight, MapPin } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Place } from '@/hooks/usePlaces';
import SourceBadge from '../SourceBadge';
import { hasVibeData } from '@/lib/place-taxonomy';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface PlaceListPaneProps {
  places: Place[];
  selectedPlaceId: string | null;
  onSelectPlace: (id: string) => void;
  onCityFilter?: (city: string) => void;
  isLoading?: boolean;
  groupBy?: 'city';
}

const statusColors: Record<Place['status'], string> = {
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

interface CityGroup {
  city: string;
  state: string | null;
  places: Place[];
  pendingCount: number;
}

const PlaceListPane = ({ 
  places, 
  selectedPlaceId, 
  onSelectPlace,
  onCityFilter,
  isLoading,
  groupBy,
}: PlaceListPaneProps) => {
  const sortedPlaces = useMemo(() => {
    return [...places].sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [places]);

  // Group places by city when groupBy is 'city'
  const cityGroups = useMemo(() => {
    if (groupBy !== 'city') return null;

    const groups = new Map<string, CityGroup>();
    
    for (const place of sortedPlaces) {
      const key = `${place.city || 'Unknown'}|${place.state || ''}`;
      const existing = groups.get(key);
      
      if (existing) {
        existing.places.push(place);
        if (place.status === 'pending') existing.pendingCount++;
      } else {
        groups.set(key, {
          city: place.city || 'Unknown',
          state: place.state,
          places: [place],
          pendingCount: place.status === 'pending' ? 1 : 0,
        });
      }
    }

    // Sort groups: pending count desc, then total count desc
    return Array.from(groups.values()).sort((a, b) => {
      if (b.pendingCount !== a.pendingCount) return b.pendingCount - a.pendingCount;
      return b.places.length - a.places.length;
    });
  }, [sortedPlaces, groupBy]);

  // Track which groups are expanded (default: those with pending items)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    if (!cityGroups) return new Set();
    return new Set(
      cityGroups
        .filter(g => g.pendingCount > 0)
        .map(g => `${g.city}|${g.state || ''}`)
    );
  });

  const toggleGroup = (city: string, state: string | null) => {
    const key = `${city}|${state || ''}`;
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading places...</div>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center text-muted-foreground">
          <p className="font-medium">No places found</p>
          <p className="text-sm mt-1">Add a place to get started</p>
        </div>
      </div>
    );
  }

  // Grouped view
  if (groupBy === 'city' && cityGroups) {
    return (
      <ScrollArea className="h-full">
        <div className="divide-y divide-border">
          {cityGroups.map((group) => {
            const key = `${group.city}|${group.state || ''}`;
            const isExpanded = expandedGroups.has(key);
            
            return (
              <Collapsible
                key={key}
                open={isExpanded}
                onOpenChange={() => toggleGroup(group.city, group.state)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        {group.city}{group.state && `, ${group.state}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {group.pendingCount > 0 && (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs">
                          {group.pendingCount} pending
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {group.places.length} total
                      </span>
                      {onCityFilter && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCityFilter(group.city);
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          Filter
                        </button>
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t">
                    {group.places.map((place) => (
                      <PlaceListItem
                        key={place.id}
                        place={place}
                        isSelected={selectedPlaceId === place.id}
                        onSelect={onSelectPlace}
                        indented
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    );
  }

  // Flat view (default)
  return (
    <ScrollArea className="h-full">
      <div className="divide-y divide-border">
        {sortedPlaces.map((place) => (
          <PlaceListItem
            key={place.id}
            place={place}
            isSelected={selectedPlaceId === place.id}
            onSelect={onSelectPlace}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

// Extracted PlaceListItem for reuse
interface PlaceListItemProps {
  place: Place;
  isSelected: boolean;
  onSelect: (id: string) => void;
  indented?: boolean;
}

const PlaceListItem = ({ place, isSelected, onSelect, indented }: PlaceListItemProps) => {
  return (
    <button
      onClick={() => onSelect(place.id)}
      className={`
        w-full text-left px-4 py-3 transition-colors
        hover:bg-muted/50 focus:outline-none focus:bg-muted/50
        ${isSelected ? 'bg-muted' : ''}
        ${indented ? 'pl-10' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">
            {place.name}
          </h4>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {place.city}{place.state && `, ${place.state}`}
          </p>
        </div>
        <Badge className={`shrink-0 text-xs ${statusColors[place.status]}`}>
          {place.status}
        </Badge>
      </div>
      
      <div className="flex items-center gap-2 mt-2">
        <SourceBadge source={place.source} />
        {hasVibeData(place) && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" title="Vibe tags set">
            <Sparkles className="h-3 w-3" />
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(place.updated_at), { addSuffix: true })}
        </span>
      </div>
    </button>
  );
};

export default PlaceListPane;
