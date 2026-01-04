import { useState, useEffect, useCallback } from 'react';
import { useCouple } from '@/hooks/useCouple';

interface UserLocation {
  lat: number | null;
  lng: number | null;
  source: 'profile' | 'browser' | null;
  isLoading: boolean;
  error: string | null;
  requestBrowserLocation: () => void;
}

const SESSION_KEY = 'user_browser_location';

interface CachedLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

/**
 * Provides unified location access:
 * 1. First priority: memberProfile.city_lat/lng
 * 2. Fallback: Browser geolocation (cached in session storage)
 */
export const useUserLocation = (): UserLocation => {
  const { memberProfile } = useCouple();
  const [browserLocation, setBrowserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check session storage for cached browser location on mount
  useEffect(() => {
    const cached = sessionStorage.getItem(SESSION_KEY);
    if (cached) {
      try {
        const parsed: CachedLocation = JSON.parse(cached);
        // Cache valid for 1 hour
        if (Date.now() - parsed.timestamp < 60 * 60 * 1000) {
          setBrowserLocation({ lat: parsed.lat, lng: parsed.lng });
        } else {
          sessionStorage.removeItem(SESSION_KEY);
        }
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  const requestBrowserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        setBrowserLocation(location);
        
        // Cache in session storage
        const cached: CachedLocation = {
          ...location,
          timestamp: Date.now(),
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(cached));
        
        setIsLoading(false);
      },
      (err) => {
        setIsLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location unavailable');
            break;
          case err.TIMEOUT:
            setError('Location request timed out');
            break;
          default:
            setError('Unable to get location');
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, []);

  // Priority: profile location > browser location
  const profileLat = memberProfile?.city_lat;
  const profileLng = memberProfile?.city_lng;

  if (profileLat != null && profileLng != null) {
    return {
      lat: profileLat,
      lng: profileLng,
      source: 'profile',
      isLoading: false,
      error: null,
      requestBrowserLocation,
    };
  }

  if (browserLocation) {
    return {
      lat: browserLocation.lat,
      lng: browserLocation.lng,
      source: 'browser',
      isLoading: false,
      error: null,
      requestBrowserLocation,
    };
  }

  return {
    lat: null,
    lng: null,
    source: null,
    isLoading,
    error,
    requestBrowserLocation,
  };
};
