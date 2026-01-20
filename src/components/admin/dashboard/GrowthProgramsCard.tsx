import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MapPin, Ticket, UserCheck, Clock, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FoundersStats, AmbassadorStats } from '@/hooks/useAdminStats';

interface GrowthProgramsCardProps {
  foundersStats: FoundersStats;
  ambassadorStats: AmbassadorStats;
  isLoading: boolean;
}

const GrowthProgramsCard = ({ foundersStats, ambassadorStats, isLoading }: GrowthProgramsCardProps) => {
  const claimPercentage = foundersStats.totalSlotsAvailable > 0 
    ? (foundersStats.totalSlotsClaimed / foundersStats.totalSlotsAvailable) * 100 
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
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
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Ticket className="h-4 w-4 text-primary" />
          Growth Programs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="founders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="founders">Founders</TabsTrigger>
            <TabsTrigger value="ambassadors" className="relative">
              Ambassadors
              {ambassadorStats.pendingApplications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-1.5 h-5 min-w-5 px-1 text-xs"
                >
                  {ambassadorStats.pendingApplications}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Founders Tab */}
          <TabsContent value="founders" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Link 
                to="/admin/founders" 
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View All →
              </Link>
            </div>

            {/* Key metrics row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {foundersStats.totalRedemptions}
                </div>
                <p className="text-xs text-muted-foreground">Total Founders</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {foundersStats.activeCities}
                </div>
                <p className="text-xs text-muted-foreground">Active Cities</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {foundersStats.totalSlotsClaimed}
                  <span className="text-sm font-normal text-muted-foreground">/{foundersStats.totalSlotsAvailable}</span>
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
            {foundersStats.topCities.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Top Cities</p>
                <div className="space-y-1.5">
                  {foundersStats.topCities.slice(0, 3).map((city) => (
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

            {foundersStats.activeCities === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                No cities with founders program yet
              </p>
            )}
          </TabsContent>

          {/* Ambassadors Tab */}
          <TabsContent value="ambassadors" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Link 
                to="/admin/users" 
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View All →
              </Link>
            </div>

            {/* Key metrics row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                  <UserCheck className="h-4 w-4" />
                  {ambassadorStats.approvedAmbassadors}
                </div>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-accent">
                  <Clock className="h-4 w-4" />
                  {ambassadorStats.pendingApplications}
                </div>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-muted-foreground">
                  <XCircle className="h-4 w-4" />
                  {ambassadorStats.declinedApplications}
                </div>
                <p className="text-xs text-muted-foreground">Declined</p>
              </div>
            </div>

            {/* Pending applications */}
            {ambassadorStats.recentPending.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Pending Review</p>
                  <Badge variant="outline" className="text-xs text-accent border-accent">
                    Action Needed
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  {ambassadorStats.recentPending.map((app) => (
                    <div key={app.id} className="flex items-center justify-between text-sm">
                      <span className="truncate max-w-[140px]">
                        {app.name || app.email.split('@')[0]}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                        {app.cityName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ambassadorStats.totalApplications === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                No ambassador applications yet
              </p>
            )}

            {ambassadorStats.totalApplications > 0 && ambassadorStats.pendingApplications === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                All applications reviewed ✓
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GrowthProgramsCard;
