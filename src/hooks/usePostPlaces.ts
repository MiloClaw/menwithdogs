import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LinkedPlace {
  id: string;
  place_id: string;
  name: string;
  city: string | null;
  state: string | null;
  primary_category: string;
  sort_order: number;
  context_note: string | null;
}

// Fetch places linked to a post
export const usePostPlaces = (postId: string | null) => {
  return useQuery({
    queryKey: ["post-places", postId],
    queryFn: async () => {
      if (!postId) return [];

      const { data, error } = await supabase
        .from("post_places")
        .select(`
          id,
          place_id,
          sort_order,
          context_note,
          place:places!post_places_place_id_fkey(
            id,
            name,
            city,
            state,
            primary_category
          )
        `)
        .eq("post_id", postId)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      return (data || []).map((row) => ({
        id: row.id,
        place_id: row.place_id,
        name: (row.place as any)?.name || "",
        city: (row.place as any)?.city || null,
        state: (row.place as any)?.state || null,
        primary_category: (row.place as any)?.primary_category || "",
        sort_order: row.sort_order,
        context_note: row.context_note,
      })) as LinkedPlace[];
    },
    enabled: !!postId,
  });
};

// Sync post places (similar to syncPostTags)
export const syncPostPlaces = async (
  postId: string,
  places: { place_id: string; sort_order: number; context_note?: string }[]
) => {
  // Delete existing links
  const { error: deleteError } = await supabase
    .from("post_places")
    .delete()
    .eq("post_id", postId);

  if (deleteError) throw deleteError;

  // Insert new links
  if (places.length > 0) {
    const { error: insertError } = await supabase.from("post_places").insert(
      places.map((p) => ({
        post_id: postId,
        place_id: p.place_id,
        sort_order: p.sort_order,
        context_note: p.context_note || null,
      }))
    );

    if (insertError) throw insertError;
  }
};
