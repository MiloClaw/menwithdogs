import { Search, MapPin } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import FilterChip from "@/components/FilterChip";
import PlaceCard from "@/components/PlaceCard";

const filters = ["All", "Restaurants", "Gyms", "Coffee Shops", "Outdoors", "Events"];

const places = [
  { name: "The Ivy Kitchen", category: "Restaurant", location: "Downtown", rating: 4 },
  { name: "Iron Temple Gym", category: "Gym", location: "Midtown", rating: 5 },
  { name: "Ritual Coffee", category: "Coffee Shop", location: "East Village", rating: 4 },
  { name: "Sunset Trail", category: "Outdoors", location: "Westside", rating: 5 },
  { name: "The Social Club", category: "Events", location: "Arts District", rating: 4 },
];

const Places = () => {
  return (
    <PageLayout>
      <PageHeader 
        title="Discover Places" 
        subtitle="Find couple-friendly spots in your area"
      />
      
      <div className="container py-8">
        {/* Search Bar */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search places..."
            className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-button text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
          {filters.map((filter, index) => (
            <FilterChip key={filter} label={filter} active={index === 0} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Map Placeholder */}
          <div className="lg:col-span-3 aspect-[4/3] lg:aspect-auto lg:min-h-[600px] bg-muted rounded-card flex items-center justify-center border border-border">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">Map View</p>
              <p className="text-sm">Interactive map coming soon</p>
            </div>
          </div>

          {/* Places List */}
          <div className="lg:col-span-2 space-y-4">
            {places.map((place) => (
              <PlaceCard key={place.name} {...place} />
            ))}
          </div>
        </div>

        {/* Empty State (hidden by default, shown when no results) */}
        <div className="hidden py-16 text-center">
          <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center">
            <MapPin className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-serif text-xl font-semibold text-primary mb-2">
            No places found
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Try adjusting your filters or search terms to find couple-friendly spots in your area.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Places;
