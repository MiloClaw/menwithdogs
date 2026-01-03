import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Place } from '@/hooks/usePlaces';
import SourceBadge from '../SourceBadge';

interface PlaceListPaneProps {
  places: Place[];
  selectedPlaceId: string | null;
  onSelectPlace: (id: string) => void;
  isLoading?: boolean;
}

const statusColors: Record<Place['status'], string> = {
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const PlaceListPane = ({ 
  places, 
  selectedPlaceId, 
  onSelectPlace, 
  isLoading 
}: PlaceListPaneProps) => {
  const sortedPlaces = useMemo(() => {
    return [...places].sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [places]);

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

  return (
    <ScrollArea className="h-full">
      <div className="divide-y divide-border">
        {sortedPlaces.map((place) => (
          <button
            key={place.id}
            onClick={() => onSelectPlace(place.id)}
            className={`
              w-full text-left px-4 py-3 transition-colors
              hover:bg-muted/50 focus:outline-none focus:bg-muted/50
              ${selectedPlaceId === place.id ? 'bg-muted' : ''}
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
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(place.updated_at), { addSuffix: true })}
              </span>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};

export default PlaceListPane;
