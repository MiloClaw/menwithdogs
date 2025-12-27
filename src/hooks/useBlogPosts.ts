import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string;
  hero_image_url: string | null;
  author: string;
  reading_time: number;
  published_at: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export const useBlogPosts = (category?: string) => {
  return useQuery({
    queryKey: ["blog-posts", category],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("*")
        .order("published_at", { ascending: false });

      if (category && category !== "All") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as BlogPost[];
    },
  });
};

export const useBlogPost = (slug: string) => {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data as BlogPost | null;
    },
    enabled: !!slug,
  });
};

export const useRelatedPosts = (currentSlug: string, category: string, limit = 3) => {
  return useQuery({
    queryKey: ["related-posts", currentSlug, category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("category", category)
        .neq("slug", currentSlug)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as BlogPost[];
    },
    enabled: !!currentSlug && !!category,
  });
};

export const useFeaturedPost = () => {
  return useQuery({
    queryKey: ["featured-post"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_featured", true)
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as BlogPost | null;
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("category");

      if (error) throw error;
      
      const uniqueCategories = [...new Set(data.map(p => p.category))];
      return ["All", ...uniqueCategories.sort()];
    },
  });
};