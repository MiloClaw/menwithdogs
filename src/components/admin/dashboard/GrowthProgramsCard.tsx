import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Ticket, UserCheck, Clock, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AmbassadorStats } from '@/hooks/useAdminStats';

interface GrowthProgramsCardProps {
  ambassadorStats: AmbassadorStats;
  isLoading: boolean;
}

const GrowthProgramsCard = ({ ambassadorStats, isLoading }: GrowthProgramsCardProps) => {
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
          Ambassador Program
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
};

export default GrowthProgramsCard;
