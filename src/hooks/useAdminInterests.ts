import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GoogleMapping {
  type: string;
  weight: number;
  keyword?: string;
}

export interface Interest {
  id: string;
  label: string;
  category_id: string;
  google_mappings: GoogleMapping[];
  is_active: boolean | null;
  sort_order: number | null;
  created_at: string | null;
}

export interface InterestCategory {
  id: string;
  label: string;
  sort_order: number | null;
  icon: string | null;
}

export interface InterestWithCategory extends Interest {
  category?: InterestCategory;
}

interface UpdateInterestParams {
  id: string;
  label?: string;
  category_id?: string;
  sort_order?: number;
  is_active?: boolean;
  google_mappings?: GoogleMapping[];
}

/**
 * Fetches ALL interests (including inactive) for admin management
 */
async function fetchAllInterests(): Promise<InterestWithCategory[]> {
  const [interestsResult, categoriesResult] = await Promise.all([
    supabase
      .from('interests')
      .select('*')
      .order('sort_order', { ascending: true }),
    supabase
      .from('interest_categories')
      .select('*')
      .order('sort_order', { ascending: true }),
  ]);

  if (interestsResult.error) throw interestsResult.error;
  if (categoriesResult.error) throw categoriesResult.error;

  const categories = categoriesResult.data as InterestCategory[];
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  return interestsResult.data.map(row => ({
    id: row.id,
    label: row.label,
    category_id: row.category_id,
    google_mappings: (row.google_mappings as unknown as GoogleMapping[]) || [],
    is_active: row.is_active,
    sort_order: row.sort_order,
    created_at: row.created_at,
    category: categoryMap.get(row.category_id),
  }));
}

/**
 * Fetches all interest categories for admin management
 */
async function fetchAllCategories(): Promise<InterestCategory[]> {
  const { data, error } = await supabase
    .from('interest_categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data as InterestCategory[];
}

/**
 * Updates an interest
 */
async function updateInterest(params: UpdateInterestParams): Promise<void> {
  const { id, google_mappings, ...otherUpdates } = params;
  
  // Cast google_mappings to Json type for Supabase
  const updates: Record<string, unknown> = { ...otherUpdates };
  if (google_mappings !== undefined) {
    updates.google_mappings = google_mappings as unknown;
  }
  
  const { error } = await supabase
    .from('interests')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

/**
 * Hook for admin interest management
 */
export function useAdminInterests() {
  const queryClient = useQueryClient();

  const interestsQuery = useQuery({
    queryKey: ['admin-interests'],
    queryFn: fetchAllInterests,
  });

  const categoriesQuery = useQuery({
    queryKey: ['admin-interest-categories'],
    queryFn: fetchAllCategories,
  });

  const updateMutation = useMutation({
    mutationFn: updateInterest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-interests'] });
      queryClient.invalidateQueries({ queryKey: ['interests-catalog'] });
    },
  });

  return {
    interests: interestsQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    isLoading: interestsQuery.isLoading || categoriesQuery.isLoading,
    error: interestsQuery.error || categoriesQuery.error,
    updateInterest: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

/**
 * Get usage counts for interests (how many members/couples use each)
 */
export function useInterestUsageCounts() {
  return useQuery({
    queryKey: ['interest-usage-counts'],
    queryFn: async () => {
      const [memberResult, coupleResult] = await Promise.all([
        supabase
          .from('member_interests')
          .select('interest_id'),
        supabase
          .from('couple_interests')
          .select('interest_id'),
      ]);

      if (memberResult.error) throw memberResult.error;
      if (coupleResult.error) throw coupleResult.error;

      // Count occurrences
      const memberCounts = new Map<string, number>();
      const coupleCounts = new Map<string, number>();

      memberResult.data.forEach(row => {
        memberCounts.set(row.interest_id, (memberCounts.get(row.interest_id) || 0) + 1);
      });

      coupleResult.data.forEach(row => {
        coupleCounts.set(row.interest_id, (coupleCounts.get(row.interest_id) || 0) + 1);
      });

      return { memberCounts, coupleCounts };
    },
  });
}
