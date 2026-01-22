import { useState, useCallback, useMemo } from 'react';
import Map, { NavigationControl, MapEvent } from 'react-map-gl';
import { LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { useMapViewport } from './useMapViewport';
import { useMapPlaces, MapBounds } from '@/hooks/useMapPlaces';
import { MapPlaceMarker } from './MapPlaceMarker';
import { MapPlaceCard } from './MapPlaceCard';
import { MapBottomSheet } from './MapBottomSheet';
import { MapLoadingSkeleton } from './MapLoadingSkeleton';
import { DirectoryPlace } from '@/components/directory/DirectoryPlaceCard';
import { cn } from '@/lib/utils';

interface MapViewProps {
  places: DirectoryPlace[];
  center: { lat: number; lng: number } | null;
  onPlaceSelect: (place: DirectoryPlace) => void;
  isLoading: boolean;
}

const MAP_STYLE = 'mapbox://styles/mapbox/light-v11';

export default function MapView({ 
  places, 
  center, 
  onPlaceSelect,
  isLoading 
}: MapViewProps) {
  const { token, isLoading: tokenLoading, error: tokenError } = useMapboxToken();
  const { viewport, setViewport, flyTo, resetToInitial, hasMovedFromInitial } = useMapViewport({
    initialCenter: center,
    initialZoom: 13,
  });
  
  const [highlightedPlaceId, setHighlightedPlaceId] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  
  // Fetch places based on current viewport bounds
  const { data: viewportPlaces } = useMapPlaces(bounds, mapLoaded);
  
  // Merge initial places with viewport-fetched places (deduplicated by id)
  const mappablePlaces = useMemo((): DirectoryPlace[] => {
    const placeRecord: Record<string, DirectoryPlace> = {};
    
    // Add initial places first
    places.forEach((p: DirectoryPlace) => {
      if (p.lat != null && p.lng != null) {
        placeRecord[p.id] = p;
      }
    });
    
    // Add/override with viewport places
    (viewportPlaces ?? []).forEach((p: DirectoryPlace) => {
      if (p.lat != null && p.lng != null) {
        placeRecord[p.id] = p;
      }
    });
    
    return Object.values(placeRecord);
  }, [places, viewportPlaces]);
  
  // Update bounds when map moves
  const handleMoveEnd = useCallback((evt: MapEvent) => {
    const mapBounds = evt.target.getBounds();
    if (mapBounds) {
      setBounds({
        north: mapBounds.getNorth(),
        south: mapBounds.getSouth(),
        east: mapBounds.getEast(),
        west: mapBounds.getWest(),
      });
    }
  }, []);
  
  const handleMarkerClick = useCallback((place: DirectoryPlace) => {
    setHighlightedPlaceId(place.id);
    if (place.lat && place.lng) {
      flyTo(place.lat, place.lng);
    }
  }, [flyTo]);
  
  const handleCardSelect = useCallback((place: DirectoryPlace) => {
    onPlaceSelect(place);
  }, [onPlaceSelect]);
  
  const handleCardHover = useCallback((placeId: string | null) => {
    setHighlightedPlaceId(placeId);
    if (placeId) {
      const place = mappablePlaces.find(p => p.id === placeId);
      if (place?.lat && place?.lng) {
        flyTo(place.lat, place.lng);
      }
    }
  }, [flyTo, mappablePlaces]);
  
  // Show loading state
  if (tokenLoading || isLoading) {
    return <MapLoadingSkeleton />;
  }
  
  // Show error state
  if (tokenError || !token) {
    return (
      <div className="w-full h-[70vh] md:h-[60vh] bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-muted-foreground mb-2">Unable to load map</p>
          <p className="text-sm text-muted-foreground/70">
            {tokenError || 'Please try again later'}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-[70vh] md:h-[60vh] rounded-lg overflow-hidden">
      {/* Map */}
      <Map
        {...viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        onMoveEnd={handleMoveEnd}
        onLoad={(evt) => {
          setMapLoaded(true);
          // Set initial bounds
          const mapBounds = evt.target.getBounds();
          if (mapBounds) {
            setBounds({
              north: mapBounds.getNorth(),
              south: mapBounds.getSouth(),
              east: mapBounds.getEast(),
              west: mapBounds.getWest(),
            });
          }
        }}
        mapStyle={MAP_STYLE}
        mapboxAccessToken={token}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        reuseMaps
      >
        {/* Navigation controls (desktop only) */}
        <div className="hidden md:block">
          <NavigationControl position="top-right" showCompass={false} />
        </div>
        
        {/* Place markers - only render after map loads */}
        {mapLoaded && mappablePlaces.map((place) => (
          <MapPlaceMarker
            key={place.id}
            lat={place.lat!}
            lng={place.lng!}
            category={place.primary_category}
            isHighlighted={highlightedPlaceId === place.id}
            onClick={() => handleMarkerClick(place)}
          />
        ))}
      </Map>
      
      {/* Loading overlay while map initializes */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center z-10 pointer-events-none">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      )}
      
      {/* Re-center button */}
      {hasMovedFromInitial && (
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            "absolute bottom-24 md:bottom-4 right-4 z-10",
            "shadow-lg gap-2"
          )}
          onClick={resetToInitial}
        >
          <LocateFixed className="w-4 h-4" />
          <span className="hidden sm:inline">Re-center</span>
        </Button>
      )}
      
      {/* Desktop sidebar */}
      <div className="hidden md:block absolute top-0 right-0 w-80 h-full bg-background/95 backdrop-blur-sm border-l shadow-lg">
        <div className="p-4 border-b">
          <p className="text-sm font-medium">
            {mappablePlaces.length} {mappablePlaces.length === 1 ? 'place' : 'places'}
          </p>
        </div>
        <ScrollArea className="h-[calc(100%-57px)]">
          <div className="p-2 space-y-1">
            {mappablePlaces.map((place) => (
              <div
                key={place.id}
                onMouseEnter={() => handleCardHover(place.id)}
                onMouseLeave={() => handleCardHover(null)}
              >
                <MapPlaceCard
                  place={place}
                  isHighlighted={highlightedPlaceId === place.id}
                  onClick={() => handleCardSelect(place)}
                />
              </div>
            ))}
            
            {mappablePlaces.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No places to show
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Mobile bottom sheet */}
      <MapBottomSheet
        places={mappablePlaces}
        highlightedPlaceId={highlightedPlaceId}
        onPlaceSelect={handleCardSelect}
        onPlaceHover={setHighlightedPlaceId}
      />
    </div>
  );
}
