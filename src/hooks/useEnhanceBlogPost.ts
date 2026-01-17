import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SuggestedPlace {
  name: string;
  context?: string;
  place_id?: string | null;
  matched_name?: string | null;
}

export interface EnhancedContent {
  slug: string;
  excerpt: string;
  meta_description: string;
  formatted_body: string;
  suggested_places?: SuggestedPlace[];
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
      
      if (totalPlaces > 0) {
        toast.success(
          `Content enhanced! Found ${matchedPlaces.length} places in directory` +
          (unmatchedPlaces.length > 0 ? `, ${unmatchedPlaces.length} need to be added.` : '.')
        );
      } else {
        toast.success('Content enhanced successfully');
      }
      
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
