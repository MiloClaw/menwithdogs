-- ═══════════════════════════════════════════════════════════════
-- Nightly Scheduled Job for Pro Context Density Rebuild
-- Runs daily at 3:00 AM UTC for all launched cities
-- ═══════════════════════════════════════════════════════════════

-- Step 1: Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Step 2: Create monitoring table for job runs
CREATE TABLE IF NOT EXISTS public.cron_job_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  cities_processed int,
  status text DEFAULT 'running',
  error_message text
);

-- Enable RLS (admin-only access)
ALTER TABLE public.cron_job_runs ENABLE ROW LEVEL SECURITY;

-- Admin can view job runs
CREATE POLICY "Admins can view cron job runs"
ON public.cron_job_runs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Step 3: Create wrapper function with logging
CREATE OR REPLACE FUNCTION public.nightly_rebuild_context_density()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _city record;
  _cities_processed int := 0;
  _run_id uuid;
BEGIN
  -- Log job start
  INSERT INTO cron_job_runs (job_name, status)
  VALUES ('nightly-context-density-rebuild', 'running')
  RETURNING id INTO _run_id;
  
  BEGIN
    -- Iterate through all launched cities
    FOR _city IN 
      SELECT id, name FROM cities WHERE status = 'launched'
    LOOP
      PERFORM rebuild_place_context_density(_city.id);
      _cities_processed := _cities_processed + 1;
    END LOOP;
    
    -- Log success
    UPDATE cron_job_runs 
    SET completed_at = now(), 
        cities_processed = _cities_processed, 
        status = 'completed'
    WHERE id = _run_id;
    
  EXCEPTION WHEN OTHERS THEN
    -- Log failure
    UPDATE cron_job_runs 
    SET completed_at = now(), 
        status = 'failed', 
        error_message = SQLERRM
    WHERE id = _run_id;
    RAISE;
  END;
END;
$$;

-- Step 4: Schedule the nightly job at 3:00 AM UTC
SELECT cron.schedule(
  'nightly-context-density-rebuild',
  '0 3 * * *',
  $$SELECT public.nightly_rebuild_context_density()$$
);