-- Add ambassador to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ambassador';

-- Add new columns to ambassador_applications table
ALTER TABLE public.ambassador_applications 
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS motivation text,
ADD COLUMN IF NOT EXISTS specific_places text,
ADD COLUMN IF NOT EXISTS has_business_affiliation boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS business_affiliation_details text;