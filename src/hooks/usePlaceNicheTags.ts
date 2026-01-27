import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface PlaceNicheTag {
  id: string;
  place_id: string;
  tag: string;
  confidence: number | null;
  evidence_type: string | null;
  evidence_ref: string | null;
  created_at: string | null;
  updated_at: string | null;
  canonical_tags?: {
    label: string;
    slug: string;
    has_page: boolean | null;
  } | null;
}

/**
 * Fetch niche tags for a specific place with canonical tag info
 */
export function usePlaceNicheTags(placeId: string | undefined) {
  return useQuery({
    queryKey: ['place-niche-tags', placeId],
    queryFn: async () => {
      if (!placeId) return [];
      
      // Fetch niche tags
      const { data: nicheTags, error: nicheError } = await supabase
        .from('place_niche_tags')
        .select('*')
        .eq('place_id', placeId)
        .order('created_at', { ascending: false });

      if (nicheError) throw nicheError;
      if (!nicheTags || nicheTags.length === 0) return [];

      // Fetch canonical tags for these niche tags
      const tagSlugs = nicheTags.map(nt => nt.tag);
      const { data: canonicalTags, error: canonicalError } = await supabase
        .from('canonical_tags')
        .select('slug, label, has_page')
        .in('slug', tagSlugs);

      if (canonicalError) throw canonicalError;

      // Merge the data
      const canonicalMap = new Map(canonicalTags?.map(ct => [ct.slug, ct]) ?? []);
      
      return nicheTags.map(nt => ({
        ...nt,
        canonical_tags: canonicalMap.get(nt.tag) ?? null,
      })) as PlaceNicheTag[];
    },
    enabled: !!placeId,
  });
}

/**
 * Admin: Apply a tag to a place
 */
export function useApplyPlaceTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      placeId, 
      tag, 
      evidenceRef 
    }: { 
      placeId: string; 
      tag: string; 
      evidenceRef?: string;
    }) => {
      const { data, error } = await supabase
        .from('place_niche_tags')
        .insert({
          place_id: placeId,
          tag,
          confidence: 1.0,
          evidence_type: 'admin_approved',
          evidence_ref: evidenceRef,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { placeId }) => {
      queryClient.invalidateQueries({ queryKey: ['place-niche-tags', placeId] });
      toast({ title: 'Tag applied successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Error applying tag',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Admin: Remove a tag from a place
 */
export function useRemovePlaceTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tagId, placeId }: { tagId: string; placeId: string }) => {
      const { error } = await supabase
        .from('place_niche_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;
      return { placeId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['place-niche-tags', data.placeId] });
      toast({ title: 'Tag removed' });
    },
    onError: (error) => {
      toast({
        title: 'Error removing tag',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
