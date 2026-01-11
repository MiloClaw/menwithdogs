-- ============================================================
-- PRO CONTEXT DENSITY INTELLIGENCE - PHASE 1: SCHEMA
-- Additive tables for Pro-only place-centric context intelligence
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- TABLE 1: pro_context_definitions (Admin-managed vocabulary)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pro_context_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  domain text NOT NULL CHECK (domain IN ('demographic', 'community', 'lifestyle', 'faith', 'activity')),
  description text,
  is_sensitive boolean DEFAULT false,
  default_confidence_cap numeric NOT NULL DEFAULT 0.25 CHECK (default_confidence_cap <= 0.3),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-update updated_at trigger
CREATE TRIGGER update_pro_context_definitions_updated_at
  BEFORE UPDATE ON public.pro_context_definitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.pro_context_definitions ENABLE ROW LEVEL SECURITY;

-- Admin: Full CRUD
CREATE POLICY "Admins can manage pro_context_definitions"
  ON public.pro_context_definitions
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Users: Read active definitions only (for UI selection)
CREATE POLICY "Users can view active pro_context_definitions"
  ON public.pro_context_definitions
  FOR SELECT
  USING (is_active = true);

-- ──────────────────────────────────────────────────────────────
-- TABLE 2: place_context_priors (Admin-seeded weak priors)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.place_context_priors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  city_id uuid NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  context_key text NOT NULL REFERENCES public.pro_context_definitions(key) ON DELETE CASCADE,
  confidence numeric NOT NULL CHECK (confidence <= 0.25 AND confidence >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (place_id, context_key)
);

-- Auto-update updated_at trigger
CREATE TRIGGER update_place_context_priors_updated_at
  BEFORE UPDATE ON public.place_context_priors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for query performance
CREATE INDEX idx_place_context_priors_place_context 
  ON public.place_context_priors (place_id, context_key);
CREATE INDEX idx_place_context_priors_city_context 
  ON public.place_context_priors (city_id, context_key);

-- Enable RLS
ALTER TABLE public.place_context_priors ENABLE ROW LEVEL SECURITY;

-- Admin only: Full CRUD
CREATE POLICY "Admins can manage place_context_priors"
  ON public.place_context_priors
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- No user access - priors are internal scaffolding

-- ──────────────────────────────────────────────────────────────
-- TABLE 3: place_context_density (Anonymous aggregates, NO user IDs)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.place_context_density (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  city_id uuid NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  context_key text NOT NULL REFERENCES public.pro_context_definitions(key) ON DELETE CASCADE,
  density_score numeric NOT NULL DEFAULT 0 CHECK (density_score >= 0 AND density_score <= 1),
  meets_k_threshold boolean NOT NULL DEFAULT false,
  last_updated timestamptz DEFAULT now(),
  UNIQUE (place_id, context_key)
);

-- Indexes for query performance
CREATE INDEX idx_place_context_density_place_context 
  ON public.place_context_density (place_id, context_key);
CREATE INDEX idx_place_context_density_city_context 
  ON public.place_context_density (city_id, context_key);
CREATE INDEX idx_place_context_density_last_updated 
  ON public.place_context_density (last_updated);
-- Partial index for valid density lookups
CREATE INDEX idx_place_context_density_valid
  ON public.place_context_density (context_key, city_id)
  WHERE meets_k_threshold = true;

-- Enable RLS
ALTER TABLE public.place_context_density ENABLE ROW LEVEL SECURITY;

-- Admin: Read-only for aggregate views (no user data to see anyway)
CREATE POLICY "Admins can view place_context_density"
  ON public.place_context_density
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Service role (RPC functions) can write
-- This is handled by SECURITY DEFINER on the rebuild function

-- ──────────────────────────────────────────────────────────────
-- COMMENTS (for documentation)
-- ──────────────────────────────────────────────────────────────
COMMENT ON TABLE public.pro_context_definitions IS 
  'Admin-managed vocabulary for Pro Context Density Intelligence. Contexts are grouped by domain and map to place categories indirectly.';

COMMENT ON TABLE public.place_context_priors IS 
  'Admin-seeded weak priors for early Pro value. Applies only to Pro users, decays fastest (90-day half-life), overridden by real density.';

COMMENT ON TABLE public.place_context_density IS 
  'Anonymous, place-level context density aggregates. NO user_id column. K-anonymity enforced via meets_k_threshold. Safe to delete and recompute.';

COMMENT ON COLUMN public.place_context_density.meets_k_threshold IS 
  'True if distinct user count >= k threshold (10 default, 20 for sensitive). Raw count is NOT stored for privacy.';

COMMENT ON COLUMN public.place_context_density.density_score IS 
  'Weighted density score (0-1). Set to 0 when meets_k_threshold is false.';