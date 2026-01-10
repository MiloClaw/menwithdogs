import { Link } from 'react-router-dom';
import { MapPin, TrendingUp, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CityStats } from '@/hooks/useAdminStats';

interface LocationSummaryCardProps {
  placesByCity: CityStats[];
  isLoading?: boolean;
  maxItems?: number;
}

const LocationSummaryCard = ({ 
  placesByCity, 
  isLoading,
  maxItems = 5 
}: LocationSummaryCardProps) => {
  // Filter to cities with user submissions and take top N
  const topCities = placesByCity
    .filter(c => c.userSubmittedCount > 0 || c.pendingCount > 0)
    .slice(0, maxItems);

  // Find max for bar scaling
  const maxCount = Math.max(...topCities.map(c => c.userSubmittedCount + c.pendingCount), 1);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Submissions by Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (topCities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Submissions by Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No user submissions yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Submissions by Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {topCities.map((cityData) => {
          const total = cityData.userSubmittedCount + cityData.pendingCount;
          const barWidth = (total / maxCount) * 100;
          
          return (
            <Link
              key={`${cityData.city}-${cityData.state}`}
              to={`/admin/directory/places?city=${encodeURIComponent(cityData.city)}`}
              className="group block"
            >
              <div className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {cityData.city}{cityData.state && `, ${cityData.state}`}
                    </span>
                    {!cityData.inLaunchedCity && cityData.userSubmittedCount > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="bg-primary/10 text-primary text-xs shrink-0"
                      >
                        NEW
                      </Badge>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="mt-1.5 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        !cityData.inLaunchedCity 
                          ? 'bg-primary' 
                          : 'bg-muted-foreground/40'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-medium tabular-nums">
                    {cityData.userSubmittedCount}
                  </span>
                  {cityData.pendingCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs"
                    >
                      {cityData.pendingCount} pending
                    </Badge>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default LocationSummaryCard;
