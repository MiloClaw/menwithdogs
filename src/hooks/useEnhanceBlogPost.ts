import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EnhancedContent {
  slug: string;
  excerpt: string;
  meta_description: string;
  formatted_body: string;
}

export interface EnhanceRequest {
  title: string;
  body: string;
  city_name?: string;
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

      toast.success('Content enhanced successfully');
      return data as EnhancedContent;

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
