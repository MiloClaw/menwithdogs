import { useState, useCallback } from 'react';

interface Viewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

interface UseMapViewportOptions {
  initialCenter: { lat: number; lng: number } | null;
  initialZoom?: number;
}

interface UseMapViewportResult {
  viewport: Viewport;
  setViewport: (viewport: Viewport) => void;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  resetToInitial: () => void;
  hasMovedFromInitial: boolean;
}

const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 }; // Center of US
const DEFAULT_ZOOM = 4; // Show continental US when no location

export function useMapViewport({ 
  initialCenter, 
  initialZoom = DEFAULT_ZOOM 
}: UseMapViewportOptions): UseMapViewportResult {
  const center = initialCenter || DEFAULT_CENTER;
  
  const [viewport, setViewport] = useState<Viewport>({
    latitude: center.lat,
    longitude: center.lng,
    zoom: initialZoom,
  });

  const [initialViewport] = useState<Viewport>({
    latitude: center.lat,
    longitude: center.lng,
    zoom: initialZoom,
  });

  const [hasMovedFromInitial, setHasMovedFromInitial] = useState(false);

  const handleViewportChange = useCallback((newViewport: Viewport) => {
    setViewport(newViewport);
    
    // Check if user has panned away from initial position
    const latDiff = Math.abs(newViewport.latitude - initialViewport.latitude);
    const lngDiff = Math.abs(newViewport.longitude - initialViewport.longitude);
    const hasMoved = latDiff > 0.01 || lngDiff > 0.01;
    setHasMovedFromInitial(hasMoved);
  }, [initialViewport]);

  const flyTo = useCallback((lat: number, lng: number, zoom?: number) => {
    setViewport({
      latitude: lat,
      longitude: lng,
      zoom: zoom ?? viewport.zoom,
    });
  }, [viewport.zoom]);

  const resetToInitial = useCallback(() => {
    setViewport(initialViewport);
    setHasMovedFromInitial(false);
  }, [initialViewport]);

  return {
    viewport,
    setViewport: handleViewportChange,
    flyTo,
    resetToInitial,
    hasMovedFromInitial,
  };
}
