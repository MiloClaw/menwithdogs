import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BlogPost } from "./useBlogPosts";

export const useBlogPostBySlug = (slug: string | undefined) => {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data: post, error } = await supabase
        .from("posts")
        .select(`
          id,
          title,
          body,
          slug,
          excerpt,
          meta_description,
          city_id,
          place_id,
          external_url,
          cover_image_url,
          start_date,
          end_date,
          is_recurring,
          recurrence_text,
          created_at,
          updated_at,
          city:cities!posts_city_id_fkey(id, name, state),
          place:places!posts_place_id_fkey(id, name, primary_category)
        `)
        .eq("type", "announcement")
        .eq("status", "published")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (!post) return null;

      // Fetch tags for the post
      const { data: tagsData } = await supabase
        .from("post_tags")
        .select(`
          interest_id,
          interest:interests!post_tags_interest_id_fkey(id, label, category_id)
        `)
        .eq("post_id", post.id);

      return {
        ...post,
        city: post.city as BlogPost["city"],
        place: post.place as BlogPost["place"],
        tags: (tagsData || []).map(tag => ({
          interest_id: tag.interest_id,
          interest: tag.interest as { id: string; label: string; category_id: string }
        }))
      } as BlogPost & { slug: string | null; excerpt: string | null; meta_description: string | null };
    },
    enabled: !!slug,
  });
};
