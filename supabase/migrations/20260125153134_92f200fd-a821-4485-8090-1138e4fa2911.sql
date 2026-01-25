-- Add subscription type column to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'pro';

-- Add check constraint for valid types
ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_type_check CHECK (type IN ('pro', 'event'));

-- Add event posting columns to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS posted_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS visibility_end_at timestamptz;

-- Create index for event subscription lookups
CREATE INDEX IF NOT EXISTS idx_events_stripe_subscription 
ON public.events(stripe_subscription_id) 
WHERE stripe_subscription_id IS NOT NULL;

-- Create index for user's posted events
CREATE INDEX IF NOT EXISTS idx_events_posted_by 
ON public.events(posted_by) 
WHERE posted_by IS NOT NULL;

-- RLS policy for users to view their own posted events
CREATE POLICY "Users can view own posted events"
ON public.events
FOR SELECT
USING (auth.uid() = posted_by);

-- RLS policy for users to insert their own events (as pending)
CREATE POLICY "PRO users can submit events"
ON public.events
FOR INSERT
WITH CHECK (
  auth.uid() = posted_by 
  AND status = 'pending'::event_status
  AND source = 'user_submitted'::place_source
);