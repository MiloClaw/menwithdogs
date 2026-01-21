import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, CheckCircle2, AlertCircle, Pause, MapPin, CircleDashed } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { CityWithProgress } from '@/hooks/useCities';

interface CityCardProps {
  city: CityWithProgress;
  onClick?: () => void;
  isSelected?: boolean;
}

export function CityCard({ city, onClick, isSelected }: CityCardProps) {
  const getStatusBadge = () => {
    switch (city.status) {
      case 'launched':
        return (
          <Badge variant="default" className="bg-green-600 text-white">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Launched
          </Badge>
        );
      case 'paused':
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            <Pause className="h-3 w-3 mr-1" />
            Paused
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Draft
          </Badge>
        );
    }
  };

  const getProgressColor = () => {
    if (city.completion_percentage >= 100) return 'bg-green-500';
    if (city.completion_percentage >= 50) return 'bg-primary';
    return 'bg-amber-500';
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground">{city.name}</h3>
            <p className="text-sm text-muted-foreground">
              {city.state ? `${city.state}, ${city.country}` : city.country}
            </p>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 mt-1">
                    {city.metro_name ? (
                      <>
                        <MapPin className="h-3 w-3 text-primary" />
                        <span className="text-xs text-primary font-medium">{city.metro_name}</span>
                      </>
                    ) : (
                      <>
                        <CircleDashed className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Standalone</span>
                      </>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {city.metro_name ? `Part of ${city.metro_name} metro area` : 'Not linked to any metro area'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            {city.is_ready_to_launch && city.status === 'draft' && (
              <Sparkles className="h-4 w-4 text-amber-500" />
            )}
            {city.pending_place_count > 0 && city.status === 'draft' && (
              <AlertCircle className="h-4 w-4 text-orange-500" />
            )}
            {getStatusBadge()}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{city.completion_percentage}%</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className={`h-full transition-all ${getProgressColor()}`}
              style={{ width: `${city.completion_percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{city.approved_place_count} / {city.target_place_count} approved</span>
            {city.pending_place_count > 0 && (
              <span className="text-orange-600">{city.pending_place_count} pending</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
