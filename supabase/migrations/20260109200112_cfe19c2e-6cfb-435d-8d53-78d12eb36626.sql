-- Add unique constraint for preference_definitions upsert
ALTER TABLE preference_definitions 
ADD CONSTRAINT preference_definitions_key_domain_unique UNIQUE (preference_key, domain);