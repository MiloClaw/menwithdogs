import { Marker } from 'react-map-gl';
import { cn } from '@/lib/utils';

interface MapPlaceMarkerProps {
  lat: number;
  lng: number;
  category: string;
  isHighlighted: boolean;
  onClick: () => void;
}

// Category to color mapping using semantic tokens
const getCategoryColor = (category: string): string => {
  const categoryColors: Record<string, string> = {
    'Restaurant': 'bg-orange-500',
    'Bar': 'bg-purple-500',
    'Café': 'bg-amber-600',
    'Coffee Shop': 'bg-amber-600',
    'Brewery': 'bg-yellow-600',
    'Winery': 'bg-rose-600',
    'Park': 'bg-green-500',
    'Museum': 'bg-blue-500',
    'Gallery': 'bg-indigo-500',
    'Theater': 'bg-pink-500',
    'Shopping': 'bg-teal-500',
    'Spa': 'bg-cyan-500',
    'Gym': 'bg-red-500',
    'Entertainment': 'bg-violet-500',
  };
  
  return categoryColors[category] || 'bg-primary';
};

export function MapPlaceMarker({ 
  lat, 
  lng, 
  category, 
  isHighlighted, 
  onClick 
}: MapPlaceMarkerProps) {
  const colorClass = getCategoryColor(category);
  
  return (
    <Marker
      latitude={lat}
      longitude={lng}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick();
      }}
    >
      <button
        type="button"
        className={cn(
          "relative flex items-center justify-center transition-all duration-200",
          "w-8 h-8 -translate-y-1",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          isHighlighted && "scale-125 z-10"
        )}
        aria-label={`View ${category} location`}
      >
        {/* Highlight ring */}
        {isHighlighted && (
          <span 
            className={cn(
              "absolute inset-0 rounded-full animate-ping",
              colorClass,
              "opacity-30"
            )} 
          />
        )}
        
        {/* Pin body */}
        <span 
          className={cn(
            "relative w-6 h-6 rounded-full shadow-lg border-2 border-white",
            colorClass,
            "flex items-center justify-center",
            isHighlighted && "ring-2 ring-primary ring-offset-2"
          )}
        >
          {/* Inner dot */}
          <span className="w-2 h-2 rounded-full bg-white/80" />
        </span>
        
        {/* Pin pointer */}
        <span 
          className={cn(
            "absolute -bottom-1 left-1/2 -translate-x-1/2",
            "w-0 h-0",
            "border-l-[6px] border-l-transparent",
            "border-r-[6px] border-r-transparent",
            "border-t-[8px]",
            colorClass === 'bg-primary' ? 'border-t-primary' : 
            colorClass === 'bg-orange-500' ? 'border-t-orange-500' :
            colorClass === 'bg-purple-500' ? 'border-t-purple-500' :
            colorClass === 'bg-amber-600' ? 'border-t-amber-600' :
            colorClass === 'bg-yellow-600' ? 'border-t-yellow-600' :
            colorClass === 'bg-rose-600' ? 'border-t-rose-600' :
            colorClass === 'bg-green-500' ? 'border-t-green-500' :
            colorClass === 'bg-blue-500' ? 'border-t-blue-500' :
            colorClass === 'bg-indigo-500' ? 'border-t-indigo-500' :
            colorClass === 'bg-pink-500' ? 'border-t-pink-500' :
            colorClass === 'bg-teal-500' ? 'border-t-teal-500' :
            colorClass === 'bg-cyan-500' ? 'border-t-cyan-500' :
            colorClass === 'bg-red-500' ? 'border-t-red-500' :
            colorClass === 'bg-violet-500' ? 'border-t-violet-500' :
            'border-t-primary'
          )}
        />
      </button>
    </Marker>
  );
}
