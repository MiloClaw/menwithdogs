import { useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
import { GripHorizontal, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DirectoryPlace } from '@/components/directory/DirectoryPlaceCard';
import { MapPlaceCard } from './MapPlaceCard';

interface MapBottomSheetProps {
  places: DirectoryPlace[];
  highlightedPlaceId: string | null;
  onPlaceSelect: (place: DirectoryPlace) => void;
  onPlaceHover: (placeId: string | null) => void;
}

// Snap points in pixels (PEEK) or viewport height
const SNAP_PEEK = 88; // Just enough for handle + count
const SNAP_HALF_VH = 0.5;
const SNAP_FULL_VH = 0.9;

export function MapBottomSheet({ 
  places, 
  highlightedPlaceId, 
  onPlaceSelect,
  onPlaceHover 
}: MapBottomSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Track window height for viewport-based snaps
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const snapHalf = windowHeight * SNAP_HALF_VH;
  const snapFull = windowHeight * SNAP_FULL_VH;
  
  // Motion value for sheet height
  const sheetHeight = useMotionValue(SNAP_PEEK);
  
  // Derive opacity for expand hint
  const expandHintOpacity = useTransform(
    sheetHeight,
    [SNAP_PEEK, SNAP_PEEK + 50],
    [1, 0]
  );
  
  // Scroll to highlighted card when it changes
  useEffect(() => {
    if (highlightedPlaceId && scrollRef.current) {
      const card = scrollRef.current.querySelector(`[data-place-id="${highlightedPlaceId}"]`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Expand sheet to half if at peek
        if (sheetHeight.get() < snapHalf / 2) {
          animate(sheetHeight, snapHalf, { type: 'spring', damping: 30, stiffness: 300 });
        }
      }
    }
  }, [highlightedPlaceId, snapHalf, sheetHeight]);
  
  const handleDragEnd = (_: never, info: PanInfo) => {
    const currentHeight = sheetHeight.get();
    const velocity = info.velocity.y;
    
    // Determine target snap based on velocity and position
    let targetSnap = SNAP_PEEK;
    
    if (velocity < -500) {
      // Fast upward swipe - go to next snap
      if (currentHeight < snapHalf) {
        targetSnap = snapHalf;
      } else {
        targetSnap = snapFull;
      }
    } else if (velocity > 500) {
      // Fast downward swipe - go to previous snap
      if (currentHeight > snapHalf) {
        targetSnap = snapHalf;
      } else {
        targetSnap = SNAP_PEEK;
      }
    } else {
      // Snap to nearest
      const distToPeek = Math.abs(currentHeight - SNAP_PEEK);
      const distToHalf = Math.abs(currentHeight - snapHalf);
      const distToFull = Math.abs(currentHeight - snapFull);
      
      const minDist = Math.min(distToPeek, distToHalf, distToFull);
      if (minDist === distToPeek) targetSnap = SNAP_PEEK;
      else if (minDist === distToHalf) targetSnap = snapHalf;
      else targetSnap = snapFull;
    }
    
    animate(sheetHeight, targetSnap, { 
      type: 'spring', 
      damping: 30, 
      stiffness: 300 
    });
  };
  
  const expandToHalf = () => {
    if (sheetHeight.get() < snapHalf) {
      animate(sheetHeight, snapHalf, { type: 'spring', damping: 30, stiffness: 300 });
    }
  };
  
  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 md:hidden",
        "bg-background rounded-t-2xl shadow-2xl border-t",
        "touch-none"
      )}
      style={{ height: sheetHeight }}
      drag="y"
      dragConstraints={{ top: -(snapFull - SNAP_PEEK), bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
    >
      {/* Drag Handle */}
      <div 
        className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
        onClick={expandToHalf}
      >
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        <GripHorizontal className="w-5 h-5 text-muted-foreground/50 mt-1" />
      </div>
      
      {/* Summary row at PEEK */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <p className="text-sm font-medium">
          {places.length} {places.length === 1 ? 'place' : 'places'}
        </p>
        
        {/* Expand hint */}
        <motion.button
          type="button"
          className="flex items-center gap-1 text-xs text-muted-foreground"
          style={{ opacity: expandHintOpacity }}
          onClick={expandToHalf}
        >
          <span>Swipe up</span>
          <ChevronUp className="w-3 h-3" />
        </motion.button>
      </div>
      
      {/* Scrollable card list */}
      <ScrollArea className="flex-1 h-[calc(100%-60px)]">
        <div 
          ref={scrollRef}
          className="px-2 pb-8 space-y-1"
        >
          {places.map((place) => (
            <div 
              key={place.id}
              data-place-id={place.id}
              onMouseEnter={() => onPlaceHover(place.id)}
              onMouseLeave={() => onPlaceHover(null)}
            >
              <MapPlaceCard
                place={place}
                isHighlighted={highlightedPlaceId === place.id}
                onClick={() => onPlaceSelect(place)}
              />
            </div>
          ))}
          
          {places.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No places to show
            </div>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
