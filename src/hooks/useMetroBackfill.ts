import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AssignmentResult {
  place_id: string;
  place_name: string;
  city: string;
  state: string;
  metro_name: string | null;
  status: "assigned" | "skipped_no_coords" | "skipped_no_county" | "skipped_no_metro" | "error";
  error?: string;
}

interface BackfillResponse {
  success: boolean;
  dry_run: boolean;
  batch_size: number;
  processed: number;
  assigned: number;
  skipped_no_coords: number;
  skipped_no_county: number;
  skipped_no_metro: number;
  errors: number;
  remaining: number;
  assignments: AssignmentResult[];
}

interface BackfillOptions {
  batch_size?: number;
  dry_run?: boolean;
}

export function useMetroBackfill() {
  const queryClient = useQueryClient();

  const runBackfill = useMutation({
    mutationFn: async (options: BackfillOptions = {}): Promise<BackfillResponse> => {
      const { data, error } = await supabase.functions.invoke("backfill-place-metros", {
        body: {
          batch_size: options.batch_size ?? 30,
          dry_run: options.dry_run ?? false,
        },
      });

      if (error) {
        throw new Error(error.message || "Backfill failed");
      }

      return data as BackfillResponse;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      queryClient.invalidateQueries({ queryKey: ["metros"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });

      if (data.dry_run) {
        toast.info(`Dry run complete: ${data.assigned} places would be assigned metros`);
      } else {
        toast.success(`Backfill complete: ${data.assigned} places assigned metros`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Backfill failed: ${error.message}`);
    },
  });

  return {
    runBackfill: runBackfill.mutate,
    runBackfillAsync: runBackfill.mutateAsync,
    isRunning: runBackfill.isPending,
    lastResult: runBackfill.data,
    error: runBackfill.error,
  };
}
