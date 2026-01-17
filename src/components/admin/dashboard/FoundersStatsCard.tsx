import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, MapPin, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FoundersStats } from '@/hooks/useAdminStats';

interface FoundersStatsCardProps {
  stats: FoundersStats;
  isLoading: boolean;
}

const FoundersStatsCard = ({ stats, isLoading }: FoundersStatsCardProps) => {
  const claimPercentage = stats.totalSlotsAvailable > 0 
    ? (stats.totalSlotsClaimed / stats.totalSlotsAvailable) * 100 
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
          <Skeleton className="h-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Ticket className="h-4 w-4 text-primary" />
            Founders Program
          </CardTitle>
          <Link 
            to="/admin/cities" 
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View All →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key metrics row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold">
              <Users className="h-4 w-4 text-muted-foreground" />
              {stats.totalRedemptions}
            </div>
            <p className="text-xs text-muted-foreground">Total Founders</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {stats.activeCities}
            </div>
            <p className="text-xs text-muted-foreground">Active Cities</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {stats.totalSlotsClaimed}
              <span className="text-sm font-normal text-muted-foreground">/{stats.totalSlotsAvailable}</span>
            </div>
            <p className="text-xs text-muted-foreground">Slots Claimed</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Overall Slot Usage</span>
            <span>{claimPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={claimPercentage} className="h-2" />
        </div>

        {/* Top cities */}
        {stats.topCities.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Top Cities</p>
            <div className="space-y-1.5">
              {stats.topCities.slice(0, 3).map((city) => (
                <div key={city.cityId} className="flex items-center justify-between text-sm">
                  <span className="truncate">{city.cityName}</span>
                  <Badge variant="secondary" className="text-xs">
                    {city.slotsUsed}/{city.slotsTotal}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.activeCities === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            No cities with founders program yet
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default FoundersStatsCard;
