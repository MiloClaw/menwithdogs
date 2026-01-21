import { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EventPhotoGalleryProps {
  /** Array of stored photo URLs (from stored_photo_urls) */
  photoUrls: string[] | null | undefined;
  venueName?: string;
  maxPhotos?: number;
  className?: string;
}

/**
 * Photo gallery component for events using stored photo URLs.
 * Photos are pre-stored in Supabase Storage, eliminating Google API costs.
 */
const EventPhotoGallery = ({ 
  photoUrls, 
  venueName = 'Venue',
  maxPhotos = 3,
  className 
}: EventPhotoGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const validPhotos = (photoUrls || []).slice(0, maxPhotos).filter(Boolean);
  const hasPhotos = validPhotos.length > 0;
  const hasMultiple = validPhotos.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? validPhotos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === validPhotos.length - 1 ? 0 : prev + 1));
  };

  // No photos at all
  if (!hasPhotos) {
    return (
      <div className={cn(
        'relative w-full aspect-video bg-muted rounded-lg flex items-center justify-center',
        className
      )}>
        <div className="text-center text-muted-foreground">
          <ImageOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No photos available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full aspect-video rounded-lg overflow-hidden', className)}>
      {/* Current photo */}
      <img
        src={validPhotos[currentIndex]}
        alt={`${venueName} photo ${currentIndex + 1}`}
        loading="lazy"
        width={800}
        height={450}
        className="w-full h-full object-cover"
      />

      {/* Navigation arrows */}
      {hasMultiple && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 h-8 w-8"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 h-8 w-8"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Photo indicators */}
      {hasMultiple && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {validPhotos.map((_, idx) => (
            <button
              key={idx}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                idx === currentIndex ? 'bg-white' : 'bg-white/50'
              )}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to photo ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventPhotoGallery;
