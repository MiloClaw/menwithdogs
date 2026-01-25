import { Trail, DIFFICULTY_COLORS, getDifficultyLabel } from '@/lib/trail-data';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Footprints, Mountain, Ruler, ExternalLink, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrailDetailSheetProps {
  trail: Trail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TrailDetailSheet = ({ trail, open, onOpenChange }: TrailDetailSheetProps) => {
  if (!trail) return null;
  
  const difficultyColors = DIFFICULTY_COLORS[trail.difficulty];
  
  const handleGetDirections = () => {
    // Open Google Maps directions to trailhead
    const [lng, lat] = trail.trailhead;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left pb-2">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-full bg-brand-green/10 flex-shrink-0">
              <Footprints className="w-5 h-5 text-brand-green" />
            </div>
            <div className="flex-1 min-w-0">
              <DrawerTitle className="text-lg font-semibold leading-tight">
                {trail.name}
              </DrawerTitle>
              <DrawerDescription className="sr-only">
                Trail details and information
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>
        
        <div className="px-4 pb-6 space-y-4">
          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
              difficultyColors.bg,
              difficultyColors.text
            )}>
              {getDifficultyLabel(trail.difficulty)}
            </span>
            
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground">
              <Ruler className="w-4 h-4" />
              {trail.distance} mi {trail.isLoop ? 'loop' : 'out & back'}
            </span>
            
            {trail.elevationGain && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground">
                <Mountain className="w-4 h-4" />
                ↑ {trail.elevationGain.toLocaleString()} ft
              </span>
            )}
          </div>
          
          {/* Description */}
          <p className="text-foreground leading-relaxed">
            {trail.description}
          </p>
          
          {/* Coordinates */}
          <p className="text-xs text-muted-foreground">
            Trailhead: {trail.trailhead[1].toFixed(4)}°N, {Math.abs(trail.trailhead[0]).toFixed(4)}°W
          </p>
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button 
              onClick={handleGetDirections}
              className="flex-1 bg-brand-green hover:bg-brand-green/90"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
