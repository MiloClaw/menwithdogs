COMMENT ON FUNCTION public.compute_user_affinity IS 
'Recomputes user affinity scores from raw signals. 

SIGNAL WEIGHTS (canonical):
- save_place: 1.0 (strong positive)
- click_external: 0.5 (active engagement)
- filter_category: 0.4 (active interest)
- view_place: 0.3 (passive)
- explicit_preference: 0.8 (user stated)
- event_save: 0.6 (strong, mapped to venue)
- event_view: 0.2 (passive, mapped to venue)
- unsave_place: -0.5 (negative feedback)

INVARIANTS:
- This function can be safely re-run at any time
- Output is disposable and can be deleted/rebuilt
- Weights may be tuned without schema changes
- No filtering occurs here - only scoring';