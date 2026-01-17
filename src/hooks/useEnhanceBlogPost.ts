import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SuggestedPlace {
  name: string;
  context?: string;
  place_id?: string | null;
  matched_name?: string | null;
}

export interface MentionedArea {
  name: string;
  context?: string;
}

export interface AreaRelatedPlace {
  id: string;
  name: string;
  primary_category?: string;
}

export interface AreaWithPlaces {
  area_name: string;
  area_context?: string;
  places: AreaRelatedPlace[];
}

export interface EnhancedContent {
  slug: string;
  excerpt: string;
  meta_description: string;
  formatted_body: string;
  suggested_places?: SuggestedPlace[];
  mentioned_areas?: MentionedArea[];
  area_related_places?: AreaWithPlaces[];
  reading_time_minutes?: number;
  social_title?: string;
  cover_image_alt?: string;
  // Derived fields for UI
  matched_places?: SuggestedPlace[];
  unmatched_places?: SuggestedPlace[];
}

export interface EnhanceRequest {
  title: string;
  body: string;
  city_name?: string;
  city_id?: string;
  location_type?: 'city' | 'metro';
  geo_area_id?: string;
}

export function useEnhanceBlogPost() {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const enhancePost = async (request: EnhanceRequest): Promise<EnhancedContent | null> => {
    if (!request.title || !request.body) {
      toast.error('Title and body are required for AI enhancement');
      return null;
    }

    setIsEnhancing(true);

    try {
      const { data, error } = await supabase.functions.invoke('enhance-blog-post', {
        body: request
      });

      if (error) {
        console.error('Enhancement error:', error);
        toast.error(error.message || 'Failed to enhance post');
        return null;
      }

      if (data?.error) {
        toast.error(data.error);
        return null;
      }

      // Separate matched vs unmatched places
      const allPlaces = data?.suggested_places || [];
      const matchedPlaces = allPlaces.filter((p: SuggestedPlace) => p.place_id);
      const unmatchedPlaces = allPlaces.filter((p: SuggestedPlace) => !p.place_id);

      // Add derived fields to response
      const enhancedData: EnhancedContent = {
        ...data,
        matched_places: matchedPlaces,
        unmatched_places: unmatchedPlaces,
      };

      // Show success with place match info
      const totalPlaces = allPlaces.length;
      const areaPlacesCount = data?.area_related_places?.reduce(
        (sum: number, area: AreaWithPlaces) => sum + (area.places?.length || 0), 
        0
      ) || 0;
      const areasCount = data?.mentioned_areas?.length || 0;
      
      const parts: string[] = ['Content enhanced!'];
      if (matchedPlaces.length > 0) {
        parts.push(`Found ${matchedPlaces.length} places in directory.`);
      }
      if (unmatchedPlaces.length > 0) {
        parts.push(`${unmatchedPlaces.length} places need to be added.`);
      }
      if (areasCount > 0 && areaPlacesCount > 0) {
        parts.push(`${areaPlacesCount} venues found in ${areasCount} mentioned neighborhoods.`);
      }
      
      toast.success(parts.join(' '));
      
      return enhancedData;

    } catch (err) {
      console.error('Enhancement failed:', err);
      toast.error('Failed to enhance post. Please try again.');
      return null;
    } finally {
      setIsEnhancing(false);
    }
  };

  return {
    enhancePost,
    isEnhancing
  };
}
