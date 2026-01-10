import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminStats } from '@/hooks/useAdminStats';
import HeroStatsBar from '@/components/admin/dashboard/HeroStatsBar';
import ActionQueue, { buildActionQueue } from '@/components/admin/dashboard/ActionQueue';
import TrendSparklines from '@/components/admin/dashboard/TrendSparklines';
import CategoryHealthCard from '@/components/admin/dashboard/CategoryHealthCard';
import LocationSummaryCard from '@/components/admin/LocationSummaryCard';
import QuickActions from '@/components/admin/dashboard/QuickActions';

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
  };

  // Build action queue items
  const actionItems = stats ? buildActionQueue({
    citiesReadyToLaunch: stats.cities.readyToLaunch,
    emergingCities: stats.emergingCitiesCount,
    pendingPlaces: stats.places.pending,
    pendingEvents: stats.events.pending,
    totalCities: stats.cities.total,
    totalEvents: stats.events.approved + stats.events.pending,
  }) : [];

  // Trend data
  const trendData = stats?.trends ?? { signups: [], favorites: [], places: [] };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">MainStreet IRL command center</p>
        </div>

        {/* Hero Stats Bar - 5 key metrics */}
        <HeroStatsBar 
          stats={heroStats}
          isLoading={isLoading}
        />

        {/* Two-column: Action Queue + Trends */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ActionQueue 
            items={actionItems}
            isLoading={isLoading}
          />
          <TrendSparklines 
            trends={trendData}
            isLoading={isLoading}
          />
        </div>

        {/* Two-column: Category Health + Location Insights */}
        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryHealthCard
            categories={stats?.categoryBreakdown ?? []}
            totalPlaces={stats?.places.approved ?? 0}
            isLoading={isLoading}
          />
          <LocationSummaryCard 
            placesByCity={stats?.placesByCity || []}
            placesByMetro={stats?.placesByMetro || []}
            isLoading={isLoading}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <QuickActions 
            stats={{
              citiesReady: stats?.cities.readyToLaunch ?? 0,
              pendingPlaces: stats?.places.pending ?? 0,
              pendingEvents: stats?.events.pending ?? 0,
            }}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
