import { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { Button } from '@/components/ui/button';
import { Mountain, Satellite, Loader2 } from 'lucide-react';

interface NationalParkMapProps {
  lat: number;
  lng: number;
  parkName: string;
  initialZoom?: number;
}

type MapStyle = 'outdoors' | 'satellite';

const MAP_STYLES: Record<MapStyle, string> = {
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
};

const NationalParkMap = ({ 
  lat, 
  lng, 
  parkName, 
  initialZoom = 10 
}: NationalParkMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  
  const { token, isLoading: tokenLoading, error: tokenError } = useMapboxToken();
  const [mapStyle, setMapStyle] = useState<MapStyle>('outdoors');
  const [isMapReady, setIsMapReady] = useState(false);

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

    // Add fullscreen control
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Add scale
    map.addControl(new mapboxgl.ScaleControl({ unit: 'imperial' }), 'bottom-left');

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
      marker.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [token, lat, lng, parkName, initialZoom]);

  // Handle style changes
  const toggleStyle = useCallback(() => {
    const newStyle = mapStyle === 'outdoors' ? 'satellite' : 'outdoors';
    setMapStyle(newStyle);
    
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      const zoom = mapRef.current.getZoom();
      const pitch = mapRef.current.getPitch();
      const bearing = mapRef.current.getBearing();

      mapRef.current.setStyle(MAP_STYLES[newStyle]);

      mapRef.current.once('style.load', () => {
        mapRef.current?.setCenter(center);
        mapRef.current?.setZoom(zoom);
        mapRef.current?.setPitch(pitch);
        mapRef.current?.setBearing(bearing);

        // Re-add terrain
        if (!mapRef.current?.getSource('mapbox-dem')) {
          mapRef.current?.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14,
          });
        }
        mapRef.current?.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

        // Re-add sky
        if (!mapRef.current?.getLayer('sky')) {
          mapRef.current?.addLayer({
            id: 'sky',
            type: 'sky',
            paint: {
              'sky-type': 'atmosphere',
              'sky-atmosphere-sun': [0.0, 90.0],
              'sky-atmosphere-sun-intensity': 15,
            },
          });
        }
      });
    }
  }, [mapStyle]);

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
      
      {/* Style Toggle Button */}
      {isMapReady && (
        <div className="absolute bottom-4 right-4 z-10">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleStyle}
            className="gap-2 shadow-lg bg-background/95 backdrop-blur-sm"
          >
            {mapStyle === 'outdoors' ? (
              <>
                <Satellite className="h-4 w-4" />
                <span className="hidden sm:inline">Satellite</span>
              </>
            ) : (
              <>
                <Mountain className="h-4 w-4" />
                <span className="hidden sm:inline">Trails</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default NationalParkMap;
