import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface CanonicalTag {
  id: string;
  slug: string;
  label: string;
  category: 'culture' | 'accessibility' | 'social' | 'outdoor';
  description: string | null;
  is_sensitive: boolean;
  applicable_google_types: string[];
  is_active: boolean;
  created_at: string;
  created_by: string | null;
}

export interface PlaceTagAggregate {
  id: string;
  place_id: string;
  tag_slug: string;
  unique_taggers: number;
  meets_k_threshold: boolean;
  last_computed: string;
}

export interface TagSignal {
  id: string;
  user_id: string;
  place_id: string;
  tag_slug: string;
  action: 'add' | 'remove';
  created_at: string;
}

export interface TagSuggestion {
  id: string;
  user_id: string;
  suggested_label: string;
  suggested_category: 'culture' | 'accessibility' | 'social' | 'outdoor' | null;
  rationale: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'merged';
  reviewed_by: string | null;
  reviewed_at: string | null;
  merged_into_slug: string | null;
  created_at: string;
}

// Hook for fetching all canonical tags (admin)
export function useCanonicalTags() {
  return useQuery({
    queryKey: ['canonical-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('canonical_tags')
        .select('*')
        .order('category', { ascending: true })
        .order('label', { ascending: true });

      if (error) throw error;
      return data as CanonicalTag[];
    },
  });
}

// Hook for fetching active canonical tags (public)
export function useActiveCanonicalTags(googleTypes?: string[]) {
  return useQuery({
    queryKey: ['canonical-tags', 'active', googleTypes],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('canonical_tags')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('label', { ascending: true });

      if (error) throw error;
      
      // Filter by applicable Google types if provided
      if (googleTypes && googleTypes.length > 0) {
        return (data as CanonicalTag[]).filter(tag => 
          tag.applicable_google_types.length === 0 || 
          tag.applicable_google_types.some(t => googleTypes.includes(t))
        );
      }
      
      return data as CanonicalTag[];
    },
  });
}

// Hook for fetching place tag aggregates
export function usePlaceTagAggregates(placeId: string) {
  return useQuery({
    queryKey: ['place-tag-aggregates', placeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('place_tag_aggregates')
        .select('*, canonical_tags!inner(label, category, description)')
        .eq('place_id', placeId);

      if (error) throw error;
      return data;
    },
    enabled: !!placeId,
  });
}

// Hook for fetching user's tag signals for a place
export function useUserTagSignals(placeId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-tag-signals', placeId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('tag_signals')
        .select('*')
        .eq('place_id', placeId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TagSignal[];
    },
    enabled: !!placeId && !!user?.id,
  });
}

// Hook for submitting a tag signal
export function useSubmitTagSignal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ placeId, tagSlug, action }: { placeId: string; tagSlug: string; action: 'add' | 'remove' }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('tag_signals')
        .insert({
          user_id: user.id,
          place_id: placeId,
          tag_slug: tagSlug,
          action,
        });

      if (error) throw error;
    },
    onSuccess: (_, { placeId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-tag-signals', placeId] });
      queryClient.invalidateQueries({ queryKey: ['place-tag-aggregates', placeId] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Hook for tag suggestions (admin view)
export function useTagSuggestions(status?: string) {
  return useQuery({
    queryKey: ['tag-suggestions', status],
    queryFn: async () => {
      let query = supabase
        .from('tag_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TagSuggestion[];
    },
  });
}

// Hook for submitting a tag suggestion
export function useSubmitTagSuggestion() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      suggestedLabel, 
      suggestedCategory, 
      rationale 
    }: { 
      suggestedLabel: string; 
      suggestedCategory?: 'culture' | 'accessibility' | 'social' | 'outdoor'; 
      rationale?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('tag_suggestions')
        .insert({
          user_id: user.id,
          suggested_label: suggestedLabel,
          suggested_category: suggestedCategory,
          rationale,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tag-suggestions'] });
      toast({
        title: 'Suggestion submitted',
        description: 'Thank you for helping improve the community tags!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Admin: Create canonical tag
export function useCreateCanonicalTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tag: Omit<CanonicalTag, 'id' | 'created_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('canonical_tags')
        .insert(tag)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canonical-tags'] });
      toast({ title: 'Tag created successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Error creating tag',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Admin: Update canonical tag
export function useUpdateCanonicalTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CanonicalTag> & { id: string }) => {
      const { data, error } = await supabase
        .from('canonical_tags')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canonical-tags'] });
      toast({ title: 'Tag updated successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Error updating tag',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Admin: Review tag suggestion
export function useReviewTagSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      mergedIntoSlug 
    }: { 
      id: string; 
      status: 'approved' | 'rejected' | 'merged'; 
      mergedIntoSlug?: string;
    }) => {
      const { error } = await supabase
        .from('tag_suggestions')
        .update({
          status,
          merged_into_slug: mergedIntoSlug,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tag-suggestions'] });
      toast({ title: 'Suggestion reviewed' });
    },
    onError: (error) => {
      toast({
        title: 'Error reviewing suggestion',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Admin: Compute tag aggregates
export function useComputeTagAggregates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('compute_tag_aggregates');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['place-tag-aggregates'] });
      toast({ title: 'Tag aggregates recomputed' });
    },
    onError: (error) => {
      toast({
        title: 'Error computing aggregates',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
