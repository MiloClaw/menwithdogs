import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, TrendingUp, ChevronRight, ChevronDown, Building2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Toggle } from '@/components/ui/toggle';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CityStats, MetroStats, UnmappedStats } from '@/hooks/useAdminStats';

interface LocationSummaryCardProps {
  placesByCity: CityStats[];
  placesByMetro: MetroStats[];
  unmappedStats?: UnmappedStats;
  isLoading?: boolean;
  maxItems?: number;
}

type ViewMode = 'city' | 'metro';

const LocationSummaryCard = ({ 
  placesByCity, 
  placesByMetro,
  unmappedStats,
  isLoading,
  maxItems = 5 
}: LocationSummaryCardProps) => {
  // Default to city view for full visibility
  const [viewMode, setViewMode] = useState<ViewMode>('city');
  const [expandedMetros, setExpandedMetros] = useState<Set<string>>(new Set());

  // Filter to cities with user submissions and take top N
  const topCities = placesByCity
    .filter(c => c.userSubmittedCount > 0 || c.pendingCount > 0)
    .slice(0, maxItems);

  // Calculate totals for coverage indicator
  const totalUserSubmissions = placesByCity.reduce((sum, c) => sum + c.userSubmittedCount, 0);
  const metroUserSubmissions = placesByMetro.reduce((sum, m) => sum + m.userSubmittedCount, 0);
  const coveragePercent = totalUserSubmissions > 0 
    ? Math.round((metroUserSubmissions / totalUserSubmissions) * 100) 
    : 0;

  // Find max for bar scaling
  const maxCityCount = Math.max(...topCities.map(c => c.userSubmittedCount + c.pendingCount), 1);
  const maxMetroCount = Math.max(...placesByMetro.map(m => m.userSubmittedCount + m.pendingCount), 1);

  const toggleMetro = (metroId: string) => {
    setExpandedMetros(prev => {
      const next = new Set(prev);
      if (next.has(metroId)) {
        next.delete(metroId);
      } else {
        next.add(metroId);
      }
      return next;
    });
  };

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

  const hasData = topCities.length > 0 || placesByMetro.length > 0;

  if (!hasData) {
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Submissions by Location
          </CardTitle>
          
          {/* View mode toggle */}
          <div className="flex items-center border rounded-md">
            <Toggle
              size="sm"
              pressed={viewMode === 'metro'}
              onPressedChange={() => setViewMode('metro')}
              className="rounded-r-none text-xs px-2 data-[state=on]:bg-muted"
            >
              <Building2 className="h-3 w-3 mr-1" />
              Metro
            </Toggle>
            <Toggle
              size="sm"
              pressed={viewMode === 'city'}
              onPressedChange={() => setViewMode('city')}
              className="rounded-l-none border-l text-xs px-2 data-[state=on]:bg-muted"
            >
              <MapPin className="h-3 w-3 mr-1" />
              City
            </Toggle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {viewMode === 'metro' ? (
          // Metro view with expandable cities
          <>
            {placesByMetro.slice(0, maxItems).map((metro) => {
              const isExpanded = expandedMetros.has(metro.metroId);
              const total = metro.userSubmittedCount + metro.pendingCount;
              const barWidth = (total / maxMetroCount) * 100;
              
              return (
                <Collapsible
                  key={metro.metroId}
                  open={isExpanded}
                  onOpenChange={() => toggleMetro(metro.metroId)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          )}
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium truncate">
                            {metro.metroName}
                          </span>
                          {metro.hasEmergingCities && (
                            <Badge 
                              variant="secondary" 
                              className="bg-primary/10 text-primary text-xs shrink-0"
                            >
                              NEW
                            </Badge>
                          )}
                        </div>
                        {/* Progress bar */}
                        <div className="mt-1.5 ml-7 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              metro.hasEmergingCities 
                                ? 'bg-primary' 
                                : 'bg-muted-foreground/40'
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-medium tabular-nums">
                          {metro.userSubmittedCount}
                        </span>
                        {metro.pendingCount > 0 && (
                          <Badge 
                            variant="secondary" 
                            className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs"
                          >
                            {metro.pendingCount} pending
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {metro.cities.length} cities
                        </span>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-7 pl-2 border-l space-y-1 mt-1">
                      {metro.cities.map((cityData) => (
                        <CityRow 
                          key={`${cityData.city}-${cityData.state}`}
                          cityData={cityData}
                          maxCount={maxMetroCount}
                          compact
                        />
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
            
            {/* Unmapped submissions summary */}
            {unmappedStats && unmappedStats.userSubmittedCount > 0 && (
              <div className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/20">
                <AlertCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground flex-1">
                  {unmappedStats.userSubmittedCount} in {unmappedStats.cityCount} unmapped cities
                </span>
                <Link 
                  to="/admin/metros"
                  className="text-xs text-primary hover:underline shrink-0"
                >
                  Map metros →
                </Link>
              </div>
            )}
            
            {/* Coverage indicator */}
            <div className="pt-2 border-t mt-2">
              <p className="text-xs text-muted-foreground">
                {coveragePercent}% of submissions in mapped metros ({metroUserSubmissions} of {totalUserSubmissions})
              </p>
            </div>
          </>
        ) : (
          // City view (flat list)
          topCities.map((cityData) => (
            <CityRow 
              key={`${cityData.city}-${cityData.state}`}
              cityData={cityData}
              maxCount={maxCityCount}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};

interface CityRowProps {
  cityData: CityStats;
  maxCount: number;
  compact?: boolean;
}

const CityRow = ({ cityData, maxCount, compact }: CityRowProps) => {
  const total = cityData.userSubmittedCount + cityData.pendingCount;
  const barWidth = (total / maxCount) * 100;
  
  return (
    <Link
      to={`/admin/directory/places?city=${encodeURIComponent(cityData.city)}`}
      className="group block"
    >
      <div className={`flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors ${compact ? 'py-1.5' : ''}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <MapPin className={`text-muted-foreground shrink-0 ${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
            <span className={`font-medium truncate ${compact ? 'text-xs' : 'text-sm'}`}>
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
          {!compact && (
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
          )}
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <span className={`font-medium tabular-nums ${compact ? 'text-xs' : 'text-sm'}`}>
            {cityData.userSubmittedCount}
          </span>
          {cityData.pendingCount > 0 && (
            <Badge 
              variant="secondary" 
              className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs"
            >
              {cityData.pendingCount}
            </Badge>
          )}
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );
};

export default LocationSummaryCard;
