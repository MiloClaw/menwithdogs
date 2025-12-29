/**
 * Interest type definitions
 * 
 * Interests are now stored in the database (interest_categories and interests tables).
 * This file provides TypeScript types and utility functions.
 */

/**
 * Google Places mapping for an interest
 */
export interface GoogleMapping {
  type: string;
  weight: number;
  keyword?: string;
}

/**
 * Interest category
 */
export type InterestCategoryId = 'social' | 'outdoor' | 'food' | 'culture' | 'wellness' | 'games';

/**
 * Interest from database
 */
export interface Interest {
  id: string;
  label: string;
  category_id: InterestCategoryId;
  google_mappings: GoogleMapping[];
  is_active: boolean;
  sort_order: number;
}

/**
 * Interest category from database
 */
export interface InterestCategory {
  id: InterestCategoryId;
  label: string;
  sort_order: number;
  icon: string | null;
}
