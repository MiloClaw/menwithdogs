import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Trail, DIFFICULTY_COLORS, getDifficultyLabel, TrailDifficulty } from '@/lib/trail-data';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Footprints, Mountain, Ruler, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTrailFavorites } from '@/hooks/useTrailFavorites';

interface TrailListPanelProps {
  trails: Trail[];
  parkId: string;
  onTrailSelect: (trail: Trail) => void;
  selectedTrailId?: string | null;
  highlightedTrailId?: string | null;
  onTrailHover?: (trailId: string | null) => void;
}

interface DifficultyFilterChipProps {
  difficulty: TrailDifficulty;
  selected: boolean;
  onClick: () => void;
}

const DifficultyFilterChip = ({ difficulty, selected, onClick }: DifficultyFilterChipProps) => {
  const colors = DIFFICULTY_COLORS[difficulty];
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-sm font-medium transition-all min-h-[36px]",
        "border-2",
        selected 
          ? `${colors.bg} ${colors.text} ${colors.border}` 
          : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
      )}
    >
      {getDifficultyLabel(difficulty)}
    </button>
  );
};

interface TrailCardProps {
  trail: Trail;
  parkId: string;
  onClick: () => void;
  isSelected: boolean;
  isHighlighted: boolean;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  cardRef: (el: HTMLButtonElement | null) => void;
}

const TrailCard = ({ 
  trail, 
  parkId, 
  onClick, 
  isSelected, 
  isHighlighted,
  isFavorited, 
  onToggleFavorite,
  onMouseEnter,
  onMouseLeave,
  cardRef,
}: TrailCardProps) => {
  const difficultyColors = DIFFICULTY_COLORS[trail.difficulty];
  const [imageError, setImageError] = useState(false);
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  };
  
  return (
    <button
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "w-full text-left rounded-lg border transition-all overflow-hidden relative",
        "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-green/50",
        isSelected 
          ? "border-brand-green bg-brand-green/5 ring-2 ring-brand-green/30" 
          : isHighlighted
          ? "border-amber-400 bg-amber-50/50"
          : "border-border bg-card"
      )}
    >
      {/* Save Button */}
      <button
        onClick={handleFavoriteClick}
        className={cn(
          "absolute top-2 right-2 z-10 p-2 rounded-full shadow-sm transition-colors",
          isFavorited
            ? "bg-destructive hover:bg-destructive/90"
            : "bg-white/90 hover:bg-white"
        )}
        aria-label={isFavorited ? "Remove from saved" : "Save trail"}
      >
        <Heart 
          className={cn(
            "w-4 h-4 transition-colors",
            isFavorited 
              ? "fill-white text-white" 
              : "text-muted-foreground"
          )}
        />
      </button>
      
      {/* Trail Photo or Fallback */}
      {trail.photoUrl && !imageError ? (
        <div className="relative h-32 w-full">
          <img 
            src={trail.photoUrl} 
            alt={trail.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          {/* Difficulty badge overlay */}
          <span className={cn(
            "absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
            difficultyColors.bg,
            difficultyColors.text
          )}>
            {getDifficultyLabel(trail.difficulty)}
          </span>
        </div>
      ) : (
        <div className="relative h-24 w-full bg-gradient-to-br from-brand-green/20 to-brand-green/5 flex items-center justify-center">
          <Footprints className="w-8 h-8 text-brand-green/40" />
          {/* Difficulty badge overlay */}
          <span className={cn(
            "absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
            difficultyColors.bg,
            difficultyColors.text
          )}>
            {getDifficultyLabel(trail.difficulty)}
          </span>
        </div>
      )}
      
      {/* Card Content */}
      <div className="p-4">
        <h4 className="font-semibold text-foreground leading-tight mb-1.5 truncate">
          {trail.name}
        </h4>
        
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Ruler className="w-3 h-3" />
            {trail.distance} mi{trail.isLoop ? ' loop' : ''}
          </span>
          
          {trail.elevationGain && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Mountain className="w-3 h-3" />
              {trail.elevationGain.toLocaleString()} ft
            </span>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {trail.description}
        </p>
      </div>
    </button>
  );
};

