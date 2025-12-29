import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Google Places mapping for an interest
 */
export interface GoogleMapping {
  type: string;
  weight: number;
  keyword?: string;
}

/**
 * Interest category from database
 */
export interface InterestCategory {
  id: string;
  label: string;
  sort_order: number;
  icon: string | null;
}

/**
 * Interest from database
 */
export interface Interest {
  id: string;
  label: string;
  category_id: string;
  google_mappings: GoogleMapping[];
  is_active: boolean;
  sort_order: number;
}

/**
 * Interest grouped by category for UI rendering
 */
export interface InterestsByCategory {
  category: InterestCategory;
  interests: Interest[];
}

/**
 * Fetches all active interests from the database, grouped by category
 */
async function fetchInterestsCatalog(): Promise<InterestsByCategory[]> {
  const [categoriesResult, interestsResult] = await Promise.all([
    supabase
      .from('interest_categories')
      .select('*')
      .order('sort_order', { ascending: true }),
    supabase
      .from('interests')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ]);

  if (categoriesResult.error) throw categoriesResult.error;
  if (interestsResult.error) throw interestsResult.error;

  const categories = categoriesResult.data as InterestCategory[];
  // Map the jsonb google_mappings to our typed array
  const interests: Interest[] = interestsResult.data.map(row => ({
    id: row.id,
    label: row.label,
    category_id: row.category_id,
    google_mappings: (row.google_mappings as unknown as GoogleMapping[]) || [],
    is_active: row.is_active,
    sort_order: row.sort_order,
  }));

  return categories.map(category => ({
    category,
    interests: interests.filter(i => i.category_id === category.id),
  }));
}

/**
 * Fetches member interests for a specific user
 */
async function fetchMemberInterests(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('member_interests')
    .select('interest_id')
    .eq('user_id', userId);

  if (error) throw error;
  return data.map(row => row.interest_id);
}

/**
 * Fetches couple interests for a specific couple
 */
async function fetchCoupleInterests(coupleId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('couple_interests')
    .select('interest_id')
    .eq('couple_id', coupleId);

  if (error) throw error;
  return data.map(row => row.interest_id);
}

/**
 * Syncs member interests - replaces all with new selection
 */
async function syncMemberInterests(userId: string, interestIds: string[]): Promise<void> {
  // Delete existing interests
  const { error: deleteError } = await supabase
    .from('member_interests')
    .delete()
    .eq('user_id', userId);

  if (deleteError) throw deleteError;

  // Insert new interests
  if (interestIds.length > 0) {
    const rows = interestIds.map(interest_id => ({
      user_id: userId,
      interest_id,
    }));

    const { error: insertError } = await supabase
      .from('member_interests')
      .insert(rows);

    if (insertError) throw insertError;
  }
}

/**
 * Syncs couple interests - replaces all with new selection
 */
async function syncCoupleInterests(coupleId: string, interestIds: string[]): Promise<void> {
  // Delete existing interests
  const { error: deleteError } = await supabase
    .from('couple_interests')
    .delete()
    .eq('couple_id', coupleId);

  if (deleteError) throw deleteError;

  // Insert new interests
  if (interestIds.length > 0) {
    const rows = interestIds.map(interest_id => ({
      couple_id: coupleId,
      interest_id,
    }));

    const { error: insertError } = await supabase
      .from('couple_interests')
      .insert(rows);

    if (insertError) throw insertError;
  }
}

/**
 * Hook to fetch interests catalog (categories + interests)
 */
export function useInterestsCatalog() {
  return useQuery({
    queryKey: ['interests-catalog'],
    queryFn: fetchInterestsCatalog,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

/**
 * Hook to fetch and manage member interests
 */
export function useMemberInterests() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['member-interests', user?.id],
    queryFn: () => fetchMemberInterests(user!.id),
    enabled: !!user?.id,
  });

  const mutation = useMutation({
    mutationFn: (interestIds: string[]) => syncMemberInterests(user!.id, interestIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-interests', user?.id] });
    },
  });

  return {
    interests: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    syncInterests: mutation.mutateAsync,
    isSyncing: mutation.isPending,
  };
}

/**
 * Hook to fetch and manage couple interests
 */
export function useCoupleInterests(coupleId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['couple-interests', coupleId],
    queryFn: () => fetchCoupleInterests(coupleId!),
    enabled: !!coupleId,
  });

  const mutation = useMutation({
    mutationFn: (interestIds: string[]) => syncCoupleInterests(coupleId!, interestIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple-interests', coupleId] });
    },
  });

  return {
    interests: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    syncInterests: mutation.mutateAsync,
    isSyncing: mutation.isPending,
  };
}

/**
 * Get interest labels from IDs (for display purposes)
 * Requires the catalog to be loaded
 */
export function getInterestLabelsFromCatalog(
  catalog: InterestsByCategory[],
  ids: string[]
): string[] {
  const allInterests = catalog.flatMap(c => c.interests);
  return ids
    .map(id => allInterests.find(i => i.id === id)?.label)
    .filter((label): label is string => !!label);
}
