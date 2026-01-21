/**
 * Image optimization utilities for MainStreetIRL
 * 
 * Phase 1: Provides constants and helpers for image handling
 * Phase 2: Will add Supabase image transformation support (pending plan verification)
 */

// Standard image dimensions for consistent layout
export const IMAGE_DIMENSIONS = {
  card: { width: 400, height: 300 },      // 4:3 aspect for place cards
  modal: { width: 800, height: 450 },     // 16:9 aspect for modal gallery
  hero: { width: 1920, height: 560 },     // Hero banner
  thumbnail: { width: 200, height: 150 }, // Small thumbnails
} as const;

/**
 * Get optimized image URL with transformation parameters.
 * 
 * Currently returns original URL (Phase 1).
 * Phase 2: Will add Supabase render/image transformations if available.
 * 
 * @param originalUrl - The stored image URL
 * @param options - Optional transformation parameters
 * @returns The optimized image URL (or original if transformations unavailable)
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  options?: { 
    width?: number; 
    height?: number;
    quality?: number;
  }
): string {
  // Phase 1: Return original URL
  // Supabase image transformations require Pro plan verification
  // Once verified, this function will transform URLs to use /render/image/ endpoint
  
  if (!originalUrl) return originalUrl;
  
  // TODO Phase 2: Enable once Supabase image transformations are verified
  // Example transformation URL:
  // https://[project].supabase.co/storage/v1/render/image/public/couple-photos/...?width=400&quality=80
  
  return originalUrl;
}

/**
 * Generate srcset for responsive images
 * 
 * @param baseUrl - The base image URL
 * @param sizes - Array of widths to generate
 * @returns srcset string for responsive loading
 */
export function generateSrcSet(
  baseUrl: string,
  sizes: number[] = [400, 800, 1200]
): string {
  // Phase 1: Return empty string (no srcset transformation yet)
  // Phase 2: Will generate proper srcset with Supabase transformations
  return '';
}
