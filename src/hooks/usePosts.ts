import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Explicit columns for public queries (excludes created_by to hide admin UUIDs)
const PUBLIC_POST_COLUMNS = `
  id, type, title, body, city_id, place_id, 
  start_date, end_date, is_recurring, recurrence_text, 
  external_url, status, created_at, updated_at,
  city:cities(id, name, state),
  place:places(id, name, formatted_address, city, website_url)
`;

export interface Post {
  id: string;
  type: 'announcement' | 'event';
  title: string;
  body: string | null;
  city_id: string;
  place_id: string | null;
  start_date: string | null;
  end_date: string | null;
  is_recurring: boolean;
  recurrence_text: string | null;
  external_url: string | null;
  cover_image_url?: string | null;
  status: 'draft' | 'published' | 'expired';
  created_at: string;
  updated_at: string;
  created_by?: string | null; // Optional - only present in admin queries
  // Joined data
  city?: { id: string; name: string; state: string | null };
  place?: { id: string; name: string; formatted_address: string | null; city: string | null; website_url: string | null };
  tags?: { interest_id: string; interest: { id: string; label: string; category_id: string } }[];
}

export interface PostInsert {
  type: 'announcement' | 'event';
  title: string;
  body?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  meta_description?: string | null;
  city_id: string;
  place_id?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_recurring?: boolean;
  recurrence_text?: string | null;
  external_url?: string | null;
  cover_image_url?: string | null;
  status?: 'draft' | 'published' | 'expired';
}

export interface PostUpdate extends Partial<PostInsert> {
  id: string;
}

// Sync post tags - replaces all with new selection
export async function syncPostTags(postId: string, interestIds: string[]): Promise<void> {
  // Delete existing tags
  const { error: deleteError } = await supabase
    .from('post_tags')
    .delete()
    .eq('post_id', postId);

  if (deleteError) throw deleteError;

  // Insert new tags
  if (interestIds.length > 0) {
    const rows = interestIds.map(interest_id => ({
      post_id: postId,
      interest_id,
    }));

    const { error: insertError } = await supabase
      .from('post_tags')
      .insert(rows);

    if (insertError) throw insertError;
  }
}

// Hook to fetch post tags for a specific post
export function usePostTags(postId: string | null) {
  return useQuery({
    queryKey: ['post-tags', postId],
    queryFn: async () => {
      if (!postId) return [];
      
      const { data, error } = await supabase
        .from('post_tags')
        .select(`
          id,
          interest_id,
          interest:interests(id, label, category_id)
        `)
        .eq('post_id', postId);

      if (error) throw error;
      return (data || []).map(d => d.interest_id);
    },
    enabled: !!postId,
  });
}

// Admin: Fetch all posts (for management)
export const useAdminPosts = (statusFilter?: string) => {
  return useQuery({
    queryKey: ["admin-posts", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select(`
          *,
          city:cities(id, name, state),
          place:places(id, name, formatted_address, city, website_url)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Post[];
    },
  });
};

// Public: Fetch published announcements for a city (for "What's Happening" section)
// Note: Events now come from the events table via useCityEvents hook
export const useCityPosts = (cityId: string | null) => {
  return useQuery({
    queryKey: ["posts", "city", cityId],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("posts")
        .select(PUBLIC_POST_COLUMNS) // Explicit columns - no created_by
        .eq("city_id", cityId!)
        .eq("status", "published")
        .eq("type", "announcement") // Only announcements - events come from events table
        .or(`end_date.is.null,end_date.gt.${now}`)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as Post[];
    },
    enabled: !!cityId,
  });
};

// Public: Fetch published announcements for a city by city name (lookup first)
// Note: Events now come from the events table via useCityEvents hook
export const useCityPostsByName = (cityName: string | null, state: string | null) => {
  return useQuery({
    queryKey: ["posts", "city-name", cityName, state],
    queryFn: async () => {
      // First look up the city
      let cityQuery = supabase
        .from("cities")
        .select("id")
        .eq("name", cityName!)
        .eq("status", "launched");
      
      if (state) {
        cityQuery = cityQuery.eq("state", state);
      }
      
      const { data: cities, error: cityError } = await cityQuery.limit(1).maybeSingle();
      
      if (cityError || !cities) return [];
      
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("posts")
        .select(PUBLIC_POST_COLUMNS) // Explicit columns - no created_by
        .eq("city_id", cities.id)
        .eq("status", "published")
        .eq("type", "announcement") // Only announcements - events come from events table
        .or(`end_date.is.null,end_date.gt.${now}`)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as Post[];
    },
    enabled: !!cityName,
  });
};

// DEPRECATED: Events now come from the events table
// This hook is kept for backward compatibility but should not be used for new code
// Use usePlaceEvents from useCityEvents.ts instead
export const usePlaceEventsLegacy = (placeId: string | null) => {
  return useQuery({
    queryKey: ["posts", "place", placeId, "legacy"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("posts")
        .select(`
          id, type, title, body, city_id, place_id, 
          start_date, end_date, is_recurring, recurrence_text, 
          external_url, status, created_at, updated_at
        `)
        .eq("place_id", placeId!)
        .eq("type", "event")
        .eq("status", "published")
        .or(`end_date.is.null,end_date.gt.${now}`)
        .order("start_date", { ascending: true })
        .limit(5);

      if (error) throw error;
      return data as Post[];
    },
    enabled: !!placeId,
  });
};

// Public: Fetch published announcements for a specific place
// Note: Events now come from the events table via usePlaceEvents hook
export const usePlacePosts = (placeId: string | null) => {
  return useQuery({
    queryKey: ["posts", "place-all", placeId],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("posts")
        .select(`
          id, type, title, body, city_id, place_id, 
          start_date, end_date, is_recurring, recurrence_text, 
          external_url, status, created_at, updated_at
        `)
        .eq("place_id", placeId!)
        .eq("status", "published")
        .eq("type", "announcement") // Only announcements - events come from events table
        .or(`end_date.is.null,end_date.gt.${now}`)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as Post[];
    },
    enabled: !!placeId,
  });
};

// Admin: Create a post
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: PostInsert) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("posts")
        .insert({
          ...post,
          created_by: userData?.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// Admin: Update a post
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: PostUpdate) => {
      const { data, error } = await supabase
        .from("posts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// Admin: Delete a post
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};
