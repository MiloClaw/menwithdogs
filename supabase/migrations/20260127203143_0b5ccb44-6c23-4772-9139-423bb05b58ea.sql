-- Add public SELECT policy for place_niche_tags so users can see community tags
CREATE POLICY "Anyone can read niche tags"
ON public.place_niche_tags FOR SELECT
USING (true);