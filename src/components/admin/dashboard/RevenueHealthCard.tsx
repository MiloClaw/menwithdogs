import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Users, TrendingUp, Crown, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { PRICING } from '@/lib/founders-pricing';

interface RevenueMetrics {
  mrr: number;
  totalSubscribers: number;
  foundersCount: number;
  proCount: number;
  eventCount: number;
  conversionRate: number;
  totalUsers: number;
}

export default function RevenueHealthCard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['admin-revenue-metrics'],
    queryFn: async (): Promise<RevenueMetrics> => {
      // Get active subscriptions
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('plan_id, status, type')
        .in('status', ['active', 'trialing']);
      
      // Get total couples for conversion rate
      const { count: totalCouples } = await supabase
        .from('couples')
        .select('*', { count: 'exact', head: true });
      
      const activeSubscriptions = subscriptions || [];
      
      // Count by plan type
      const foundersCount = activeSubscriptions.filter(s => 
        s.plan_id === 'founders' || s.plan_id?.includes('founders')
      ).length;
      
      const proCount = activeSubscriptions.filter(s => 
        (s.plan_id === 'pro_monthly' || s.plan_id === 'pro') && 
        s.type === 'pro'
      ).length;
      
      const eventCount = activeSubscriptions.filter(s => 
        s.type === 'event'
      ).length;
      
      const totalSubscribers = foundersCount + proCount;
      
      // Calculate MRR using pricing config
      const mrr = (foundersCount * PRICING.FOUNDERS.MONTHLY_AMOUNT) + 
                  (proCount * PRICING.PRO.MONTHLY_AMOUNT) +
                  (eventCount * PRICING.EVENT.MONTHLY_AMOUNT);
      
      // Conversion rate
      const totalUsers = totalCouples || 0;
      const conversionRate = totalUsers > 0 
        ? (totalSubscribers / totalUsers) * 100 
        : 0;
      
      return {
        mrr,
        totalSubscribers,
        foundersCount,
        proCount,
        eventCount,
        conversionRate,
        totalUsers,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          Revenue Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : metrics ? (
          <>
            {/* MRR */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tabular-nums">
                  {formatCurrency(metrics.mrr)}
                </span>
                <span className="text-sm text-muted-foreground">MRR</span>
              </div>
              {metrics.mrr === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Launch revenue with your first subscriber
                </p>
              )}
            </div>
            
            {/* Subscriber breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  PRO Subscribers
                </span>
                <span className="font-medium">{metrics.totalSubscribers}</span>
              </div>
              
              {metrics.totalSubscribers > 0 && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    <Crown className="h-3 w-3" />
                    <span>Founders: {metrics.foundersCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-primary/10 text-primary">
                    <TrendingUp className="h-3 w-3" />
                    <span>Pro: {metrics.proCount}</span>
                  </div>
                </div>
              )}
              
              {/* Event subscriptions */}
              {metrics.eventCount > 0 && (
                <div className="flex items-center justify-between text-sm pt-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Event Postings
                  </span>
                  <span className="font-medium">{metrics.eventCount}</span>
                </div>
              )}
            </div>
            
            {/* Conversion rate */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Conversion Rate</span>
                <span className="font-medium">{metrics.conversionRate.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(metrics.conversionRate, 100)} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                {metrics.totalSubscribers} of {metrics.totalUsers} users
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No data available</p>
        )}
      </CardContent>
    </Card>
  );
}
