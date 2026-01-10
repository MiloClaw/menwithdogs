import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  title: string;
  body: string | null;
  city_id: string;
  place_id: string | null;
  external_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_recurring: boolean;
  recurrence_text: string | null;
  created_at: string;
  updated_at: string;
  city: {
    id: string;
    name: string;
    state: string | null;
  } | null;
  place: {
    id: string;
    name: string;
    primary_category: string;
  } | null;
  tags: {
    interest_id: string;
    interest: {
      id: string;
      label: string;
      category_id: string;
    };
  }[];
}

export interface BlogFilters {
  cityId?: string;
  interestIds?: string[];
  limit?: number;
  offset?: number;
}

export const useBlogPosts = (filters: BlogFilters = {}) => {
  const { limit = 20, offset = 0, cityId, interestIds } = filters;

  return useQuery({
    queryKey: ["blog-posts", { cityId, interestIds, limit, offset }],
    queryFn: async () => {
      // Build the base query for published announcements
      let query = supabase
        .from("posts")
        .select(`
          id,
          title,
          body,
          city_id,
          place_id,
          external_url,
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
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply city filter
      if (cityId) {
        query = query.eq("city_id", cityId);
      }

      const { data: posts, error } = await query;

      if (error) throw error;
      if (!posts) return [];

      // Fetch tags for all posts
      const postIds = posts.map(p => p.id);
      const { data: tagsData, error: tagsError } = await supabase
        .from("post_tags")
        .select(`
          post_id,
          interest_id,
          interest:interests!post_tags_interest_id_fkey(id, label, category_id)
        `)
        .in("post_id", postIds);

      if (tagsError) throw tagsError;

      // Group tags by post_id
      const tagsByPost = (tagsData || []).reduce((acc, tag) => {
        if (!acc[tag.post_id]) acc[tag.post_id] = [];
        acc[tag.post_id].push({
          interest_id: tag.interest_id,
          interest: tag.interest as { id: string; label: string; category_id: string }
        });
        return acc;
      }, {} as Record<string, BlogPost["tags"]>);

      // Combine posts with their tags
      let result: BlogPost[] = posts.map(post => ({
        ...post,
        city: post.city as BlogPost["city"],
        place: post.place as BlogPost["place"],
        tags: tagsByPost[post.id] || []
      }));

      // Apply interest filter client-side (after fetching tags)
      if (interestIds && interestIds.length > 0) {
        result = result.filter(post => 
          post.tags.some(tag => interestIds.includes(tag.interest_id))
        );
      }

      return result;
    },
  });
};

// Hook to manage post tags (for admin)
export const usePostTags = (postId: string | null) => {
  return useQuery({
    queryKey: ["post-tags", postId],
    queryFn: async () => {
      if (!postId) return [];
      
      const { data, error } = await supabase
        .from("post_tags")
        .select(`
          id,
          interest_id,
          interest:interests!post_tags_interest_id_fkey(id, label, category_id)
        `)
        .eq("post_id", postId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!postId,
  });
};
