-- Add unique index to admin_dashboard_stats so we can refresh concurrently
-- The view returns a single row with computed_at as the unique identifier
CREATE UNIQUE INDEX IF NOT EXISTS admin_dashboard_stats_computed_at_idx 
ON admin_dashboard_stats (computed_at);

-- Document deprecated signal types on user_signals table
COMMENT ON TABLE user_signals IS 
'User signals for intelligence layer. Append-only source of truth for user behavior.

ACTIVE SIGNAL TYPES:
- pro_selection: Pro settings selections (current standard for paid tuning)
- explicit_preference: User-stated preferences
- filter_category: Category filter usage
- view_place, save_place, unsave_place: Place interactions
- view_event, save_event, unsave_event: Event interactions
- view_blog_post: Content engagement
- click_external: External link clicks
- city_suggestion_redirected: Metro redirect tracking

DEPRECATED (retained for audit, excluded from new interpretation logic):
- pro_context: Replaced by pro_selection (2026-01)
- context_self_selected: Replaced by pro_selection (2026-01)
- activity_pattern: Replaced by pro_selection (2026-01)';