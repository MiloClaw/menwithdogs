-- Phase 2: Storage Bucket for Couple Photos

-- Create the couple-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('couple-photos', 'couple-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Couples can upload their own photos (folder per couple_id)
CREATE POLICY "Couples can upload own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'couple-photos' AND
  (storage.foldername(name))[1] = get_user_couple_id(auth.uid())::text
);

-- Couples can update their own photos
CREATE POLICY "Couples can update own photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'couple-photos' AND
  (storage.foldername(name))[1] = get_user_couple_id(auth.uid())::text
);

-- Couples can delete their own photos
CREATE POLICY "Couples can delete own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'couple-photos' AND
  (storage.foldername(name))[1] = get_user_couple_id(auth.uid())::text
);

-- Public read access (blur/reveal handled in application layer)
CREATE POLICY "Public read access for couple photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'couple-photos');