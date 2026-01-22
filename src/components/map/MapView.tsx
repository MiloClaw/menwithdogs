import { useState, useCallback, useMemo } from 'react';
import Map, { NavigationControl, MapEvent } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LocateFixed, Loader2 } from 'lucide-react';

import { DirectoryPlace } from '@/components/directory/DirectoryPlaceCard';
import { MapPlaceMarker } from './MapPlaceMarker';
import { MapPlaceCard } from './MapPlaceCard';
import { MapBottomSheet } from './MapBottomSheet';
import { MapLoadingSkeleton } from './MapLoadingSkeleton';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { useMapViewport } from './useMapViewport';
import { useMapPlaces, MapBounds } from '@/hooks/useMapPlaces';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MapViewProps {
  places: DirectoryPlace[];
  center: { lat: number; lng: number } | null;
  onPlaceSelect: (place: DirectoryPlace) => void;
  isLoading: boolean;
  selectedCategory?: string | null;
}

export default function MapView({ 
  places, 
  center, 
  onPlaceSelect, 
  isLoading,
  selectedCategory 
}: MapViewProps) {
  const { token, isLoading: tokenLoading, error: tokenError } = useMapboxToken();
  const { viewport, setViewport, flyTo, resetToInitial, hasMovedFromInitial } = useMapViewport({
    initialCenter: center,
    initialZoom: 13,
  });
  
  const [highlightedPlaceId, setHighlightedPlaceId] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  
  // Fetch additional places based on viewport bounds
  const { data: viewportPlaces, isFetching: isViewportFetching } = useMapPlaces(bounds, mapLoaded);
  
  // Merge initial places with viewport-fetched places, deduplicating by ID
  const mergedPlaces = useMemo((): DirectoryPlace[] => {
    const placeRecord: Record<string, DirectoryPlace> = {};
    
    // Add initial places (from parent filters)
    places.forEach((p) => {
      if (p.lat != null && p.lng != null) {
        placeRecord[p.id] = p;
      }
    });
    
    // Add viewport-fetched places
    (viewportPlaces ?? []).forEach((p) => {
      if (p.lat != null && p.lng != null) {
        placeRecord[p.id] = p;
      }
    });
    
    let result = Object.values(placeRecord);
    
    // Apply category filter for consistency with parent filters
    if (selectedCategory) {
      result = result.filter(p => p.primary_category === selectedCategory);
    }
    
    return result;
  }, [places, viewportPlaces, selectedCategory]);
  
  // Filter to only places visible in current viewport bounds
  const visiblePlaces = useMemo((): DirectoryPlace[] => {
    if (!bounds) return mergedPlaces;
    
    return mergedPlaces.filter(p => 
      p.lat != null && p.lng != null &&
      p.lat >= bounds.south && p.lat <= bounds.north &&
      p.lng >= bounds.west && p.lng <= bounds.east
    );
  }, [mergedPlaces, bounds]);
  
  const handleMoveEnd = useCallback((e: MapEvent) => {
    const map = e.target;
    const newViewport = {
      latitude: map.getCenter().lat,
      longitude: map.getCenter().lng,
      zoom: map.getZoom(),
    };
    setViewport(newViewport);
    
    // Update bounds for viewport-based fetching
    const mapBounds = map.getBounds();
    if (mapBounds) {
      setBounds({
        north: mapBounds.getNorth(),
        south: mapBounds.getSouth(),
        east: mapBounds.getEast(),
        west: mapBounds.getWest(),
      });
    }
  }, [setViewport]);
  
  const handleMapLoad = useCallback((e: MapEvent) => {
    setMapLoaded(true);
    
    // Get initial bounds
    const map = e.target;
    const mapBounds = map.getBounds();
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
    setHighlightedPlaceId(place.id);
    if (place.lat && place.lng) {
      flyTo(place.lat, place.lng);
    }
    onPlaceSelect(place);
  }, [flyTo, onPlaceSelect]);
  
  // Hover only highlights - no flyTo (less jarring UX)
  const handleCardHover = useCallback((placeId: string | null) => {
    setHighlightedPlaceId(placeId);
  }, []);
  
  if (tokenLoading || isLoading) {
    return <MapLoadingSkeleton />;
  }
  
  if (tokenError || !token) {
    return (
      <div className="h-[60vh] md:h-[70vh] flex items-center justify-center bg-muted rounded-lg">
        <p className="text-muted-foreground">Unable to load map</p>
      </div>
    );
  }
  
  return (
    <div className="relative h-[60vh] md:h-[70vh] rounded-lg overflow-hidden">
      <Map
        {...viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        onMoveEnd={handleMoveEnd}
        onLoad={handleMapLoad}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={token}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" showCompass={false} />
        
        {/* Render markers only after map is loaded */}
        {mapLoaded && mergedPlaces.map((place) => (
          place.lat && place.lng ? (
            <MapPlaceMarker
              key={place.id}
              lat={place.lat}
              lng={place.lng}
              category={place.primary_category}
              isHighlighted={highlightedPlaceId === place.id}
              onClick={() => handleMarkerClick(place)}
            />
          ) : null
        ))}
      </Map>
      
      {/* Loading overlay for initial load */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      )}
      
      {/* Re-center button */}
      {hasMovedFromInitial && center && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-3 left-3 z-10 shadow-md gap-2"
          onClick={resetToInitial}
        >
          <LocateFixed className="h-4 w-4" />
          <span className="hidden sm:inline">Re-center</span>
        </Button>
      )}
      
      {/* Desktop sidebar with place cards */}
      <div className="hidden md:block absolute top-3 right-14 bottom-3 w-80 z-10">
        <div className="h-full bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border overflow-hidden flex flex-col">
          {/* Header with count and loading indicator */}
          <div className="p-3 border-b flex items-center justify-between shrink-0">
            <p className="text-sm font-medium">
              {visiblePlaces.length} {visiblePlaces.length === 1 ? 'place' : 'places'}
            </p>
            {isViewportFetching && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          
          {/* Scrollable place list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {visiblePlaces.map((place) => (
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
            
            {visiblePlaces.length === 0 && !isViewportFetching && (
              <div className="py-8 text-center text-sm text-muted-foreground px-4">
                <p>No places in this area</p>
                <p className="text-xs mt-1">Zoom out or pan to discover more</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile bottom sheet */}
      <MapBottomSheet
        places={visiblePlaces}
        highlightedPlaceId={highlightedPlaceId}
        onPlaceSelect={handleCardSelect}
        onPlaceHover={handleCardHover}
        isFetching={isViewportFetching}
      />
    </div>
  );
}
