CREATE OR REPLACE FUNCTION public.normalize_clip_url(value text)
RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE SET search_path TO '' AS $$
  SELECT CASE WHEN m IS NULL THEN btrim(split_part(value, '#', 1))
    ELSE lower(m[1]) || COALESCE(NULLIF(rtrim(m[2], '/'), ''), '') || COALESCE(m[3], '') END
  FROM (SELECT regexp_match(btrim(split_part(value, '#', 1)), '^([a-zA-Z][a-zA-Z0-9+.-]*://[^/?]*)([^?]*)(\?.*)?$') AS m) s
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.submissions
    GROUP BY campaign_id, clipper_id, public.normalize_clip_url(clip_url)
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate submissions exist; resolve them before adding the unique index';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS submissions_unique_clip
  ON public.submissions (campaign_id, clipper_id, public.normalize_clip_url(clip_url));