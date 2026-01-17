import AdminLayout from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, Building2, Users } from 'lucide-react';
import { useFoundersManagement } from '@/hooks/useFoundersManagement';
import { FoundersHeroStats } from '@/components/admin/founders/FoundersHeroStats';
import { FoundersCitiesTable } from '@/components/admin/founders/FoundersCitiesTable';
import { FoundersRedemptionsTable } from '@/components/admin/founders/FoundersRedemptionsTable';

export default function FoundersManagement() {
  const {
    cities,
    redemptions,
    aggregateStats,
    isLoadingCities,
    isLoadingRedemptions,
    pausePromo,
    resumePromo,
    syncRedemptions,
    isPausing,
    isResuming,
    isSyncing,
    refetchCities,
    refetchRedemptions,
  } = useFoundersManagement();

  const handleRefresh = () => {
    refetchCities();
    refetchRedemptions();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Founders Program</h1>
            <p className="text-muted-foreground">
              Manage founding member offers across all cities
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoadingCities || isLoadingRedemptions}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(isLoadingCities || isLoadingRedemptions) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Hero Stats */}
        <FoundersHeroStats
          stats={aggregateStats}
          isLoading={isLoadingCities || isLoadingRedemptions}
        />

        {/* Tabs */}
        <Tabs defaultValue="cities" className="space-y-4">
          <TabsList>
            <TabsTrigger value="cities" className="gap-2">
              <Building2 className="h-4 w-4" />
              Cities with Offers
            </TabsTrigger>
            <TabsTrigger value="redemptions" className="gap-2">
              <Users className="h-4 w-4" />
              Redemption History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cities" className="mt-4">
            <FoundersCitiesTable
              cities={cities}
              isLoading={isLoadingCities}
              onPause={pausePromo}
              onResume={resumePromo}
              onSync={(promoCodeId, cityId) => syncRedemptions({ promoCodeId, cityId })}
              isPausing={isPausing}
              isResuming={isResuming}
              isSyncing={isSyncing}
            />
          </TabsContent>

          <TabsContent value="redemptions" className="mt-4">
            <FoundersRedemptionsTable
              redemptions={redemptions}
              cities={cities}
              isLoading={isLoadingRedemptions}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
