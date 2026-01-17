-- Add founders promo code columns to cities table
ALTER TABLE public.cities
  ADD COLUMN IF NOT EXISTS founders_promo_code text,
  ADD COLUMN IF NOT EXISTS founders_promo_code_id text,
  ADD COLUMN IF NOT EXISTS founders_slots_total smallint DEFAULT 100,
  ADD COLUMN IF NOT EXISTS founders_slots_used smallint DEFAULT 0;

-- Create founders_redemptions tracking table
CREATE TABLE IF NOT EXISTS public.founders_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  city_id uuid REFERENCES public.cities(id) ON DELETE SET NULL,
  couple_id uuid REFERENCES public.couples(id) ON DELETE SET NULL,
  stripe_subscription_id text,
  stripe_promo_code_id text,
  redeemed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

-- Index for city-level queries
CREATE INDEX IF NOT EXISTS idx_founders_redemptions_city ON public.founders_redemptions(city_id);
CREATE INDEX IF NOT EXISTS idx_founders_redemptions_couple ON public.founders_redemptions(couple_id);

-- Enable RLS
ALTER TABLE public.founders_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own redemption"
  ON public.founders_redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all redemptions"
  ON public.founders_redemptions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert redemptions"
  ON public.founders_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Comment for documentation
COMMENT ON TABLE public.founders_redemptions IS 'Tracks founders membership redemptions - one per user ever, linked to launch city';