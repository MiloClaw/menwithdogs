// Trail Blazer application options - structured signal definitions

export const ROLE_TYPES = [
  { value: 'writer_blogger', label: 'Writer / Blogger' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'guide_educator', label: 'Guide / Outdoor Educator' },
  { value: 'researcher_naturalist', label: 'Researcher / Naturalist' },
  { value: 'athlete_endurance', label: 'Athlete / Endurance Specialist' },
  { value: 'travel_exploration', label: 'Travel / Exploration Writer' },
  { value: 'other', label: 'Other' },
] as const;

export const EXPERTISE_AREAS = [
  { value: 'hiking_trails', label: 'Hiking & trail systems' },
  { value: 'camping_backcountry', label: 'Camping & backcountry sites' },
  { value: 'beaches_water', label: 'Beaches, swimming holes, coastal access' },
  { value: 'trail_running', label: 'Trail running & endurance' },
  { value: 'cycling', label: 'Cycling (road / gravel / mountain)' },
  { value: 'overland_remote', label: 'Overland & remote access' },
  { value: 'urban_outdoor', label: 'Urban outdoor spaces & parks' },
  { value: 'other', label: 'Other' },
] as const;

export const CONTENT_TYPES = [
  { value: 'article_essay', label: 'Article / Essay' },
  { value: 'guide_resource', label: 'Guide / Resource' },
  { value: 'photography', label: 'Photography' },
  { value: 'video_multimedia', label: 'Video / Multimedia' },
  { value: 'field_notes', label: 'Field Notes' },
  { value: 'other', label: 'Other' },
] as const;

export type RoleType = typeof ROLE_TYPES[number]['value'];
export type ExpertiseArea = typeof EXPERTISE_AREAS[number]['value'];
export type ContentType = typeof CONTENT_TYPES[number]['value'];

export interface PortfolioLink {
  url: string;
  contentType: ContentType;
  notes?: string;
}

export interface PlaceReference {
  googlePlaceId: string;
  placeName: string;
  formattedAddress?: string;
  placeTypes?: string[];
}

export interface Acknowledgements {
  placeFocus: boolean;
  linkReview: boolean;
  noPublicProfile: boolean;
  noPromotionRequired: boolean;
}
