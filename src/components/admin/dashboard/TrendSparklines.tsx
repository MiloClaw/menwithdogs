import { Users, Heart, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TrendData {
  label: string;
  data: number[];
  total: number;
  icon: React.ElementType;
  color: string;
}

interface TrendSparklinesProps {
  trends: {
    signups: number[];
    favorites: number[];
    places: number[];
  };
  isLoading?: boolean;
}

const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => {
  if (data.length === 0) return null;
  
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  
  const height = 24;
  const width = 80;
  const padding = 2;
  
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

const TrendSparklines = ({ trends, isLoading }: TrendSparklinesProps) => {
  const trendData: TrendData[] = [
    {
      label: 'New Signups',
      data: trends.signups,
      total: trends.signups.reduce((a, b) => a + b, 0),
      icon: Users,
      color: 'hsl(var(--primary))',
    },
    {
      label: 'Saves',
      data: trends.favorites,
      total: trends.favorites.reduce((a, b) => a + b, 0),
      icon: Heart,
      color: 'hsl(var(--chart-2))',
    },
    {
      label: 'Places Added',
      data: trends.places,
      total: trends.places.reduce((a, b) => a + b, 0),
      icon: MapPin,
      color: 'hsl(var(--chart-3))',
    },
  ];

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">7-Day Trends</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded" />
              <div className="flex-1">
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const hasAnyData = trendData.some(t => t.data.some(v => v > 0));

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>7-Day Trends</span>
          <span className="text-xs font-normal text-muted-foreground">Last 7 days</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trendData.map((trend) => {
          const hasData = trend.data.some(v => v > 0);
          
          return (
            <div key={trend.label} className="flex items-center gap-3">
              <div 
                className="p-1.5 rounded-md shrink-0"
                style={{ backgroundColor: `${trend.color}20` }}
              >
                <trend.icon 
                  className="h-4 w-4" 
                  style={{ color: trend.color }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">
                    {trend.label}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {trend.total}
                  </span>
                </div>
                
                {hasData ? (
                  <MiniSparkline data={trend.data} color={trend.color} />
                ) : (
                  <div className="h-6 flex items-center">
                    <span className="text-xs text-muted-foreground">No activity</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {!hasAnyData && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Trends will appear as activity occurs
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TrendSparklines;
