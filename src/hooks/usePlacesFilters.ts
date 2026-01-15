import { useState, useCallback, useMemo } from 'react';

// Named constant for max radius (Priority 5)
export const MAX_RADIUS_MILES = 100;

export const RADIUS_OPTIONS = [
  { label: 'All', value: null },
  { label: '10 mi', value: 10 },
  { label: '25 mi', value: 25 },
  { label: '50 mi', value: 50 },
] as const;

export type RadiusValue = typeof RADIUS_OPTIONS[number]['value'];

interface UsePlacesFiltersReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  radiusFilter: RadiusValue;
  setRadiusFilter: (radius: RadiusValue) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
}

/**
 * Extracted filter state and logic for the Places page.
 * Centralizes filter state management for cleaner component code.
 */
export function usePlacesFilters(): UsePlacesFiltersReturn {
  const [searchTerm, setSearchTerm] = useState('');
  const [radiusFilter, setRadiusFilter] = useState<RadiusValue>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const hasActiveFilters = useMemo(() => {
    return !!(searchTerm || selectedCategory || radiusFilter);
  }, [searchTerm, selectedCategory, radiusFilter]);

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory(null);
    setRadiusFilter(null);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    radiusFilter,
    setRadiusFilter,
    selectedCategory,
    setSelectedCategory,
    hasActiveFilters,
    clearAllFilters,
  };
}
