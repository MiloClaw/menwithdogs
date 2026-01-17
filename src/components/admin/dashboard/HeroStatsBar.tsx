import { Users, MapPin, Heart, Building2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface HeroStat {
  label: string;
  value: number | string;
  subtext: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  alert?: boolean;
  alertColor?: string;
}

interface HeroStatsBarProps {
  stats: {
    activeUsers: number;
    totalUsers: number;
    directorySize: number;
    avgPerCity: number;
    engagementRate: number;
    citiesLaunched: number;
    citiesTotal: number;
    contentQueue: number;
  };
  trends?: {
    usersTrend: number;
    placesTrend: number;
    engagementTrend: number;
  };
  isLoading?: boolean;
}

const HeroStatsBar = ({ stats, trends, isLoading }: HeroStatsBarProps) => {
  const heroStats: HeroStat[] = [
    {
      label: 'Active Users',
      value: stats.activeUsers,
      subtext: `of ${stats.totalUsers} total`,
      icon: Users,
      trend: trends?.usersTrend !== undefined ? {
        value: trends.usersTrend,
        isPositive: trends.usersTrend >= 0,
      } : undefined,
    },
    {
      label: 'Directory Size',
      value: stats.directorySize,
      subtext: `${stats.avgPerCity.toFixed(1)} per city`,
      icon: MapPin,
      trend: trends?.placesTrend !== undefined ? {
        value: trends.placesTrend,
        isPositive: trends.placesTrend >= 0,
      } : undefined,
    },
    {
      label: 'Saves per User',
      value: stats.engagementRate.toFixed(1),
      subtext: stats.engagementRate < 1 ? 'cold' : stats.engagementRate < 3 ? 'healthy' : 'strong',
      icon: Heart,
      trend: trends?.engagementTrend !== undefined ? {
        value: trends.engagementTrend,
        isPositive: trends.engagementTrend >= 0,
      } : undefined,
      alert: stats.engagementRate < 1,
      alertColor: stats.engagementRate < 1 ? 'text-amber-500' : stats.engagementRate >= 3 ? 'text-green-600 dark:text-green-400' : undefined,
    },
    {
      label: 'City Coverage',
      value: `${stats.citiesLaunched}/${stats.citiesTotal}`,
      subtext: 'launched',
      icon: Building2,
    },
    {
      label: 'Content Queue',
      value: stats.contentQueue,
      subtext: 'pending review',
      icon: AlertCircle,
      alert: stats.contentQueue > 0,
      alertColor: stats.contentQueue > 5 ? 'text-destructive' : 'text-amber-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="bg-card/50">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
      {heroStats.map((stat) => (
        <Card 
          key={stat.label} 
          className={cn(
            "bg-card/50 border transition-colors",
            stat.alert && "border-amber-500/50 bg-amber-500/5"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {stat.label}
              </span>
              <stat.icon className={cn(
                "h-4 w-4",
                stat.alert ? stat.alertColor : "text-muted-foreground"
              )} />
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-2xl font-bold tabular-nums",
                stat.alert && stat.alertColor
              )}>
                {stat.value}
              </span>
              
              {stat.trend && stat.trend.value !== 0 && (
                <span className={cn(
                  "text-xs font-medium flex items-center gap-0.5",
                  stat.trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {stat.trend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.trend.isPositive ? '+' : ''}{stat.trend.value}
                </span>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mt-0.5">
              {stat.subtext}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HeroStatsBar;
