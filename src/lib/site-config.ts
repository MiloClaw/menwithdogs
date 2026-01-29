// Site-wide configuration for canonical URLs and metadata
// This is the single source of truth for the canonical domain

export const SITE_CONFIG = {
  // Canonical domain - used for all SEO, OG, and sitemap URLs
  canonicalDomain: 'https://thicktimber.com',
  
  // Site name for titles
  siteName: 'ThickTimber',
  
  // Default OG image path (relative to canonical domain)
  defaultOgImage: '/og-hero.jpg',
  
  // Build full canonical URL from path
  getCanonicalUrl: (path: string): string => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `https://thicktimber.com${cleanPath}`;
  },
  
  // Build full OG image URL
  getOgImageUrl: (imagePath?: string): string => {
    const path = imagePath || '/og-hero.jpg';
    if (path.startsWith('http')) {
      return path;
    }
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `https://thicktimber.com${cleanPath}`;
  }
} as const;
