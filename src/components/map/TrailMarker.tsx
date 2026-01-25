import { Trail, DIFFICULTY_COLORS, getDifficultyLabel } from '@/lib/trail-data';
import { Footprints, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TrailMarkerPopupContentProps {
  trail: Trail;
}

export const TrailMarkerPopupContent = ({ trail }: TrailMarkerPopupContentProps) => {
  const difficultyStyle = DIFFICULTY_COLORS[trail.difficulty];
  
  return `
    <div class="p-3 min-w-[220px] max-w-[280px]">
      <div class="flex items-start gap-2 mb-2">
        <div class="flex-shrink-0 p-1.5 rounded-full bg-brand-green/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--brand-green))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/>
            <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/>
            <path d="M16 17h4"/>
            <path d="M4 13h4"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-sm text-foreground leading-tight">${trail.name}</h3>
        </div>
      </div>
      
      <div class="flex flex-wrap gap-1.5 mb-2">
        <span class="text-xs px-2 py-0.5 rounded-full ${difficultyStyle.bg} ${difficultyStyle.text}">
          ${getDifficultyLabel(trail.difficulty)}
        </span>
        <span class="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          ${trail.distance} mi${trail.isLoop ? ' loop' : ''}
        </span>
        ${trail.elevationGain ? `
          <span class="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            ↑ ${trail.elevationGain.toLocaleString()} ft
          </span>
        ` : ''}
      </div>
      
      <p class="text-xs text-muted-foreground leading-relaxed">
        ${trail.description}
      </p>
    </div>
  `;
};

// Create the marker element for a trailhead
export function createTrailheadMarkerElement(): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'trailhead-marker cursor-pointer transition-transform hover:scale-110';
  el.innerHTML = `
    <div class="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-brand-green">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(142 43% 30%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/>
        <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/>
        <path d="M16 17h4"/>
        <path d="M4 13h4"/>
      </svg>
    </div>
  `;
  return el;
}