export const TrailListPanel = ({ 
  trails, 
  parkId, 
  onTrailSelect, 
  selectedTrailId,
  highlightedTrailId,
  onTrailHover,
}: TrailListPanelProps) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Set<TrailDifficulty>>(
    new Set(['easy', 'moderate', 'strenuous'])
  );
  const { isFavorited, toggleFavorite } = useTrailFavorites();
  
  // Refs for scrolling to cards
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  
  const setCardRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) {
      cardRefs.current.set(id, el);
    } else {
      cardRefs.current.delete(id);
    }
  }, []);
  
  // Scroll to selected card when it changes (from map marker click)
  useEffect(() => {
    if (selectedTrailId && cardRefs.current.has(selectedTrailId)) {
      const card = cardRefs.current.get(selectedTrailId);
      if (card) {
        // Open the panel if collapsed
        if (!isOpen) {
          setIsOpen(true);
        }
        // Scroll the card into view with some padding
        setTimeout(() => {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [selectedTrailId, isOpen]);
  
  const toggleDifficulty = (difficulty: TrailDifficulty) => {
    setSelectedDifficulties(prev => {
      const next = new Set(prev);
      if (next.has(difficulty)) {
        if (next.size > 1) {
          next.delete(difficulty);
        }
      } else {
        next.add(difficulty);
      }
      return next;
    });
  };
  
  const filteredTrails = useMemo(() => 
    trails.filter(t => selectedDifficulties.has(t.difficulty)),
    [trails, selectedDifficulties]
  );
  
  const trailCountByDifficulty = useMemo(() => ({
    easy: trails.filter(t => t.difficulty === 'easy').length,
    moderate: trails.filter(t => t.difficulty === 'moderate').length,
    strenuous: trails.filter(t => t.difficulty === 'strenuous').length,
  }), [trails]);

  if (trails.length === 0) {
    return null;
  }
  
  return (
    <section className="bg-card border-t border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-between p-4 h-auto hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Footprints className="w-5 h-5 text-brand-green" />
              <span className="font-semibold">Featured Trails</span>
              <span className="text-sm text-muted-foreground">
                ({filteredTrails.length} of {trails.length})
              </span>
            </div>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            {/* Difficulty Filter Chips */}
            <div className="flex flex-wrap gap-2">
              {(['easy', 'moderate', 'strenuous'] as const).map(difficulty => (
                <DifficultyFilterChip
                  key={difficulty}
                  difficulty={difficulty}
                  selected={selectedDifficulties.has(difficulty)}
                  onClick={() => toggleDifficulty(difficulty)}
                />
              ))}
              
              {/* Stats summary */}
              <div className="flex-1 flex items-center justify-end">
                <span className="text-xs text-muted-foreground">
                  {trailCountByDifficulty.easy} easy · {trailCountByDifficulty.moderate} mod · {trailCountByDifficulty.strenuous} hard
                </span>
              </div>
            </div>
            
            {/* Trail List */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTrails.map(trail => (
                <TrailCard
                  key={trail.id}
                  trail={trail}
                  parkId={parkId}
                  onClick={() => onTrailSelect(trail)}
                  isSelected={selectedTrailId === trail.id}
                  isHighlighted={highlightedTrailId === trail.id}
                  isFavorited={isFavorited(trail.id)}
                  onToggleFavorite={() => toggleFavorite(trail.id, parkId)}
                  onMouseEnter={() => onTrailHover?.(trail.id)}
                  onMouseLeave={() => onTrailHover?.(null)}
                  cardRef={(el) => setCardRef(trail.id, el)}
                />
              ))}
            </div>
            
            {filteredTrails.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No trails match your selected difficulty levels.
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
};
