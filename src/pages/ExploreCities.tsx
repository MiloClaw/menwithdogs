import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PageLayout from '@/components/PageLayout';
import { useLaunchedCities, LaunchedCity } from '@/hooks/useLaunchedCities';

const ExploreCities = () => {
  const navigate = useNavigate();
  const { data: cities, isLoading, error } = useLaunchedCities();

  const handleSelectCity = (city: LaunchedCity) => {
    const params = new URLSearchParams();
    params.set('city', city.name);
    if (city.state) {
      params.set('state', city.state);
    }
    navigate(`/places?${params.toString()}`);
  };

  const handleBack = () => {
    navigate('/places');
  };

  return (
    <PageLayout>
      <div className="container py-8 md:py-12 space-y-8">
        {/* Header */}
        <header className="space-y-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="gap-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight">
              Explore Another City
            </h1>
            <p className="text-muted-foreground text-lg">
              Browse curated places in cities we've launched
            </p>
          </div>
        </header>

        {/* City Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Unable to load cities</p>
          </div>
        ) : cities && cities.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => handleSelectCity(city)}
                className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[88px]"
              >
                <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">
                    {city.name}{city.state ? `, ${city.state}` : ''}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {city.approved_place_count} {city.approved_place_count === 1 ? 'place' : 'places'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <div className="p-4 rounded-full bg-muted w-fit mx-auto">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No cities available yet</p>
              <p className="text-muted-foreground text-sm mt-1">
                We're working on adding more cities soon
              </p>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ExploreCities;
