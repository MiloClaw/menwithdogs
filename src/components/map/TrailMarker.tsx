import { Trail, TrailDifficulty, DIFFICULTY_COLORS, getDifficultyLabel, getTrailImage, TrailImage } from '@/lib/trail-data';

// Difficulty-based border colors (hex values for HTML elements)
const DIFFICULTY_BORDER_COLORS: Record<TrailDifficulty, string> = {
  easy: '#10b981',      // emerald-500
  moderate: '#f59e0b',  // amber-500
  strenuous: '#ef4444', // red-500
};

const DIFFICULTY_BG_COLORS: Record<TrailDifficulty, string> = {
  easy: 'rgba(16, 185, 129, 0.1)',
  moderate: 'rgba(245, 158, 11, 0.1)',
  strenuous: 'rgba(239, 68, 68, 0.1)',
};

interface TrailMarkerPopupContentProps {
  trail: Trail;
  parkId: string;
}

export const TrailMarkerPopupContent = ({ trail, parkId }: TrailMarkerPopupContentProps) => {
  const difficultyStyle = DIFFICULTY_COLORS[trail.difficulty];
  const [lng, lat] = trail.trailhead;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  
  // Format distance label
  const distanceLabel = trail.isLoop 
    ? `${trail.distance} mi loop` 
    : `${trail.distance} mi out & back`;
  
  // Get trail image with park fallback
  const trailImage = getTrailImage(trail, parkId);
  
  // Photo HTML if available
  const photoHtml = trailImage 
    ? `<div class="relative -m-3 mb-2">
        <img src="${trailImage.url}" alt="${trail.name}" class="w-full h-28 object-cover rounded-t-lg" loading="lazy" onerror="this.style.display='none'" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-t-lg"></div>
        <span class="absolute bottom-1 right-1 text-[10px] text-white/70 bg-black/30 px-1.5 py-0.5 rounded">${trailImage.credit}</span>
      </div>`
    : '';

  return `
    <div class="p-3 min-w-[220px] max-w-[280px]">
      ${photoHtml}
      
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

// Lightweight hover tooltip content (desktop only)
export const TrailHoverTooltipContent = ({ trail }: TrailMarkerPopupContentProps) => {
  const distanceLabel = trail.isLoop 
    ? `${trail.distance} mi loop` 
    : `${trail.distance} mi`;

  return `
    <div class="px-3 py-2 min-w-[140px]">
      <p class="font-semibold text-sm text-foreground leading-tight mb-1">${trail.name}</p>
      <p class="text-xs text-muted-foreground">${distanceLabel} · ${getDifficultyLabel(trail.difficulty)}</p>
    </div>
  `;
};

// Create the marker element for a trailhead with difficulty-based coloring
// Using 44px touch target for mobile accessibility (WCAG guidelines)
export function createTrailheadMarkerElement(
  difficulty: TrailDifficulty = 'moderate',
  isActive = false
): HTMLDivElement {
  const el = document.createElement('div');
  el.className = `trailhead-marker cursor-pointer transition-all duration-200 ${isActive ? 'scale-125' : 'hover:scale-110'}`;
  
  const borderColor = DIFFICULTY_BORDER_COLORS[difficulty];
  const bgColor = DIFFICULTY_BG_COLORS[difficulty];
  
  // Active state uses amber highlight
  const activeBorderStyle = isActive 
    ? `border-color: #f59e0b; box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2);`
    : `border-color: ${borderColor};`;
  
  // Icon color matches difficulty
  const iconColor = isActive ? '#f59e0b' : borderColor;
  
  el.innerHTML = `
    <div 
      class="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md transition-all duration-200"
      style="border: 2.5px solid; ${activeBorderStyle}"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/>
        <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/>
        <path d="M16 17h4"/>
        <path d="M4 13h4"/>
      </svg>
    </div>
  `;
  return el;
}

// Update marker element to show active/highlighted state
export function updateMarkerActiveState(
  el: HTMLDivElement,
  difficulty: TrailDifficulty,
  isActive: boolean
): void {
  const borderColor = DIFFICULTY_BORDER_COLORS[difficulty];
  const innerDiv = el.querySelector('div') as HTMLDivElement;
  const svg = el.querySelector('svg') as SVGElement;
  
  if (!innerDiv || !svg) return;
  
  if (isActive) {
    el.classList.add('scale-125');
    el.classList.remove('hover:scale-110');
    innerDiv.style.borderColor = '#f59e0b';
    innerDiv.style.boxShadow = '0 0 0 4px rgba(245, 158, 11, 0.2)';
    svg.style.stroke = '#f59e0b';
  } else {
    el.classList.remove('scale-125');
    el.classList.add('hover:scale-110');
    innerDiv.style.borderColor = borderColor;
    innerDiv.style.boxShadow = '';
    svg.style.stroke = borderColor;
  }
}
