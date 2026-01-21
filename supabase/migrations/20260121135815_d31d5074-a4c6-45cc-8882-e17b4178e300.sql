-- Launch all draft cities that have at least one approved place
UPDATE public.cities
SET status = 'launched', launched_at = NOW()
WHERE status = 'draft'
  AND id IN (
    SELECT DISTINCT c.id
    FROM cities c
    WHERE EXISTS (
      SELECT 1 FROM places p
      WHERE p.city ILIKE c.name
        AND p.state = c.state
        AND p.status = 'approved'
    )
  );