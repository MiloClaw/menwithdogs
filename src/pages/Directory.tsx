import { useState, useMemo } from 'react';
import { Search, MapPinOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PageLayout from '@/components/PageLayout';
import DirectoryPlaceCard from '@/components/directory/DirectoryPlaceCard';
import { usePublicPlaces } from '@/hooks/usePublicPlaces';
import { useCoupleContext } from '@/contexts/CoupleContext';
import { calculateDistanceMiles } from '@/lib/distance';
import { Skeleton } from '@/components/ui/skeleton';

const RADIUS_OPTIONS = [
  { label: 'All', value: null },
  { label: '10 mi', value: 10 },
  { label: '25 mi', value: 25 },
  { label: '50 mi', value: 50 },
];

const Directory = () => {
  const { data: places, isLoading } = usePublicPlaces();
  const { memberProfile } = useCoupleContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [radiusFilter, setRadiusFilter] = useState<number | null>(null);

  // User location from profile
  const userLat = memberProfile?.city_lat;
  const userLng = memberProfile?.city_lng;
  const hasUserLocation = userLat != null && userLng != null;

  // Get unique categories
  const categories = useMemo(() => {
    if (!places) return [];
    const cats = [...new Set(places.map(p => p.primary_category))].filter(Boolean);
    return cats.sort();
  }, [places]);

  // Calculate distances and filter/sort places
  const processedPlaces = useMemo(() => {
    if (!places) return [];

    // Add distance to each place
    const placesWithDistance = places.map(place => {
      let distance: number | undefined;
      
      if (hasUserLocation && place.lat != null && place.lng != null) {
        distance = calculateDistanceMiles(userLat, userLng, place.lat, place.lng);
      }
      
      return { ...place, distance };
    });

    // Filter by search and category
    let filtered = placesWithDistance.filter(place => {
      const matchesSearch = !searchTerm || 
        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.city?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || 
        place.primary_category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Filter by radius (only if user has location)
    if (radiusFilter !== null && hasUserLocation) {
      filtered = filtered.filter(place => 
        place.distance !== undefined && place.distance <= radiusFilter
      );
    }

    // Sort: by distance if available, otherwise by name
    return filtered.sort((a, b) => {
      // Places with distance come first, sorted by distance
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      // Places without distance go to the end
      if (a.distance !== undefined) return -1;
      if (b.distance !== undefined) return 1;
      // Fallback to alphabetical
      return a.name.localeCompare(b.name);
    });
  }, [places, searchTerm, selectedCategory, radiusFilter, hasUserLocation, userLat, userLng]);

  return (
    <PageLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Directory</h1>
          <p className="text-muted-foreground">
            Discover great places for your next date
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search places..."
            className="pl-9"
          />
        </div>

        {/* Distance Filter */}
        {hasUserLocation ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Distance</p>
            <div className="flex flex-wrap gap-2">
              {RADIUS_OPTIONS.map(option => (
                <Badge
                  key={option.label}
                  variant={radiusFilter === option.value ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/90 min-h-[44px] px-4 flex items-center"
                  onClick={() => setRadiusFilter(option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-3 rounded-lg">
            <MapPinOff className="h-4 w-4 flex-shrink-0" />
            <span>Add your city in your profile to see places near you</span>
          </div>
        )}

        {/* Category Filters */}
        {categories.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Category</p>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === null ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/90 min-h-[44px] px-4 flex items-center"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Badge>
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/90 min-h-[44px] px-4 flex items-center"
                  onClick={() => setSelectedCategory(
                    selectedCategory === category ? null : category
                  )}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground">
            {processedPlaces.length} {processedPlaces.length === 1 ? 'place' : 'places'} found
          </p>
        )}

        {/* Places Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : processedPlaces.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory || radiusFilter
                ? 'No places match your search criteria'
                : 'No places in the directory yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedPlaces.map(place => (
              <DirectoryPlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Directory;
