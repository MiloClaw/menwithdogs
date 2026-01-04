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
 * 
 * Note: Exploration mode is now handled via URL params in Places.tsx
 */
const AUTO_GEO_KEY = 'auto_geo_attempted';

export const useUserLocation = (): UserLocation => {
  const { memberProfile, loading: profileLoading } = useCouple();
  const [browserLocation, setBrowserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedAutoGeo, setHasAttemptedAutoGeo] = useState(() => {
    return sessionStorage.getItem(AUTO_GEO_KEY) === 'true';
  });

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

  // Profile location check
  const profileLat = memberProfile?.city_lat;
  const profileLng = memberProfile?.city_lng;
  const hasProfileLocation = profileLat != null && profileLng != null;

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

  // Auto-request geolocation on first visit if no profile location and no cached browser location
  useEffect(() => {
    // Wait for profile to finish loading
    if (profileLoading) return;
    
    // Skip if already have profile location, browser location, or already attempted
    if (hasProfileLocation || browserLocation || hasAttemptedAutoGeo) return;
    
    // Skip if geolocation not supported
    if (!navigator.geolocation) return;
    
    // Mark as attempted (persisted across page refreshes in this session)
    setHasAttemptedAutoGeo(true);
    sessionStorage.setItem(AUTO_GEO_KEY, 'true');
    
    // Silently request geolocation
    requestBrowserLocation();
  }, [profileLoading, hasProfileLocation, browserLocation, hasAttemptedAutoGeo, requestBrowserLocation]);

  // Return profile location if available
  if (hasProfileLocation) {
    return {
      lat: profileLat!,
      lng: profileLng!,
      source: 'profile',
      isLoading: false,
      error: null,
      requestBrowserLocation,
    };
  }

  // Return browser location if available
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

  // No location available
  return {
    lat: null,
    lng: null,
    source: null,
    isLoading,
    error,
    requestBrowserLocation,
  };
};
