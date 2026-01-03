/**
 * Editorial filters map user-friendly labels to existing taxonomy fields.
 * These provide a curated discovery layer without exposing raw technical filters.
 */

export interface EditorialFilter {
  id: string;
  label: string;
  // Place matching criteria
  placeCategories?: string[];
  // Event matching criteria
  eventTypes?: string[];
  socialEnergyMax?: number;
  socialEnergyMin?: number;
  // Reuse existing date filter
  dateFilter?: 'today' | 'this_week' | 'this_month' | 'upcoming';
}

export const EDITORIAL_FILTERS: EditorialFilter[] = [
  {
    id: 'date_night',
    label: 'Date Night',
    placeCategories: ['Restaurant', 'Bar', 'Wine Bar', 'Cocktail Bar', 'Italian Restaurant', 'French Restaurant'],
    eventTypes: ['food_drink', 'entertainment'],
  },
  {
    id: 'chill_vibes',
    label: 'Chill Vibes',
    socialEnergyMax: 2,
    placeCategories: ['Coffee Shop', 'Cafe', 'Bookstore', 'Tea House'],
  },
  {
    id: 'active',
    label: 'Get Active',
    placeCategories: ['Park', 'Trail', 'Gym', 'Fitness Center', 'Hiking Trail'],
    eventTypes: ['fitness', 'outdoor'],
  },
  {
    id: 'this_weekend',
    label: 'This Weekend',
    dateFilter: 'this_week',
  },
  {
    id: 'free',
    label: 'Free Things',
    eventTypes: ['community', 'outdoor'],
    placeCategories: ['Park', 'Beach', 'Trail', 'Public Garden'],
  },
];

/**
 * Check if a place matches an editorial filter
 */
export const placeMatchesFilter = (
  place: { primary_category: string },
  filter: EditorialFilter
): boolean => {
  if (!filter.placeCategories || filter.placeCategories.length === 0) {
    return true; // No place criteria = matches all places
  }
  
  return filter.placeCategories.some(cat => 
    place.primary_category.toLowerCase().includes(cat.toLowerCase())
  );
};

/**
 * Check if an event matches an editorial filter
 */
export const eventMatchesFilter = (
  event: { 
    event_type?: string | null; 
    social_energy_level?: number | null;
    cost_type?: string | null;
  },
  filter: EditorialFilter
): boolean => {
  // Check event type
  if (filter.eventTypes && filter.eventTypes.length > 0) {
    if (!event.event_type || !filter.eventTypes.includes(event.event_type)) {
      return false;
    }
  }
  
  // Check social energy max
  if (filter.socialEnergyMax !== undefined && event.social_energy_level) {
    if (event.social_energy_level > filter.socialEnergyMax) {
      return false;
    }
  }
  
  // Check social energy min
  if (filter.socialEnergyMin !== undefined && event.social_energy_level) {
    if (event.social_energy_level < filter.socialEnergyMin) {
      return false;
    }
  }
  
  // Check for free filter (match free cost type)
  if (filter.id === 'free' && event.cost_type !== 'free') {
    return false;
  }
  
  return true;
};
