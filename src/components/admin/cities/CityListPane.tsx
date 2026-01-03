import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, CheckCircle2, Pause } from 'lucide-react';
import type { CityWithProgress } from '@/hooks/useCities';

interface CityListPaneProps {
  cities: CityWithProgress[];
  selectedId: string | null;
  onSelect: (city: CityWithProgress) => void;
  isLoading?: boolean;
}

export function CityListPane({ cities, selectedId, onSelect, isLoading }: CityListPaneProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading cities...
      </div>
    );
  }

  if (cities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
        <p>No cities found</p>
        <p className="text-sm">Create your first city to get started</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y divide-border">
        {cities.map((city) => (
          <div
            key={city.id}
            onClick={() => onSelect(city)}
            className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
              selectedId === city.id ? 'bg-muted' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{city.name}</span>
                {city.state && (
                  <span className="text-sm text-muted-foreground">{city.state}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {city.is_ready_to_launch && city.status === 'draft' && (
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                )}
                <StatusIcon status={city.status} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Progress 
                value={city.completion_percentage} 
                className="h-1.5 flex-1"
              />
              <span className="text-xs text-muted-foreground w-12 text-right">
                {city.approved_place_count}/{city.target_place_count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'launched':
      return <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />;
    case 'paused':
      return <Pause className="h-3.5 w-3.5 text-amber-600" />;
    default:
      return <Badge variant="outline" className="text-xs px-1.5 py-0">Draft</Badge>;
  }
}
