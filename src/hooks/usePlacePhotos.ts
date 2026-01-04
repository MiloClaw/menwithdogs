import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PhotoReference {
  name: string;
  widthPx: number;
  heightPx: number;
}

interface UsePlacePhotosOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxPhotos?: number;
}

/**
 * Hook to load Google Places photos via the secure proxy edge function.
 * Returns an array of data URLs that can be used directly in img src.
 */
export const usePlacePhotos = (
  photos: PhotoReference[] | null | undefined,
  options: UsePlacePhotosOptions = {}
) => {
  const { maxWidth = 400, maxHeight = 400, maxPhotos = 5 } = options;
  
  const [loadedPhotos, setLoadedPhotos] = useState<(string | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Stabilize photos reference to prevent infinite loops
  const photosKey = useMemo(
    () => photos?.map(p => p.name).join(',') ?? '',
    [photos]
  );

  const loadPhotos = useCallback(async () => {
    if (!photos || photos.length === 0) {
      setLoadedPhotos([]);
      return;
    }

    const displayPhotos = photos.slice(0, maxPhotos);
    setIsLoading(true);
    setLoadedPhotos(new Array(displayPhotos.length).fill(null));

    const results = await Promise.all(
      displayPhotos.map(async (photo) => {
        try {
          const { data, error } = await supabase.functions.invoke('google-places-photo', {
            body: { name: photo.name, maxWidth, maxHeight },
          });

          if (error) {
            console.error('Photo fetch error:', error);
            return null;
          }

          return data?.url || null;
        } catch (err) {
          console.error('Failed to load photo:', err);
          return null;
        }
      })
    );

    setLoadedPhotos(results);
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photosKey, maxWidth, maxHeight, maxPhotos]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  return {
    photoUrls: loadedPhotos,
    isLoading,
    hasPhotos: (photos?.length ?? 0) > 0,
  };
};
