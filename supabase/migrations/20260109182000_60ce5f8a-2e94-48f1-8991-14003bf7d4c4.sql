-- DRIFT-LOCK CLEANUP: Drop unused social enums
-- These enums were artifacts of social-network features that violate the canonical instructions.
-- Reference: MATCH APP — CANONICAL INSTRUCTIONS (DRIFT-LOCKED)

-- Drop the unused social enums
DROP TYPE IF EXISTS public.presence_status;
DROP TYPE IF EXISTS public.reveal_context;
DROP TYPE IF EXISTS public.reveal_state;

-- Document the cleanup
COMMENT ON SCHEMA public IS 
'MainStreetIRL public schema. 
DRIFT-LOCK NOTE: Social enums (presence_status, reveal_context, reveal_state) 
were dropped as unused artifacts. Do NOT recreate.';