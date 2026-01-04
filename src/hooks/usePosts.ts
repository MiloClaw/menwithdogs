import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  status: 'draft' | 'published' | 'expired';
  created_at: string;
  updated_at: string;
  created_by: string | null;
  // Joined data
  city?: { id: string; name: string; state: string | null };
  place?: { id: string; name: string; formatted_address: string | null; city: string | null; website_url: string | null };
}

export interface PostInsert {
  type: 'announcement' | 'event';
  title: string;
  body?: string | null;
  city_id: string;
  place_id?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_recurring?: boolean;
  recurrence_text?: string | null;
  external_url?: string | null;
  status?: 'draft' | 'published' | 'expired';
}

export interface PostUpdate extends Partial<PostInsert> {
  id: string;
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

// Public: Fetch published posts for a city (for "What's Happening" section)
export const useCityPosts = (cityId: string | null) => {
  return useQuery({
    queryKey: ["posts", "city", cityId],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          city:cities(id, name, state),
          place:places(id, name, formatted_address, city, website_url)
        `)
        .eq("city_id", cityId!)
        .eq("status", "published")
        .or(`end_date.is.null,end_date.gt.${now}`)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as Post[];
    },
    enabled: !!cityId,
  });
};

// Public: Fetch published posts for a city by city name (lookup first)
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
        .select(`
          *,
          city:cities(id, name, state),
          place:places(id, name, formatted_address, city, website_url)
        `)
        .eq("city_id", cities.id)
        .eq("status", "published")
        .or(`end_date.is.null,end_date.gt.${now}`)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as Post[];
    },
    enabled: !!cityName,
  });
};

// Public: Fetch upcoming event posts for a specific place
export const usePlaceEvents = (placeId: string | null) => {
  return useQuery({
    queryKey: ["posts", "place", placeId],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("place_id", placeId!)
        .eq("type", "event")
        .eq("status", "published")
        .gt("end_date", now)
        .order("start_date", { ascending: true })
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
