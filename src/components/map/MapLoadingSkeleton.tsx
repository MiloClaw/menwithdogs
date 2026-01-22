import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';

export function MapLoadingSkeleton() {
  return (
    <div className="relative w-full h-[70vh] md:h-[60vh] bg-muted rounded-lg overflow-hidden">
      {/* Map background skeleton */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted to-muted-foreground/10" />
      
      {/* Fake map grid lines */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-0 right-0 h-px bg-foreground" />
        <div className="absolute top-2/4 left-0 right-0 h-px bg-foreground" />
        <div className="absolute top-3/4 left-0 right-0 h-px bg-foreground" />
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-foreground" />
        <div className="absolute left-2/4 top-0 bottom-0 w-px bg-foreground" />
        <div className="absolute left-3/4 top-0 bottom-0 w-px bg-foreground" />
      </div>
      
      {/* Skeleton pins */}
      <div className="absolute top-1/3 left-1/4">
        <div className="w-6 h-6 rounded-full bg-primary/30 animate-pulse" />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2">
        <div className="w-6 h-6 rounded-full bg-primary/30 animate-pulse delay-75" />
      </div>
      <div className="absolute top-2/5 right-1/3">
        <div className="w-6 h-6 rounded-full bg-primary/30 animate-pulse delay-150" />
      </div>
      
      {/* Center loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 bg-background/80 backdrop-blur-sm px-6 py-4 rounded-lg shadow-lg">
          <MapPin className="w-8 h-8 text-primary animate-bounce" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
      
      {/* Bottom sheet peek skeleton (mobile) */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-background/95 backdrop-blur-sm border-t md:hidden">
        <div className="flex items-center justify-center pt-2">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="px-4 pt-3">
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}
