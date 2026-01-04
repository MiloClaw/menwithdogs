-- ============================================================
-- SPRINT 5: COMMUNITY SIGNALS (PRIVACY-SAFE) - FIX
-- ============================================================

-- 5.1 Create place_aggregates table
-- (using time_window instead of window which is reserved)
-- ============================================================

CREATE TABLE IF NOT EXISTS place_aggregates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  time_window text NOT NULL CHECK (time_window IN ('7d', '30d', '90d')),
  unique_savers_count int DEFAULT 0,
  save_count int DEFAULT 0,
  segment_json jsonb, -- Only populated if k-anonymous (>=25 unique savers)
  label text CHECK (label IS NULL OR label IN ('Trending', 'Popular', 'Steady')),
  computed_at timestamptz DEFAULT now(),
  UNIQUE (place_id, time_window)
);

-- Indexes for place_aggregates
CREATE INDEX IF NOT EXISTS idx_aggregates_place ON place_aggregates (place_id);
CREATE INDEX IF NOT EXISTS idx_aggregates_label ON place_aggregates (label) WHERE label IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_aggregates_time_window ON place_aggregates (time_window);

-- Enable RLS on place_aggregates
ALTER TABLE place_aggregates ENABLE ROW LEVEL SECURITY;

-- Public read for aggregates (directory shows labels)
CREATE POLICY "Anyone can read aggregates" ON place_aggregates
  FOR SELECT USING (true);

-- Admin can manage (or edge functions via service role)
CREATE POLICY "Admins can manage aggregates" ON place_aggregates
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 5.2 Create compute_place_aggregates function
-- ============================================================

CREATE OR REPLACE FUNCTION compute_place_aggregates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  K_THRESHOLD int := 25; -- Privacy threshold for k-anonymity
  window_def record;
BEGIN
  FOR window_def IN 
    SELECT '7d' as tw, interval '7 days' as duration
    UNION ALL SELECT '30d', interval '30 days'
    UNION ALL SELECT '90d', interval '90 days'
  LOOP
    INSERT INTO place_aggregates (place_id, time_window, unique_savers_count, save_count, label, segment_json, computed_at)
    SELECT 
      p.id,
      window_def.tw,
      COALESCE(agg.unique_savers, 0)::int,
      COALESCE(agg.total_saves, 0)::int,
      CASE 
        WHEN COALESCE(agg.unique_savers, 0) >= 50 THEN 'Popular'
        WHEN COALESCE(agg.unique_savers, 0) >= 10 THEN 'Trending'
        WHEN COALESCE(agg.unique_savers, 0) >= 1 THEN 'Steady'
        ELSE NULL
      END,
      -- Only include segment breakdown if k-anonymous
      CASE 
        WHEN COALESCE(agg.unique_savers, 0) >= K_THRESHOLD THEN 
          jsonb_build_object(
            'individual_count', COALESCE(agg.individual_count, 0),
            'couple_count', COALESCE(agg.couple_count, 0)
          )
        ELSE NULL
      END,
      now()
    FROM places p
    LEFT JOIN LATERAL (
      SELECT 
        COUNT(DISTINCT ua.relationship_unit_id) as unique_savers,
        COUNT(*) as total_saves,
        COUNT(DISTINCT CASE WHEN c.type = 'individual' THEN ua.relationship_unit_id END) as individual_count,
        COUNT(DISTINCT CASE WHEN c.type = 'couple' THEN ua.relationship_unit_id END) as couple_count
      FROM user_actions ua
      JOIN couples c ON c.id = ua.relationship_unit_id
      WHERE ua.place_id = p.id 
        AND ua.action_type = 'save_place'
        AND ua.created_at >= now() - window_def.duration
    ) agg ON true
    WHERE p.is_active = true
    ON CONFLICT (place_id, time_window) 
    DO UPDATE SET
      unique_savers_count = EXCLUDED.unique_savers_count,
      save_count = EXCLUDED.save_count,
      label = EXCLUDED.label,
      segment_json = EXCLUDED.segment_json,
      computed_at = EXCLUDED.computed_at;
  END LOOP;
END;
$$;