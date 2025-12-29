/**
 * Utility functions for working with Google Places photos
 * Photos are proxied through our edge function to keep the API key secure
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface PhotoReference {
  name: string;
  widthPx: number;
  heightPx: number;
}

/**
 * Constructs a URL for fetching a Google Places photo through our proxy
 * @param photoName - The photo reference name from Google Places API (e.g., "places/xxx/photos/yyy")
 * @param maxWidth - Maximum width in pixels (100-4800)
 * @param maxHeight - Maximum height in pixels (100-4800)
 */
export const getPlacePhotoUrl = (
  photoName: string,
  maxWidth: number = 400,
  maxHeight: number = 400
): string => {
  if (!photoName || !SUPABASE_URL) {
    return '';
  }
  
  const params = new URLSearchParams({
    name: photoName,
    maxWidth: String(Math.min(Math.max(maxWidth, 100), 4800)),
    maxHeight: String(Math.min(Math.max(maxHeight, 100), 4800)),
  });
  
  return `${SUPABASE_URL}/functions/v1/google-places-photo?${params.toString()}`;
};

/**
 * Gets the first photo URL from a photos array
 */
export const getFirstPhotoUrl = (
  photos: PhotoReference[] | null | undefined,
  maxWidth: number = 400,
  maxHeight: number = 400
): string | null => {
  if (!photos || photos.length === 0) {
    return null;
  }
  
  return getPlacePhotoUrl(photos[0].name, maxWidth, maxHeight);
};

/**
 * Gets all photo URLs from a photos array
 */
export const getAllPhotoUrls = (
  photos: PhotoReference[] | null | undefined,
  maxWidth: number = 400,
  maxHeight: number = 400
): string[] => {
  if (!photos || photos.length === 0) {
    return [];
  }
  
  return photos.map(photo => getPlacePhotoUrl(photo.name, maxWidth, maxHeight));
};
