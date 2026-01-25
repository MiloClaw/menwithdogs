import { useState, useMemo } from 'react';
import { Trail, DIFFICULTY_COLORS, getDifficultyLabel } from '@/lib/trail-data';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Footprints, Mountain, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsMobile } from '@/hooks/use-mobile';

type TrailDifficulty = 'easy' | 'moderate' | 'strenuous';

interface TrailListPanelProps {
  trails: Trail[];
  onTrailSelect: (trail: Trail) => void;
  selectedTrailId?: string;
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
  onClick: () => void;
  isSelected: boolean;
}

const TrailCard = ({ trail, onClick, isSelected }: TrailCardProps) => {
  const difficultyColors = DIFFICULTY_COLORS[trail.difficulty];
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-lg border transition-all",
        "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-green/50",
        isSelected 
          ? "border-brand-green bg-brand-green/5" 
          : "border-border bg-card"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground leading-tight mb-1.5 truncate">
            {trail.name}
          </h4>
          
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
              difficultyColors.bg,
              difficultyColors.text
            )}>
              {getDifficultyLabel(trail.difficulty)}
            </span>
            
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
        
        <div className="flex-shrink-0 p-2 rounded-full bg-brand-green/10">
          <Footprints className="w-4 h-4 text-brand-green" />
        </div>
      </div>
    </button>
  );
};

export const TrailListPanel = ({ trails, onTrailSelect, selectedTrailId }: TrailListPanelProps) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Set<TrailDifficulty>>(
    new Set(['easy', 'moderate', 'strenuous'])
  );
  
  const toggleDifficulty = (difficulty: TrailDifficulty) => {
    setSelectedDifficulties(prev => {
      const next = new Set(prev);
      if (next.has(difficulty)) {
        // Don't allow deselecting all
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
                  onClick={() => onTrailSelect(trail)}
                  isSelected={selectedTrailId === trail.id}
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
