import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, Building2, Users, DollarSign } from 'lucide-react';
import { FoundersAggregateStats } from '@/hooks/useFoundersManagement';

interface FoundersHeroStatsProps {
  stats: FoundersAggregateStats;
  isLoading: boolean;
}

export function FoundersHeroStats({ stats, isLoading }: FoundersHeroStatsProps) {
  const items = [
    {
      label: 'Total Founders',
      value: stats.totalFounders,
      icon: Crown,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Active Cities',
      value: stats.activeCities,
      icon: Building2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Slots Claimed',
      value: `${stats.totalSlotsClaimed}/${stats.totalSlotsAvailable}`,
      icon: Users,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      subtext: stats.totalSlotsAvailable > 0 
        ? `${Math.round((stats.totalSlotsClaimed / stats.totalSlotsAvailable) * 100)}% filled`
        : undefined,
    },
    {
      label: 'Est. Monthly Revenue',
      value: `$${stats.estimatedMonthlyRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      subtext: 'After free period',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label} className="relative overflow-hidden">
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground truncate">{item.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{item.value}</p>
                  {item.subtext && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.subtext}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
