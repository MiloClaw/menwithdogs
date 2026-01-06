import { ImageOff } from 'lucide-react';

interface PlacePhotoGalleryProps {
  /** Array of stored photo URLs (from stored_photo_urls) */
  storedPhotoUrls: string[] | null | undefined;
  placeName: string;
}

/**
 * Photo gallery for admin place view using stored photo URLs.
 * Photos are pre-stored in Supabase Storage, eliminating Google API costs.
 */
const PlacePhotoGallery = ({ storedPhotoUrls, placeName }: PlacePhotoGalleryProps) => {
  const displayPhotos = (storedPhotoUrls || []).slice(0, 3);

  if (displayPhotos.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      {displayPhotos.map((photoUrl, index) => (
        <div
          key={`${photoUrl}-${index}`}
          className="aspect-square rounded-lg overflow-hidden bg-muted"
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`${placeName} photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ImageOff className="h-6 w-6" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PlacePhotoGallery;
