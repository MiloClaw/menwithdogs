import { useState } from 'react';
import { PhotoReference } from '@/hooks/usePlaces';
import { supabase } from '@/integrations/supabase/client';

interface PlacePhotoGalleryProps {
  photos: PhotoReference[];
  placeName: string;
}

const PlacePhotoGallery = ({ photos, placeName }: PlacePhotoGalleryProps) => {
  const [loadedPhotos, setLoadedPhotos] = useState<Record<string, string>>({});
  const [loadingPhotos, setLoadingPhotos] = useState<Record<string, boolean>>({});

  const displayPhotos = photos.slice(0, 3);

  const loadPhoto = async (photo: PhotoReference, index: number) => {
    const key = `${photo.name}-${index}`;
    if (loadedPhotos[key] || loadingPhotos[key]) return;

    setLoadingPhotos(prev => ({ ...prev, [key]: true }));

    try {
      const { data, error } = await supabase.functions.invoke('google-places-photo', {
        body: { photoName: photo.name, maxWidth: 400 },
      });

      if (!error && data?.url) {
        setLoadedPhotos(prev => ({ ...prev, [key]: data.url }));
      }
    } catch (err) {
      console.error('Failed to load photo:', err);
    } finally {
      setLoadingPhotos(prev => ({ ...prev, [key]: false }));
    }
  };

  // Load photos on mount
  useState(() => {
    displayPhotos.forEach((photo, index) => {
      loadPhoto(photo, index);
    });
  });

  if (displayPhotos.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      {displayPhotos.map((photo, index) => {
        const key = `${photo.name}-${index}`;
        const photoUrl = loadedPhotos[key];
        const isLoading = loadingPhotos[key];

        return (
          <div
            key={key}
            className="aspect-square rounded-lg overflow-hidden bg-muted"
          >
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
              </div>
            ) : photoUrl ? (
              <img
                src={photoUrl}
                alt={`${placeName} photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                No image
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PlacePhotoGallery;
