import { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { Button } from '@/components/ui/button';
import { Mountain, Satellite, Loader2, Route } from 'lucide-react';
import { Trail, getTrailsForPark, getDifficultyLabel, DIFFICULTY_COLORS } from '@/lib/trail-data';
import { createTrailheadMarkerElement, TrailMarkerPopupContent } from './TrailMarker';
import TrailLegend from './TrailLegend';
import { AnimatePresence } from 'framer-motion';

interface NationalParkMapProps {
  lat: number;
  lng: number;
  parkName: string;
  parkId?: string;
  initialZoom?: number;
}

type MapStyle = 'outdoors' | 'satellite';

const MAP_STYLES: Record<MapStyle, string> = {
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
};

// Trail layers available in Mapbox Outdoors style
const TRAIL_LAYERS = ['road-path', 'road-steps', 'road-pedestrian'];

const NationalParkMap = ({ 
  lat, 
  lng, 
  parkName,
  parkId,
  initialZoom = 10 
}: NationalParkMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const trailMarkersRef = useRef<mapboxgl.Marker[]>([]);
  
  const { token, isLoading: tokenLoading, error: tokenError } = useMapboxToken();
  const [mapStyle, setMapStyle] = useState<MapStyle>('outdoors');
  const [isMapReady, setIsMapReady] = useState(false);
  const [showTrails, setShowTrails] = useState(true);

  // Get featured trails for this park
  const featuredTrails = parkId ? getTrailsForPark(parkId) : [];

  // Add trail markers to the map
  const addTrailMarkers = useCallback((map: mapboxgl.Map, trails: Trail[]) => {
    // Remove existing trail markers
    trailMarkersRef.current.forEach(marker => marker.remove());
    trailMarkersRef.current = [];

    if (!showTrails) return;

    trails.forEach(trail => {
      const el = createTrailheadMarkerElement();
      
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(trail.trailhead)
        .setPopup(
          new mapboxgl.Popup({ 
            offset: 15,
            closeButton: true,
            maxWidth: '300px',
          }).setHTML(TrailMarkerPopupContent({ trail }))
        )
        .addTo(map);

      trailMarkersRef.current.push(marker);
    });
  }, [showTrails]);

  // Setup trail interactivity (click and hover events)
  const setupTrailInteractivity = useCallback((map: mapboxgl.Map) => {
    // Check which trail layers exist in the current style
    const availableLayers = TRAIL_LAYERS.filter(layer => map.getLayer(layer));
    
    if (availableLayers.length === 0) return;

    // Trail click handler - show popup with trail info
    const handleTrailClick = (e: mapboxgl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: availableLayers,
      });

      if (features.length > 0) {
        const trail = features[0];
        const trailName = trail.properties?.name || trail.properties?.ref || 'Trail';
        const trailClass = trail.properties?.class || '';
        
        // Remove existing popup if any
        if (popupRef.current) {
          popupRef.current.remove();
        }

        // Create and show new popup
        popupRef.current = new mapboxgl.Popup({ 
          offset: 15,
          closeButton: true,
          closeOnClick: true,
          className: 'trail-popup'
        })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div class="p-2 min-w-[120px]">
              <strong class="text-sm text-foreground block">${trailName}</strong>
              ${trailClass ? `<span class="text-xs text-muted-foreground capitalize">${trailClass.replace('_', ' ')}</span>` : ''}
            </div>
          `)
          .addTo(map);
      }
    };

    // Trail hover handlers - change cursor
    const handleTrailMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };

    const handleTrailMouseLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    // Attach event listeners to each available trail layer
    availableLayers.forEach(layer => {
      map.on('click', layer, handleTrailClick);
      map.on('mouseenter', layer, handleTrailMouseEnter);
      map.on('mouseleave', layer, handleTrailMouseLeave);
    });

    // Return cleanup function
    return () => {
      availableLayers.forEach(layer => {
        map.off('click', layer, handleTrailClick);
        map.off('mouseenter', layer, handleTrailMouseEnter);
        map.off('mouseleave', layer, handleTrailMouseLeave);
      });
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!token || !mapContainer.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[mapStyle],
      center: [lng, lat],
      zoom: initialZoom,
      pitch: 45,
      bearing: 0,
      antialias: true,
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl({
      visualizePitch: true,
    }), 'top-right');

    // Add geolocate control for user location
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      'top-right'
    );

    // Add fullscreen control
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Add scale
    map.addControl(new mapboxgl.ScaleControl({ unit: 'imperial' }), 'bottom-left');

    let trailCleanup: (() => void) | undefined;

    map.on('load', () => {
      // Add 3D terrain
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });
      
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // Add sky layer for atmosphere
      map.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 90.0],
          'sky-atmosphere-sun-intensity': 15,
        },
      });

      // Setup trail interactivity
      trailCleanup = setupTrailInteractivity(map);

      // Add featured trail markers
      if (featuredTrails.length > 0) {
        addTrailMarkers(map, featuredTrails);
      }

      setIsMapReady(true);
    });

    // Add park marker
    const markerElement = document.createElement('div');
    markerElement.className = 'park-marker';
    markerElement.innerHTML = `
      <div class="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center shadow-lg border-2 border-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
        </svg>
      </div>
    `;

    const marker = new mapboxgl.Marker({ element: markerElement })
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<strong class="text-sm">${parkName}</strong>`)
      )
      .addTo(map);

    markerRef.current = marker;
    mapRef.current = map;

    return () => {
      trailCleanup?.();
      if (popupRef.current) {
        popupRef.current.remove();
      }
      trailMarkersRef.current.forEach(m => m.remove());
      marker.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [token, lat, lng, parkName, initialZoom, setupTrailInteractivity, featuredTrails, addTrailMarkers]);

  // Update trail markers when showTrails changes
  useEffect(() => {
    if (mapRef.current && isMapReady && featuredTrails.length > 0) {
      addTrailMarkers(mapRef.current, featuredTrails);
    }
  }, [showTrails, isMapReady, featuredTrails, addTrailMarkers]);

  // Handle style changes
  const toggleStyle = useCallback(() => {
    const newStyle = mapStyle === 'outdoors' ? 'satellite' : 'outdoors';
    setMapStyle(newStyle);
    
    if (mapRef.current) {
      const map = mapRef.current;
      const center = map.getCenter();
      const zoom = map.getZoom();
      const pitch = map.getPitch();
      const bearing = map.getBearing();

      map.setStyle(MAP_STYLES[newStyle]);

      map.once('style.load', () => {
        map.setCenter(center);
        map.setZoom(zoom);
        map.setPitch(pitch);
        map.setBearing(bearing);

        // Re-add terrain
        if (!map.getSource('mapbox-dem')) {
          map.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14,
          });
        }
        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

        // Re-add sky
        if (!map.getLayer('sky')) {
          map.addLayer({
            id: 'sky',
            type: 'sky',
            paint: {
              'sky-type': 'atmosphere',
              'sky-atmosphere-sun': [0.0, 90.0],
              'sky-atmosphere-sun-intensity': 15,
            },
          });
        }

        // Re-setup trail interactivity after style change
        setupTrailInteractivity(map);

        // Re-add trail markers
        if (featuredTrails.length > 0 && showTrails) {
          addTrailMarkers(map, featuredTrails);
        }
      });
    }
  }, [mapStyle, setupTrailInteractivity, featuredTrails, showTrails, addTrailMarkers]);

  // Toggle trail visibility
  const toggleTrails = useCallback(() => {
    setShowTrails(prev => !prev);
  }, []);

  if (tokenLoading) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">Unable to load map</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Trail Legend */}
      <AnimatePresence>
        {isMapReady && showTrails && featuredTrails.length > 0 && (
          <TrailLegend />
        )}
      </AnimatePresence>

      {/* Control Buttons */}
      {isMapReady && (
        <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
          {/* Trail Toggle Button - only show if park has featured trails */}
          {featuredTrails.length > 0 && (
            <Button
              variant="secondary"
              size="default"
              onClick={toggleTrails}
              className={`gap-2 shadow-lg border border-border ${
                showTrails 
                  ? 'bg-brand-green text-white hover:bg-brand-green/90' 
                  : 'bg-white text-foreground hover:bg-muted'
              }`}
            >
              <Route className="h-5 w-5" />
              <span className="font-medium">{showTrails ? 'Hide Trails' : 'Show Trails'}</span>
            </Button>
          )}
          
          {/* Style Toggle Button */}
          <Button
            variant="secondary"
            size="default"
            onClick={toggleStyle}
            className="gap-2 shadow-lg bg-white text-foreground border border-border hover:bg-muted"
          >
            {mapStyle === 'outdoors' ? (
              <>
                <Satellite className="h-5 w-5" />
                <span className="font-medium">Satellite</span>
              </>
            ) : (
              <>
                <Mountain className="h-5 w-5" />
                <span className="font-medium">Trails</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default NationalParkMap;
