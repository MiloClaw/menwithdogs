import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminStats } from '@/hooks/useAdminStats';
import HeroStatsBar from '@/components/admin/dashboard/HeroStatsBar';
import ActionQueue, { buildActionQueue } from '@/components/admin/dashboard/ActionQueue';
import TrendSparklines from '@/components/admin/dashboard/TrendSparklines';
import LocationSummaryCard from '@/components/admin/LocationSummaryCard';
import GrowthProgramsCard from '@/components/admin/dashboard/GrowthProgramsCard';

const AdminDashboard = () => {
  const { data: stats, isLoading } = useAdminStats();

  // Build hero stats
  const heroStats = {
    activeUsers: stats?.couples.active ?? 0,
    totalUsers: stats?.couples.total ?? 0,
    directorySize: stats?.places.approved ?? 0,
    avgPerCity: stats?.cities.launched ? (stats?.places.approved ?? 0) / stats.cities.launched : 0,
    engagementRate: stats?.engagement.avgFavoritesPerUser ?? 0,
    citiesLaunched: stats?.cities.launched ?? 0,
    citiesTotal: (stats?.cities.launched ?? 0) + (stats?.cities.draft ?? 0),
    contentQueue: (stats?.places.pending ?? 0) + (stats?.events.pending ?? 0),
    metrosActive: stats?.metros.total ?? 0,
    citiesLinked: stats?.metros.linkedCities ?? 0,
    standaloneCities: stats?.cities.standaloneLaunched ?? 0,
  };

  // Build action queue items
  const actionItems = stats ? buildActionQueue({
    citiesReadyToLaunch: stats.cities.readyToLaunch,
    emergingCities: stats.emergingCitiesCount,
    pendingPlaces: stats.places.pending,
    pendingEvents: stats.events.pending,
    totalCities: stats.cities.total,
    totalEvents: stats.events.approved + stats.events.pending,
    generalCategoryCount: stats.places.generalCount,
    totalApprovedPlaces: stats.places.approved,
  }) : [];

  // Trend data
  const trendData = stats?.trends ?? { signups: [], favorites: [], places: [] };

  // Founders stats with defaults
  const foundersStats = stats?.founders ?? {
    totalRedemptions: 0,
    activeCities: 0,
    totalSlotsClaimed: 0,
    totalSlotsAvailable: 0,
    topCities: [],
  };

  // Ambassador stats with defaults
  const ambassadorStats = stats?.ambassadors ?? {
    totalApplications: 0,
    pendingApplications: 0,
    approvedAmbassadors: 0,
    declinedApplications: 0,
    recentPending: [],
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">ThickTimber command center</p>
        </div>

        {/* Hero Stats Bar - 6 key metrics with freshness indicator */}
        <HeroStatsBar 
          stats={heroStats}
          isLoading={isLoading}
          lastRefreshed={stats?.lastRefreshed}
        />

        {/* Row 2: Action Queue + Trends + Location */}
        <div className="grid gap-6 lg:grid-cols-3">
          <ActionQueue 
            items={actionItems}
            isLoading={isLoading}
          />
          <TrendSparklines 
            trends={trendData}
            isLoading={isLoading}
          />
          <LocationSummaryCard 
            placesByCity={stats?.placesByCity || []}
            placesByMetro={stats?.placesByMetro || []}
            unmappedStats={stats?.unmappedStats}
            isLoading={isLoading}
          />
        </div>

        {/* Row 3: Growth Programs (with revenue) */}
        <GrowthProgramsCard
          foundersStats={foundersStats}
          ambassadorStats={ambassadorStats}
          isLoading={isLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
