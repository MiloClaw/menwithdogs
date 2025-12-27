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
      
      <div className="container py-6 md:py-8">
        {/* Search Bar */}
        <div className="relative w-full md:max-w-md mb-4 md:mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search places..."
            className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 bg-surface border border-border rounded-button text-sm md:text-base text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 md:mb-8 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {filters.map((filter, index) => (
            <FilterChip key={filter} label={filter} active={index === 0} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-5 gap-6 md:gap-8">
          {/* Map Placeholder */}
          <div className="lg:col-span-3 aspect-[3/2] md:aspect-[4/3] lg:aspect-auto lg:min-h-[500px] bg-muted rounded-card flex items-center justify-center border border-border order-2 lg:order-1">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 opacity-50" />
              <p className="text-base md:text-lg font-medium">Map View</p>
              <p className="text-xs md:text-sm">Interactive map coming soon</p>
            </div>
          </div>

          {/* Places List */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4 order-1 lg:order-2">
            {places.map((place) => (
              <PlaceCard key={place.name} {...place} />
            ))}
          </div>
        </div>

        {/* Empty State (hidden by default, shown when no results) */}
        <div className="hidden py-12 md:py-16 text-center">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-full mx-auto mb-4 md:mb-6 flex items-center justify-center">
            <MapPin className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
          </div>
          <h3 className="font-serif text-lg md:text-xl font-semibold text-primary mb-2">
            No places found
          </h3>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
            Try adjusting your filters or search terms to find couple-friendly spots in your area.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Places;
