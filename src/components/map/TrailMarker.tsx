import { Trail, DIFFICULTY_COLORS, getDifficultyLabel } from '@/lib/trail-data';

interface TrailMarkerPopupContentProps {
  trail: Trail;
}

export const TrailMarkerPopupContent = ({ trail }: TrailMarkerPopupContentProps) => {
  const difficultyStyle = DIFFICULTY_COLORS[trail.difficulty];
  const [lng, lat] = trail.trailhead;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  
  // Format distance label
  const distanceLabel = trail.isLoop 
    ? `${trail.distance} mi loop` 
    : `${trail.distance} mi out & back`;
  
  return `
    <div class="p-3 min-w-[220px] max-w-[280px]">
      <div class="flex items-start gap-2 mb-2">
        <div class="flex-shrink-0 p-1.5 rounded-full bg-emerald-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(147 43% 30%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
        <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          ${distanceLabel}
        </span>
        ${trail.elevationGain ? `
          <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            ↑ ${trail.elevationGain.toLocaleString()} ft
          </span>
        ` : ''}
      </div>
      
      <p class="text-xs text-slate-500 leading-relaxed mb-3">
        ${trail.description}
      </p>
      
      <a 
        href="${directionsUrl}" 
        target="_blank" 
        rel="noopener noreferrer"
        class="block w-full text-center px-3 py-2 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 transition-colors"
      >
        Get Directions
      </a>
    </div>
  `;
};

// Create the marker element for a trailhead
// Using 44px touch target for mobile accessibility (WCAG guidelines)
export function createTrailheadMarkerElement(isActive = false): HTMLDivElement {
  const el = document.createElement('div');
  el.className = `trailhead-marker cursor-pointer transition-all duration-200 ${isActive ? 'scale-125' : 'hover:scale-110'}`;
  
  const borderClass = isActive 
    ? 'border-amber-500 ring-4 ring-amber-500/20' 
    : 'border-emerald-600';
  
  el.innerHTML = `
    <div class="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md border-2 ${borderClass} transition-all duration-200">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(147 43% 30%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/>
        <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/>
        <path d="M16 17h4"/>
        <path d="M4 13h4"/>
      </svg>
    </div>
  `;
  return el;
}
