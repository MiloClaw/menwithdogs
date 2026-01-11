-- Add composite index to optimize compute_user_affinity query performance
-- This index covers the most common query pattern: filtering by user_id and signal_type, ordered by created_at (for decay calculations)
CREATE INDEX IF NOT EXISTS idx_user_signals_user_type_created 
ON public.user_signals (user_id, signal_type, created_at DESC);