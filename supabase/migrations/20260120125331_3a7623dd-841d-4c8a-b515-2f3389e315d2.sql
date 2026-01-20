-- Add auto_launch_threshold column to cities table
ALTER TABLE public.cities
ADD COLUMN auto_launch_threshold smallint NOT NULL DEFAULT 10;

-- Add comment for documentation
COMMENT ON COLUMN public.cities.auto_launch_threshold IS 'Number of approved places required to auto-launch a draft city';