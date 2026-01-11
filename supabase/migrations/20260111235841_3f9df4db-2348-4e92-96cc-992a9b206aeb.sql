-- Fix the domain constraint to allow new domains for 4-step flow
-- Drop the existing constraint and add expanded one

ALTER TABLE pro_context_definitions 
DROP CONSTRAINT IF EXISTS pro_context_definitions_domain_check;

ALTER TABLE pro_context_definitions
ADD CONSTRAINT pro_context_definitions_domain_check
CHECK (domain IN ('activity', 'lifestyle', 'faith', 'community', 'identity', 'seeking', 'intent', 'style'));