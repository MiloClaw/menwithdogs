import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TagPage {
  id: string;
  tag_slug: string;
  title: string;
  subtitle: string | null;
  body_markdown: string;
  external_link_url: string | null;
  external_link_label: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  canonical_tags: {
    label: string;
    category: string;
    is_sensitive: boolean;
  };
}

export function useTagPage(slug: string | undefined) {
  return useQuery({
    queryKey: ['tag-page', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('tag_pages')
        .select('*, canonical_tags!inner(label, category, is_sensitive)')
        .eq('tag_slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      return data as TagPage | null;
    },
    enabled: !!slug,
  });
}

/**
 * Fetch places that have this tag applied
 */
export function usePlacesWithTag(tagSlug: string | undefined) {
  return useQuery({
    queryKey: ['places-with-tag', tagSlug],
    queryFn: async () => {
      if (!tagSlug) return [];
      
      const { data, error } = await supabase
        .from('place_niche_tags')
        .select(`
          place_id,
          places!inner(
            id, name, city, state, 
            google_primary_type_display,
            stored_photo_urls,
            rating
          )
        `)
        .eq('tag', tagSlug)
        .limit(12);

      if (error) throw error;
      return data?.map(d => d.places) ?? [];
    },
    enabled: !!tagSlug,
  });
}
